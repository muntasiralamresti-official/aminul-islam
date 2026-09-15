"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronLeft, RefreshCw, Search } from "lucide-react";
import Link from "next/link";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PAYMENT_METHODS = ["cash", "bkash", "nagad", "bank"];
const money = (value) => `\u09F3 ${Number(value || 0).toLocaleString("en-BD")}`;

export default function EditPaymentPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    student: "", month: "", year: "", amount: "", method: "cash", status: "paid", date: "",
  });

  const [modalStudentSearch, setModalStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentSummary, setSelectedStudentSummary] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/students?all=true").then(res => res.json()),
      fetch(`/api/payments/${id}`).then(res => res.json())
    ]).then(([studentsData, paymentData]) => {
      const studentList = Array.isArray(studentsData) ? studentsData : studentsData.students || [];
      setStudents(studentList);
      
      if (paymentData && paymentData._id) {
        setFormData({
          student: paymentData.student?._id || paymentData.student || "",
          month: paymentData.month || "",
          year: paymentData.year || "",
          amount: paymentData.amount || "",
          method: paymentData.method || "cash",
          status: paymentData.status || "paid",
          date: paymentData.date ? new Date(paymentData.date).toISOString().slice(0, 10) : "",
        });
      } else {
        toast.error("Payment record not found");
        router.push("/dashboard/fees");
      }
    })
    .catch(() => toast.error("Failed to load data"))
    .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!formData.student) {
      setSelectedStudentSummary(null);
      return;
    }
    fetch(`/api/fees/student/${formData.student}`)
      .then((res) => res.json())
      .then((data) => setSelectedStudentSummary(data))
      .catch(() => setSelectedStudentSummary(null));
  }, [formData.student]);

  const filteredModalStudents = students.filter((s) => {
    const q = modalStudentSearch.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.rollNumber?.toLowerCase().includes(q);
  });

  const selectedStudentObj = students.find((s) => s._id === formData.student);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.student) return toast.error("Please select a student");
    if (!formData.amount || Number(formData.amount) <= 0) return toast.error("Please enter a valid amount");

    setSaving(true);
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update payment");

      toast.success("Payment updated successfully");
      router.push("/dashboard/fees");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/fees" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Edit Payment</h1>
            <p className="mt-1 text-sm text-gray-500">Update payment record details</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Select Student</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or roll number..."
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
              {showStudentDropdown && filteredModalStudents.length === 0 && (
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Month</label>
              <select
                value={formData.month}
                onChange={(event) => setFormData((current) => ({ ...current, month: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Amount</label>
              <input
                required
                min="1"
                step="0.01"
                type="number"
                value={formData.amount}
                onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))}
                placeholder="e.g. 1000"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Payment Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Payment Method</label>
              <select
                value={formData.method}
                onChange={(event) => setFormData((current) => ({ ...current, method: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm capitalize text-gray-900"
              >
                {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"
              >
                <option value="paid">Paid</option>
                <option value="due">Due / Not Collected</option>
              </select>
            </div>
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
              className="inline-flex min-h-12 min-w-40 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition disabled:cursor-wait disabled:opacity-70"
            >
              {saving && <RefreshCw className="h-5 w-5 animate-spin" />}
              {saving ? "Saving..." : "Update Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
