"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronLeft, RefreshCw, Check, CalendarRange, Sparkles, X } from "lucide-react";
import Link from "next/link";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAYMENT_METHODS = ["cash", "bkash", "nagad", "bank"];
const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;
const todayInput = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultStudentId = searchParams.get("student") || "";

  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  const now = new Date();
  const currentMonthName = MONTHS[now.getMonth()];
  const currentYear = now.getFullYear();

  const [isMultiMonth, setIsMultiMonth] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([currentMonthName]);

  const [formData, setFormData] = useState({
    student: defaultStudentId,
    month: currentMonthName,
    year: currentYear,
    amount: "",
    discount: "",
    method: "cash",
    status: "paid",
    date: todayInput(),
  });

  const [modalStudentSearch, setModalStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentSummary, setSelectedStudentSummary] = useState(null);

  useEffect(() => {
    fetch("/api/students?all=true")
      .then((res) => res.json())
      .then((data) => {
        const studentList = Array.isArray(data) ? data : data.students || [];
        setStudents(studentList);
        
        if (defaultStudentId) {
          const s = studentList.find(x => x._id === defaultStudentId);
          if (s) {
            setFormData(prev => ({ ...prev, amount: s.currentDue > 0 ? s.currentDue : (s.monthlyFee || "") }));
          }
        }
      })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoadingStudents(false));
  }, [defaultStudentId]);

  // Fetch student fee summary whenever student or year changes
  useEffect(() => {
    if (!formData.student) {
      setSelectedStudentSummary(null);
      return;
    }
    fetch(`/api/fees/student/${formData.student}?year=${formData.year}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedStudentSummary(data);
        if (!isMultiMonth) {
          setFormData(prev => {
            if (!prev.amount) {
              return { ...prev, amount: data.totalOutstanding > 0 ? data.totalOutstanding : (data.student?.monthlyFee || "") };
            }
            return prev;
          });
        }
      })
      .catch(() => setSelectedStudentSummary(null));
  }, [formData.student, formData.year, isMultiMonth]);

  const filteredModalStudents = students.filter((s) => {
    const q = modalStudentSearch.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.rollNumber?.toLowerCase().includes(q);
  });

  const selectedStudentObj = students.find((s) => s._id === formData.student);
  const monthlyFee = Number(selectedStudentSummary?.student?.monthlyFee || selectedStudentObj?.monthlyFee || 0);

  // Toggle a month in multiple selection
  const toggleMonth = (m) => {
    let updated;
    if (selectedMonths.includes(m)) {
      updated = selectedMonths.filter(x => x !== m);
    } else {
      // Keep months in chronological order
      updated = MONTHS.filter(x => selectedMonths.includes(x) || x === m);
    }
    setSelectedMonths(updated);
    if (monthlyFee > 0 && updated.length > 0) {
      setFormData(prev => ({ ...prev, amount: monthlyFee * updated.length }));
    }
  };

  // Quick select actions
  const selectNextMonths = (count) => {
    const startIdx = now.getMonth();
    const targetMonths = [];
    for (let i = 0; i < count; i++) {
      const idx = (startIdx + i) % 12;
      targetMonths.push(MONTHS[idx]);
    }
    const updated = MONTHS.filter(x => targetMonths.includes(x));
    setSelectedMonths(updated);
    if (monthlyFee > 0) {
      setFormData(prev => ({ ...prev, amount: monthlyFee * updated.length }));
    }
  };

  const selectRestOfYear = () => {
    const startIdx = now.getMonth();
    const updated = MONTHS.slice(startIdx);
    setSelectedMonths(updated);
    if (monthlyFee > 0) {
      setFormData(prev => ({ ...prev, amount: monthlyFee * updated.length }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.student) return toast.error("Please select a student");
    
    if (isMultiMonth) {
      if (!selectedMonths.length) {
        return toast.error("Please select at least one month for advance payment");
      }
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setSaving(true);
    try {
      const payload = isMultiMonth
        ? { ...formData, months: selectedMonths }
        : formData;

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      toast.success(
        isMultiMonth
          ? `Payment recorded for ${selectedMonths.length} months successfully!`
          : "Payment recorded successfully!"
      );
      router.push("/dashboard/fees");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/fees" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Record Payment</h1>
            <p className="mt-1 text-sm text-gray-500">Add regular or multi-month advance fee collection</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STUDENT SELECTION */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Select Student</label>
            <div className="relative">
              <input
                type="text"
                placeholder={loadingStudents ? "Loading students..." : "Search by name or roll number..."}
                disabled={loadingStudents}
                value={showStudentDropdown ? modalStudentSearch : (selectedStudentObj ? `${selectedStudentObj.name} (${selectedStudentObj.rollNumber})` : "")}
                onChange={(event) => {
                  setModalStudentSearch(event.target.value);
                  setShowStudentDropdown(true);
                  if (!event.target.value) setFormData((current) => ({ ...current, student: "" }));
                }}
                onFocus={() => { setShowStudentDropdown(true); }}
                onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoComplete="off"
              />
              {showStudentDropdown && filteredModalStudents.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                  {filteredModalStudents.map((student) => (
                    <button
                      key={student._id}
                      type="button"
                      onMouseDown={() => {
                        setFormData((current) => ({
                          ...current,
                          student: student._id,
                          amount: student.currentDue > 0 ? student.currentDue : (student.monthlyFee || "")
                        }));
                        setModalStudentSearch("");
                        setShowStudentDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm transition-colors hover:bg-blue-50 ${formData.student === student._id ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-900"}`}
                    >
                      <span>{student.name}</span>
                      <span className="text-xs text-gray-400">Roll: {student.rollNumber}</span>
                    </button>
                  ))}
                </div>
              )}
              {showStudentDropdown && filteredModalStudents.length === 0 && !loadingStudents && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-xl">
                  No student found.
                </div>
              )}
            </div>
            
            {selectedStudentSummary && (
              <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <div>Monthly<br /><strong className="text-gray-900">{money(selectedStudentSummary.student?.monthlyFee || 0)}</strong></div>
                <div>Total due<br /><strong className="text-blue-700">{money(selectedStudentSummary.totalOutstanding || 0)}</strong></div>
                <div>Previous due<br /><strong className="text-amber-700">{money(selectedStudentSummary.previousDue || 0)}</strong></div>
              </div>
            )}
          </div>

          {/* MODE SWITCHER: SINGLE MONTH VS ADVANCE / MULTI MONTH */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Type</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsMultiMonth(false);
                  if (monthlyFee > 0 && (!formData.amount || formData.amount == monthlyFee * selectedMonths.length)) {
                    setFormData(prev => ({ ...prev, amount: monthlyFee }));
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-center text-sm font-bold transition ${!isMultiMonth ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                <span>Single Month</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMultiMonth(true);
                  if (selectedMonths.length === 0) {
                    setSelectedMonths([formData.month]);
                  }
                  if (monthlyFee > 0) {
                    const count = selectedMonths.length || 1;
                    setFormData(prev => ({ ...prev, amount: monthlyFee * count }));
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-center text-sm font-bold transition ${isMultiMonth ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Multiple / Advance Months</span>
              </button>
            </div>
          </div>

          {/* SINGLE MONTH SELECTOR */}
          {!isMultiMonth && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Month</label>
                <select
                  value={formData.month}
                  onChange={(event) => setFormData((current) => ({ ...current, month: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500"
                >
                  {MONTHS.map((month) => <option key={month}>{month}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Year</label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={(event) => setFormData((current) => ({ ...current, year: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* MULTI MONTH / ADVANCE MONTH SELECTOR */}
          {isMultiMonth && (
            <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                    <CalendarRange className="h-4 w-4 text-blue-600" /> Select Months for {formData.year}
                  </h3>
                  <p className="text-xs text-gray-500">Click on months to select multiple or advance fees</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-600">Year:</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={(event) => setFormData((current) => ({ ...current, year: Number(event.target.value) }))}
                    className="w-24 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 outline-none"
                  />
                </div>
              </div>

              {/* QUICK SELECTION PILLS */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Quick Select:</span>
                <button
                  type="button"
                  onClick={() => selectNextMonths(2)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                >
                  + Next 2 Months
                </button>
                <button
                  type="button"
                  onClick={() => selectNextMonths(3)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                >
                  + Next 3 Months
                </button>
                <button
                  type="button"
                  onClick={selectRestOfYear}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                >
                  + Rest of {formData.year}
                </button>
                {selectedMonths.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonths([]);
                      setFormData(prev => ({ ...prev, amount: "" }));
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>

              {/* MONTH BUTTONS GRID */}
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                {MONTHS.map((m, idx) => {
                  const isSelected = selectedMonths.includes(m);
                  const mSummary = selectedStudentSummary?.months?.find((item) => item.month === m);
                  const isPaid = mSummary?.status === "paid" || mSummary?.status === "advance-paid";
                  const hasDue = mSummary && mSummary.due > 0;
                  const isCurrent = m === currentMonthName && formData.year === currentYear;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonth(m)}
                      className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50 text-blue-900 shadow-sm"
                          : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <span className="text-sm font-bold">{SHORT_MONTHS[idx]}</span>
                      <span className="text-[10px] text-gray-400">{m}</span>

                      {/* Small Status tags */}
                      {isPaid && (
                        <span className="mt-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                          Paid ?
                        </span>
                      )}
                      {!isPaid && hasDue && (
                        <span className="mt-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
                          Due
                        </span>
                      )}
                      {isCurrent && !isPaid && !hasDue && (
                        <span className="mt-1 rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SELECTION SUMMARY & AUTO-CALCULATE */}
              <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 sm:flex-row sm:items-center sm:justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-950">
                    Selected: {selectedMonths.length} Months
                  </span>
                  <p className="mt-0.5 text-blue-800">
                    {selectedMonths.length > 0 ? selectedMonths.join(", ") : "No month selected"}
                  </p>
                </div>
                {monthlyFee > 0 && selectedMonths.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: monthlyFee * selectedMonths.length }))}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
                  >
                    <span>Auto-fill: {money(monthlyFee * selectedMonths.length)}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* AMOUNT, DISCOUNT, DATE */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Amount Paid (?)
                {isMultiMonth && selectedMonths.length > 1 && (
                  <span className="ml-1 text-xs font-normal text-blue-600">
                    (Will be evenly split across {selectedMonths.length} months)
                  </span>
                )}
              </label>
              <input
                required
                min="1"
                step="0.01"
                type="number"
                value={formData.amount}
                onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))}
                placeholder="e.g. 1000"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Discount / Waiver (?)</label>
              <input
                min="0"
                step="0.01"
                type="number"
                value={formData.discount}
                onChange={(event) => setFormData((current) => ({ ...current, discount: event.target.value }))}
                placeholder="Optional discount"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Payment Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Payment Method</label>
              <select
                value={formData.method}
                onChange={(event) => setFormData((current) => ({ ...current, method: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm capitalize text-gray-900 outline-none focus:border-blue-500"
              >
                {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="paid">Paid</option>
              <option value="due">Due / Not Collected</option>
            </select>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/dashboard/fees"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 min-w-44 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition disabled:cursor-wait disabled:opacity-70 hover:bg-blue-700"
            >
              {saving && <RefreshCw className="h-5 w-5 animate-spin" />}
              {saving ? "Saving..." : isMultiMonth ? `Record ${selectedMonths.length} Months Fee` : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
