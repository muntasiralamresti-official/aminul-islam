"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Wallet, CircleDollarSign, AlertCircle, CheckCircle2, Clock3, History, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/LoadingSkeleton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PAYMENT_METHODS = ["cash", "bkash", "nagad", "bank"];
const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

export default function FeesPage() {
  const router = useRouter();
  const now = new Date();
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [batchFilter, setBatchFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyDate, setHistoryDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    student: "",
    month: MONTHS[now.getMonth()],
    year: now.getFullYear(),
    amount: "",
    method: "cash",
    status: "paid",
  });

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, paymentsRes, studentsRes, batchesRes] = await Promise.all([
        fetch(`/api/fees/summary?month=${encodeURIComponent(selectedMonth)}&year=${selectedYear}`),
        fetch("/api/payments"),
        fetch("/api/students?all=true"),
        fetch("/api/batches"),
      ]);
      const [summaryData, paymentsData, studentsData, batchesData] = await Promise.all([
        summaryRes.json(), paymentsRes.json(), studentsRes.json(), batchesRes.json(),
      ]);
      if (!summaryRes.ok) throw new Error(summaryData.error || "Failed to load fee summary");
      if (!paymentsRes.ok) throw new Error(paymentsData.error || "Failed to load payment history");
      if (!studentsRes.ok) throw new Error(studentsData.error || "Failed to load students");
      if (!batchesRes.ok) throw new Error(batchesData.error || "Failed to load batches");
      setSummary(summaryData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
    } catch (err) {
      setError(err.message || "Failed to load fees");
      toast.error(err.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (month, year) => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/fees/summary?month=${encodeURIComponent(month)}&year=${year}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load fee summary");
      setSummary(data);
    } catch (err) {
      toast.error(err.message || "Failed to load fee summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!summary) return;
    fetchSummary(selectedMonth, selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const filteredStudents = useMemo(() => {
    const rows = summary?.students || [];
    const query = studentSearch.trim().toLowerCase();
    return rows.filter((student) => {
      if (batchFilter && student.batch?._id !== batchFilter) return false;
      if (studentFilter && student._id !== studentFilter) return false;
      if (!query) return true;
      return student.name?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query) ||
        student.batch?.name?.toLowerCase().includes(query);
    });
  }, [summary, batchFilter, studentFilter, studentSearch]);

  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    return payments
      .filter((payment) => payment.month === selectedMonth && Number(payment.year) === Number(selectedYear))
      .filter((payment) => {
        if (historyDate && new Date(payment.date).toISOString().split("T")[0] !== historyDate) return false;
        if (!query) return true;
        const name = payment.student?.name?.toLowerCase() || "";
        const roll = payment.student?.rollNumber?.toLowerCase() || "";
        return name.includes(query) || roll.includes(query);
      });
  }, [payments, selectedMonth, selectedYear, historySearch, historyDate]);

  const openNewPaymentModal = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({ student: "", month: selectedMonth, year: selectedYear, amount: "", method: "cash", status: "paid" });
    setShowModal(true);
  };

  const openEditModal = (payment) => {
    setEditMode(true);
    setEditingId(payment._id);
    setFormData({
      student: payment.student?._id || "",
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Deleting payment...");
    try {
      const res = await fetch(`/api/payments/${deleteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete payment");
      toast.success("Payment deleted", { id: toastId });
      setDeleteId(null);
      await fetchInitialData();
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Error deleting payment", { id: toastId });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(formData.amount);
    if (!formData.student) return toast.error("Please select a student");
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Please enter a valid payment amount");

    const toastId = toast.loading(editMode ? "Updating payment..." : "Recording payment...");
    try {
      const url = editMode ? `/api/payments/${editingId}` : "/api/payments";
      const res = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save payment");
      toast.success(editMode ? "Payment updated" : "Payment recorded", { id: toastId });
      setShowModal(false);
      await fetchInitialData();
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save payment", { id: toastId });
    }
  };

  const selectedStudentSummary = summary?.students?.find((student) => student._id === formData.student);
  const years = Array.from({ length: 7 }, (_, index) => now.getFullYear() - 5 + index);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
        <TableSkeleton rows={8} columns={7} />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <h2 className="mt-3 text-lg font-semibold text-red-900">Couldn&apos;t load fee data</h2>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <button onClick={fetchInitialData} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"><RefreshCw className="h-4 w-4" /> Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fees & Payments</h1>
          <p className="mt-1 text-sm text-gray-600">Student-wise collection, current month dues, previous arrears and payment history.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-md border-0 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" aria-label="Fee month">
              {MONTHS.map((month) => <option key={month}>{month}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="rounded-md border-0 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" aria-label="Fee year">
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <button onClick={openNewPaymentModal} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Record Payment</button>
        </div>
      </div>

      {summaryLoading && <div className="flex items-center gap-2 text-xs font-medium text-blue-600"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Updating {selectedMonth} {selectedYear}...</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Expected" value={money(summary?.totalExpected)} icon={CircleDollarSign} hint={`${selectedMonth} fee`} />
        <StatCard title="Total Collected" value={money(summary?.totalCollected)} icon={Wallet} hint="Paid amounts" />
        <StatCard title="Total Due" value={money(summary?.totalDue)} icon={AlertCircle} hint="Previous + current" />
        <StatCard title="Paid Students" value={summary?.paidStudents || 0} icon={CheckCircle2} hint="Fully paid" />
        <StatCard title="Unpaid Students" value={summary?.unpaidStudents || 0} icon={AlertCircle} hint="No payment" />
        <StatCard title="Partial Payment" value={summary?.partialPayments || 0} icon={Clock3} hint="Partially paid" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DueCard title="Previous Due" subtitle={`Outstanding before ${selectedMonth} ${selectedYear}`} value={summary?.previousDue} icon={History} tone="amber" />
        <DueCard title="Current Month Due" subtitle={`${selectedMonth} ${selectedYear} only`} value={summary?.currentDue} icon={CircleDollarSign} tone="blue" />
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-base font-semibold text-gray-900">Student-wise Fee Dashboard</h2><p className="mt-1 text-xs text-gray-500">Active students · {selectedMonth} {selectedYear}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search student / roll / batch" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-64" />
              <select value={batchFilter} onChange={(e) => { setBatchFilter(e.target.value); setStudentFilter(""); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"><option value="">All Batches</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name}</option>)}</select>
              <select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"><option value="">All Students</option>{(summary?.students || []).filter((student) => batchFilter ? student.batch?._id === batchFilter : true).map((student) => <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>)}</select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Batch</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">Monthly Fee</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">Paid</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-amber-700">Previous Due</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-blue-700">Current Due</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredStudents.map((student) => <tr key={student._id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3.5"><div className="font-semibold text-gray-900">{student.name}</div><div className="text-xs text-gray-500">Roll: {student.rollNumber}</div></td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{student.batch?.name || "—"}</td>
                <td className="px-4 py-3.5 text-right text-sm font-medium text-gray-700">{money(student.monthlyFee)}</td>
                <td className="px-4 py-3.5 text-right text-sm font-semibold text-emerald-700">{money(student.paid)}</td>
                <td className="px-4 py-3.5 text-right text-sm font-semibold text-amber-700">{money(student.previousDue)}</td>
                <td className="px-4 py-3.5 text-right text-sm font-semibold text-blue-700">{money(student.currentDue)}</td>
                <td className="px-4 py-3.5 text-center"><StatusBadge status={student.paymentStatus} /></td>
              </tr>)}
              {filteredStudents.length === 0 && <tr><td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-500">No students found for the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><History className="h-4 w-4" /> Payment History</h2><p className="mt-1 text-xs text-gray-500">Payments recorded for {selectedMonth} {selectedYear}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} placeholder="Search payment history" className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-56" />
              <input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => { setHistorySearch(""); setHistoryDate(""); }} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Clear</button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Month / Year</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date Paid</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((payment) => <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-4 py-3.5"><div className="font-medium text-gray-900">{payment.student?.name || "Unknown"}</div><div className="text-xs text-gray-500">{payment.student?.rollNumber || "—"}</div></td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{payment.month}, {payment.year}</td>
                <td className="px-4 py-3.5 text-right text-sm font-semibold text-emerald-700">{money(payment.amount)}</td>
                <td className="px-4 py-3.5 text-sm capitalize text-gray-600">{payment.method}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{payment.date ? new Date(payment.date).toLocaleDateString("en-BD") : "—"}</td>
                <td className="px-4 py-3.5 text-center"><button onClick={() => openEditModal(payment)} className="mr-3 text-blue-600 hover:text-blue-800" title="Edit payment"><Edit className="inline h-4 w-4" /></button><button onClick={() => setDeleteId(payment._id)} className="text-red-600 hover:text-red-800" title="Delete payment"><Trash2 className="inline h-4 w-4" /></button></td>
              </tr>)}
              {filteredHistory.length === 0 && <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-gray-500">No payment history for the selected month.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && <div className="ui-modal fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
        <div className="flex min-h-full items-center justify-center p-4">
          <button className="absolute inset-0 h-full w-full cursor-default bg-gray-900/50" aria-label="Close modal" onClick={() => setShowModal(false)} />
          <div className="ui-modal-panel relative z-10 w-full max-w-lg rounded-xl bg-white p-6 text-left shadow-2xl">
            <div className="mb-5 flex items-start justify-between"><div><h2 id="payment-modal-title" className="text-lg font-semibold text-gray-900">{editMode ? "Edit Payment" : "Record Payment"}</h2><p className="mt-1 text-xs text-gray-500">Payment month is separate from the date it was received.</p></div><button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">×</button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Student</label><select required value={formData.student} onChange={(e) => setFormData({ ...formData, student: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"><option value="">Select student</option>{students.map((student) => <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>)}</select>{selectedStudentSummary && <div className="mt-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">Monthly fee: <strong>{money(selectedStudentSummary.monthlyFee)}</strong> · Current due: <strong>{money(selectedStudentSummary.currentDue)}</strong> · Previous due: <strong>{money(selectedStudentSummary.previousDue)}</strong></div>}</div>
              <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Month</label><select value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900">{MONTHS.map((month) => <option key={month}>{month}</option>)}</select></div><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Year</label><input type="number" min="2000" max="2100" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900" /></div></div>
              <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Amount</label><input required min="1" step="0.01" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="e.g. 1000" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900" /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Payment Method</label><select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm capitalize text-gray-900">{PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}</select></div><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900"><option value="paid">Paid</option><option value="due">Due / Not Collected</option></select></div></div>
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4"><button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">{editMode ? "Update Payment" : "Record Payment"}</button></div>
            </form>
          </div>
        </div>
      </div>}

      <ConfirmDialog open={Boolean(deleteId)} title="Delete payment?" message="This payment record will be permanently deleted and the fee summary will be recalculated." confirmText="Delete Payment" cancelText="Cancel" danger onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, hint }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p><Icon className="h-5 w-5 text-gray-400" /></div><p className="mt-3 text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{hint}</p></div>;
}

function DueCard({ title, subtitle, value, icon: Icon, tone }) {
  const classes = tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-blue-900";
  const iconClass = tone === "amber" ? "text-amber-600" : "text-blue-600";
  return <div className={`rounded-xl border p-5 ${classes}`}><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs opacity-80">{subtitle}</p></div><Icon className={`h-5 w-5 ${iconClass}`} /></div><p className="mt-4 text-2xl font-bold">{money(value)}</p></div>;
}

function StatusBadge({ status }) {
  const config = {
    paid: ["Paid", "bg-emerald-50 text-emerald-700 ring-emerald-600/20"],
    partial: ["Partial", "bg-amber-50 text-amber-700 ring-amber-600/20"],
    unpaid: ["Unpaid", "bg-red-50 text-red-700 ring-red-600/20"],
  }[status] || ["Unknown", "bg-gray-50 text-gray-700 ring-gray-600/20"];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config[1]}`}>{config[0]}</span>;
}
