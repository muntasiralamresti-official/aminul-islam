"use client";

import { useLayoutEffect, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Edit, Trash2, Wallet, CircleDollarSign, AlertCircle, CheckCircle2,
  Clock3, History, RefreshCw, CalendarDays, SlidersHorizontal, X, Search,
  ChevronLeft, ChevronRight, FileDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/LoadingSkeleton";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PAYMENT_METHODS = ["cash", "bkash", "nagad", "bank"];
const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const todayInput = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };

export default function FeesPage() {
  const router = useRouter();
  const now = new Date();
  const initialMonth = MONTHS[now.getMonth()];
  const initialYear = now.getFullYear();
  const initialLoadRef = useRef(true);
  const modalTriggerRef = useRef(null);
  const modalPanelRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [batchFilter, setBatchFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [paymentDateFilter, setPaymentDateFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);
  const [historySearch, setHistorySearch] = useState("");
  const [historyDate, setHistoryDate] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pdfStatusFilter, setPdfStatusFilter] = useState("all");
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ student: "", month: initialMonth, year: initialYear, amount: "", method: "cash", status: "paid", date: todayInput() });
  const [modalStudentSearch, setModalStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true); setError("");
    try {
      const [summaryRes, paymentsRes, batchesRes] = await Promise.all([
        fetch(`/api/fees/summary?month=${encodeURIComponent(selectedMonth)}&year=${selectedYear}`),
        fetch(`/api/payments?month=${encodeURIComponent(selectedMonth)}&year=${selectedYear}`),
        fetch("/api/batches"),
      ]);
      const [summaryData, paymentsData, batchesData] = await Promise.all([summaryRes.json(), paymentsRes.json(), batchesRes.json()]);
      if (!summaryRes.ok) throw new Error(summaryData.error || "Failed to load fee summary");
      if (!paymentsRes.ok) throw new Error(paymentsData.error || "Failed to load payment history");
      if (!batchesRes.ok) throw new Error(batchesData.error || "Failed to load batches");
      setSummary(summaryData); setPayments(Array.isArray(paymentsData) ? paymentsData : []); setStudents(Array.isArray(summaryData.students) ? summaryData.students : []); setBatches(Array.isArray(batchesData) ? batchesData : []);
    } catch (err) { setError(err.message || "Failed to load fees"); toast.error(err.message || "Failed to load fees"); }
    finally { setLoading(false); }
  };

  const fetchSummary = async (month, year) => {
    setSummaryLoading(true);
    try {
      const [summaryRes, paymentsRes] = await Promise.all([
        fetch(`/api/fees/summary?month=${encodeURIComponent(month)}&year=${year}`),
        fetch(`/api/payments?month=${encodeURIComponent(month)}&year=${year}`),
      ]);
      const [data, paymentData] = await Promise.all([summaryRes.json(), paymentsRes.json()]);
      if (!summaryRes.ok) throw new Error(data.error || "Failed to load fee summary");
      if (!paymentsRes.ok) throw new Error(paymentData.error || "Failed to load payment history");
      setSummary(data); setPayments(Array.isArray(paymentData) ? paymentData : []); setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) { toast.error(err.message || "Failed to load fee summary"); }
    finally { setSummaryLoading(false); }
  };

  useEffect(() => { fetchInitialData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => {
    if (initialLoadRef.current) { initialLoadRef.current = false; return; }
    fetchSummary(selectedMonth, selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const filteredStudents = useMemo(() => {
    const rows = summary?.students || []; const query = studentSearch.trim().toLowerCase();
    return rows.filter((student) => {
      if (batchFilter && student.batch?._id !== batchFilter) return false;
      if (studentFilter && student._id !== studentFilter) return false;
      if (paymentStatusFilter) {
          if (paymentStatusFilter === 'not-set') {
            if (student.hasCustomFee !== false) return false;
          } else {
            if (student.paymentStatus !== paymentStatusFilter) return false;
          }
        }
      if (paymentDateFilter) {
        const date = student.latestPayment?.date ? new Date(student.latestPayment.date) : null;
        if (!date || Number.isNaN(date.getTime())) return false;
        const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        if (localDate !== paymentDateFilter) return false;
      }
      if (!query) return true;
      return student.name?.toLowerCase().includes(query) || student.rollNumber?.toLowerCase().includes(query) || student.batch?.name?.toLowerCase().includes(query);
    });
  }, [summary, batchFilter, studentFilter, studentSearch, paymentDateFilter, paymentStatusFilter]);

  const filteredStats = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
      acc.expected += student.expected || 0;
      acc.paid += student.paid || 0;
      acc.due += student.totalDue || 0;
      return acc;
    }, { expected: 0, paid: 0, due: 0 });
  }, [filteredStudents]);

  const studentTotalPages = Math.max(1, Math.ceil(filteredStudents.length / studentPageSize));
  const paginatedStudents = useMemo(() => filteredStudents.slice((studentPage - 1) * studentPageSize, studentPage * studentPageSize), [filteredStudents, studentPage, studentPageSize]);
  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    return payments.filter((payment) => payment.month === selectedMonth && Number(payment.year) === Number(selectedYear)).filter((payment) => {
      if (historyDate) {
        const date = payment.date ? new Date(payment.date) : null;
        if (!date || Number.isNaN(date.getTime())) return false;
        const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        if (localDate !== historyDate) return false;
      }
      if (!query) return true;
      const name = payment.student?.name?.toLowerCase() || "";
      const roll = payment.student?.rollNumber?.toLowerCase() || "";
      return name.includes(query) || roll.includes(query);
    });
  }, [payments, selectedMonth, selectedYear, historySearch, historyDate]);
  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / historyPageSize));
  const paginatedHistory = useMemo(() => filteredHistory.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize), [filteredHistory, historyPage, historyPageSize]);

  useEffect(() => { setStudentPage(1); }, [studentSearch, batchFilter, studentFilter, paymentDateFilter, paymentStatusFilter, studentPageSize, selectedMonth, selectedYear]);
  useEffect(() => { setHistoryPage(1); }, [historySearch, historyDate, historyPageSize, selectedMonth, selectedYear]);
  useEffect(() => { if (studentPage > studentTotalPages) setStudentPage(studentTotalPages); }, [studentPage, studentTotalPages]);
  useEffect(() => { if (historyPage > historyTotalPages) setHistoryPage(historyTotalPages); }, [historyPage, historyTotalPages]);

  const clearStudentFilters = () => { setBatchFilter(""); setStudentFilter(""); setStudentSearch(""); setPaymentDateFilter(""); setPaymentStatusFilter(""); setStudentPage(1); };
  const downloadFeePdf = async () => {
    if (pdfDownloading) return;
    setPdfDownloading(true);
    try {
      const params = new URLSearchParams({
        month: selectedMonth,
        year: String(selectedYear),
        status: pdfStatusFilter,
      });
      if (batchFilter) params.set("batch", batchFilter);
      if (studentFilter) params.set("student", studentFilter);
      if (studentSearch.trim()) params.set("search", studentSearch.trim());
      if (paymentDateFilter) params.set("paymentDate", paymentDateFilter);

      const response = await fetch("/api/fees/pdf?" + params.toString());
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fee-report-" + selectedMonth.toLowerCase() + "-" + selectedYear + "-" + pdfStatusFilter + ".pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const label = pdfStatusFilter === "all" ? "All" : pdfStatusFilter === "paid" ? "Paid" : pdfStatusFilter === "partial" ? "Partial" : "Unpaid";
      toast.success(label + " fee PDF downloaded");
    } catch (err) {
      console.error("Fee PDF error:", err);
      toast.error(err.message || "Could not generate PDF");
    } finally {
      setPdfDownloading(false);
    }
  };

  const openNewPaymentModal = (studentId = "") => {
    router.push(studentId ? `/dashboard/fees/new?student=${studentId}` : "/dashboard/fees/new");
  };
  const openEditModal = (payment) => {
    router.push(`/dashboard/fees/edit/${payment._id}`);
  };

  useLayoutEffect(() => {
    if (!showModal || !modalTriggerRef.current || !modalPanelRef.current) return;
    const updatePosition = () => {
      const trigger = modalTriggerRef.current;
      const panel = modalPanelRef.current;
      if (!trigger || !panel) return;
      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const gap = 12, margin = 12, viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
      const maxTop = Math.max(margin, viewportHeight - panelRect.height - margin);
      const maxLeft = Math.max(margin, viewportWidth - panelRect.width - margin);
      let top = triggerRect.bottom + gap;
      if (top > maxTop) top = Math.max(margin, triggerRect.top - panelRect.height - gap);
      top = Math.min(Math.max(margin, top), maxTop);
      const left = Math.min(Math.max(margin, triggerRect.left), maxLeft);
      setModalPosition({ top, left });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => { window.removeEventListener("resize", updatePosition); window.removeEventListener("scroll", updatePosition, true); };
  }, [showModal, editMode]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId; const toastId = toast.loading("Deleting payment...");
    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete payment");
      toast.success("Payment deleted", { id: toastId }); setDeleteId(null); await fetchSummary(selectedMonth, selectedYear); router.refresh();
    } catch (err) { toast.error(err.message || "Error deleting payment", { id: toastId }); }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); if (saving) return;
    const amount = Number(formData.amount);
    if (!formData.student) return toast.error("Please select a student");
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Please enter a valid payment amount");
    if (!formData.date) return toast.error("Please select payment date");
    setSaving(true); const isEdit = editMode; const toastId = toast.loading(isEdit ? "Updating payment..." : "Recording payment...");
    try {
      const url = isEdit ? `/api/payments/${editingId}` : "/api/payments";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, amount, date: new Date(`${formData.date}T12:00:00`).toISOString() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save payment");
      toast.success(isEdit ? "Payment updated ✓" : "Payment recorded ✓", { id: toastId }); setShowModal(false); await fetchSummary(selectedMonth, selectedYear); router.refresh();
    } catch (err) { toast.error(err.message || "Failed to save payment", { id: toastId }); }
    finally { setSaving(false); }
  };

  const activeFilterCount = [batchFilter, studentFilter, paymentDateFilter, paymentStatusFilter, studentSearch].filter(Boolean).length;
  const totalActiveStudents = summary?.students?.length || 0;
  const hasStudentFilters = activeFilterCount > 0;
  const selectedStudentSummary = summary?.students?.find((student) => student._id === formData.student);
  const filteredModalStudents = (students || []).filter((student) => { const query = modalStudentSearch.trim().toLowerCase(); return !query || student.name?.toLowerCase().includes(query) || student.rollNumber?.toLowerCase().includes(query); }).slice(0, 50);
  const selectedStudentObj = (students || []).find((student) => student._id === formData.student);
  const years = Array.from({ length: 7 }, (_, index) => now.getFullYear() - 5 + index);

  if (loading) return <div className="space-y-6"><div className="h-8 w-52 animate-pulse rounded bg-gray-200" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-gray-100" />)}</div><TableSkeleton rows={8} columns={9} /></div>;
  if (error && !summary) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><h2 className="mt-3 text-lg font-semibold text-red-900">Couldn&apos;t load fee data</h2><p className="mt-1 text-sm text-red-700">{error}</p><button onClick={fetchInitialData} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"><RefreshCw className="h-4 w-4" /> Retry</button></div>;

  return <div className="space-y-5 pb-28 sm:space-y-6 sm:pb-8">
    <header className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Collection</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Fees & Payments</h1><p className="mt-1 text-sm text-gray-500">Record payments, track current dues and review payment history.</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1"><select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="min-w-28 rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none" aria-label="Fee month">{MONTHS.map((month) => <option key={month}>{month}</option>)}</select><select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none" aria-label="Fee year">{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></div><button onClick={(event) => openNewPaymentModal("", event.currentTarget)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" /> Record Payment</button></div></div></header>
    {summaryLoading && <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Updating {selectedMonth} {selectedYear}...</div>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"><StatCard title="Total Expected" value={money(summary?.totalExpected)} icon={CircleDollarSign} hint={`${selectedMonth} fee`} /><StatCard title="Total Collected" value={money(summary?.totalCollected)} icon={Wallet} hint="Paid amounts" /><StatCard title="Total Due" value={money(summary?.totalDue)} icon={AlertCircle} hint="Previous + current" /><StatCard title="Paid Students" value={summary?.paidStudents || 0} icon={CheckCircle2} hint="Fully paid" /><StatCard title="Unpaid Students" value={summary?.unpaidStudents || 0} icon={AlertCircle} hint="No payment" /><StatCard title="Partial Payment" value={summary?.partialPayments || 0} icon={Clock3} hint="Partially paid" /></div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><DueCard title="Previous Due" subtitle={`Outstanding before ${selectedMonth} ${selectedYear}`} value={summary?.previousDue} icon={History} tone="amber" /><DueCard title="Current Month Due" subtitle={`${selectedMonth} ${selectedYear} only`} value={summary?.currentDue} icon={CircleDollarSign} tone="blue" /></div>

    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-200 p-4 sm:p-5"><div className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="shrink-0">
            <h2 className="text-base font-bold text-gray-900">Student-wise Fee Dashboard</h2>
            <p className="mt-1 text-xs text-gray-500">{hasStudentFilters ? `${filteredStudents.length} matching students · ${totalActiveStudents} active` : `${totalActiveStudents} active students`} · ${selectedMonth} ${selectedYear}</p>
            {hasStudentFilters && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-200/50">Filtered Expected: {money(filteredStats.expected)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/50">Filtered Paid: {money(filteredStats.paid)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700 ring-1 ring-inset ring-amber-200/50">Filtered Due: {money(filteredStats.due)}</span>
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-[minmax(220px,1.3fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search student / roll / batch" className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <select value={batchFilter} onChange={(event) => { setBatchFilter(event.target.value); setStudentFilter(""); }} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900">
              <option value="">All Batches</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name}</option>)}
            </select>
            <select value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900">
              <option value="">All Students</option>{(summary?.students || []).filter((student) => batchFilter ? student.batch?._id === batchFilter : true).map((student) => <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>)}
            </select>
            <button onClick={clearStudentFilters} className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">Clear</button>
            <input type="date" value={paymentDateFilter} onChange={(event) => setPaymentDateFilter(event.target.value)} title="Filter by last payment date" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900" />
            <select value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900">
              <option value="">All Payment Status</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option><option value="not-set">Fee Not Set</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"><FileDown className="h-4 w-4" /></div>
            <div><p className="text-sm font-bold text-slate-800">Download fee report</p><p className="mt-0.5 text-xs text-slate-500">Bangla-supported PDF • all matching students</p></div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <select value={pdfStatusFilter} onChange={(event) => setPdfStatusFilter(event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="all">All Students</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option>
            </select>
            <button type="button" onClick={downloadFeePdf} disabled={pdfDownloading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              <FileDown className="h-4 w-4" />{pdfDownloading ? "Preparing PDF…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div></div><div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {filteredStudents.length ? ((studentPage - 1) * studentPageSize) + 1 : 0}–{Math.min(studentPage * studentPageSize, filteredStudents.length)} of {filteredStudents.length}{hasStudentFilters ? " matching" : ""} students</span><label className="flex items-center gap-2">Rows per page<select value={studentPageSize} onChange={(event) => setStudentPageSize(Number(event.target.value))} className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700"><option value="10">10</option><option value="20">20</option></select></label></div>
      <div className="hidden overflow-x-auto sm:block"><table className="min-w-[1180px] w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['#', 'Student', 'Batch', 'Monthly Fee', 'Paid', 'Previous Due', 'Current Due', 'Last Payment', 'Last Amount', 'Status', 'Action'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 bg-white">{paginatedStudents.map((student, index) => <tr key={student._id} className="hover:bg-gray-50"><td className="px-4 py-3.5 text-sm text-gray-400">{(studentPage - 1) * studentPageSize + index + 1}</td><td className="px-4 py-3.5"><div className="font-semibold text-gray-900">{student.name}</div><div className="text-xs text-gray-500">Roll: {student.rollNumber}</div></td><td className="px-4 py-3.5 text-sm text-gray-600">{student.batch?.name || "—"}</td><td className="px-4 py-3.5 text-right text-sm font-medium text-gray-700">{money(student.monthlyFee)}</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-emerald-700">{money(student.paid)}</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-amber-700">{money(student.previousDue)}</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-blue-700">{money(student.currentDue)}</td><td className="px-4 py-3.5 text-sm text-gray-600">{student.latestPayment ? <><div className="font-medium text-gray-900">{formatDate(student.latestPayment.date)}</div><div className="text-xs text-gray-500">{student.latestPayment.month}, {student.latestPayment.year}</div></> : <span className="text-gray-400">No payment</span>}</td><td className="px-4 py-3.5 text-right text-sm font-semibold text-emerald-700">{student.latestPayment ? money(student.latestPayment.amount) : "—"}</td><td className="px-4 py-3.5 text-center"><StatusBadge status={student.paymentStatus} /></td><td className="px-4 py-3.5"><button onClick={(event) => openNewPaymentModal(student._id, event.currentTarget)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"><Plus className="h-3.5 w-3.5" /> Payment</button></td></tr>)}{paginatedStudents.length === 0 && <tr><td colSpan="11" className="px-4 py-10 text-center text-sm text-gray-500">No students found for the selected filters.</td></tr>}</tbody></table></div>
      <div className="divide-y divide-gray-100 sm:hidden">{paginatedStudents.map((student, index) => <article key={student._id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-bold text-gray-900">{student.name}</h3><p className="mt-0.5 text-xs text-gray-500">Roll: {student.rollNumber} · {student.batch?.name || "No batch"}</p></div><StatusBadge status={student.paymentStatus} /></div><div className="mt-4 grid grid-cols-2 gap-2"><InfoMetric label="Monthly Fee" value={money(student.monthlyFee)} /><InfoMetric label="Paid" value={money(student.paid)} /><InfoMetric label="Previous Due" value={money(student.previousDue)} /><InfoMetric label="Current Due" value={money(student.currentDue)} /></div><div className="mt-3 rounded-xl bg-gray-50 p-3"><div className="flex items-center justify-between gap-3 text-xs text-gray-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Last payment</span><span className="font-semibold text-gray-800">{student.latestPayment ? formatDate(student.latestPayment.date) : "No payment"}</span></div><div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500"><span>Last amount</span><span className="font-bold text-emerald-700">{student.latestPayment ? money(student.latestPayment.amount) : "—"}</span></div></div><button onClick={(event) => openNewPaymentModal(student._id, event.currentTarget)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" /> Record Payment for {student.name}</button><p className="mt-2 text-center text-[11px] text-gray-400">Student {((studentPage - 1) * studentPageSize) + index + 1} of {filteredStudents.length}</p></article>)}{paginatedStudents.length === 0 && <div className="px-4 py-10 text-center text-sm text-gray-500">No students found for the selected filters.</div>}</div>
      <Pagination page={studentPage} totalPages={studentTotalPages} onPageChange={setStudentPage} />
    </section>
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-200 p-4 sm:p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><History className="h-4 w-4" /> Payment History</h2><p className="mt-1 text-xs text-gray-500">Payments recorded for {selectedMonth} {selectedYear}</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Search payment history" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900" /><input type="date" value={historyDate} onChange={(event) => setHistoryDate(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900" /></div></div></div><div className="hidden overflow-x-auto sm:block"><table className="min-w-[900px] w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Date', 'Student', 'Month', 'Amount', 'Method', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 bg-white">{paginatedHistory.map((payment) => <tr key={payment._id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm text-gray-600">{formatDate(payment.date)}</td><td className="px-4 py-3"><div className="font-semibold text-gray-900">{payment.student?.name || "—"}</div><div className="text-xs text-gray-500">Roll: {payment.student?.rollNumber || "—"}</div></td><td className="px-4 py-3 text-sm text-gray-600">{payment.month}, {payment.year}</td><td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">{money(payment.amount)}</td><td className="px-4 py-3 text-sm capitalize text-gray-600">{payment.method || "—"}</td><td className="px-4 py-3 text-center"><StatusBadge status={payment.status === "paid" ? "paid" : "unpaid"} /></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={(event) => openEditModal(payment, event.currentTarget)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Edit payment"><Edit className="h-4 w-4" /></button><button onClick={() => setDeleteId(payment._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete payment"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}{paginatedHistory.length === 0 && <tr><td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-500">No payment history found.</td></tr>}</tbody></table></div><div className="divide-y divide-gray-100 sm:hidden">{paginatedHistory.map((payment) => <article key={payment._id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-gray-900">{payment.student?.name || "—"}</p><p className="text-xs text-gray-500">Roll: {payment.student?.rollNumber || "—"}</p></div><StatusBadge status={payment.status === "paid" ? "paid" : "unpaid"} /></div><div className="mt-3 grid grid-cols-2 gap-2"><InfoMetric label="Date" value={formatDate(payment.date)} /><InfoMetric label="Amount" value={money(payment.amount)} /><InfoMetric label="Month" value={`${payment.month}, ${payment.year}`} /><InfoMetric label="Method" value={payment.method || "—"} /></div><div className="mt-3 flex gap-2"><button onClick={(event) => openEditModal(payment, event.currentTarget)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-700"><Edit className="h-4 w-4" /> Edit</button><button onClick={() => setDeleteId(payment._id)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700"><Trash2 className="h-4 w-4" /> Delete</button></div></article>)}{paginatedHistory.length === 0 && <div className="px-4 py-10 text-center text-sm text-gray-500">No payment history found.</div>}</div><Pagination page={historyPage} totalPages={historyTotalPages} onPageChange={setHistoryPage} /></section>
    <div className="fixed bottom-[5.25rem] left-4 right-4 z-40 sm:hidden"><button onClick={(event) => openNewPaymentModal("", event.currentTarget)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-blue-600/30 ring-1 ring-white/20"><Plus className="h-5 w-5" /> Record Payment</button></div>
    {showFilters && <div className="fixed inset-0 z-[90] bg-black/40 sm:hidden" onClick={() => setShowFilters(false)}><div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-bold text-gray-900">Fee Filters</h3><p className="text-xs text-gray-500">Narrow down the student list</p></div><button onClick={() => setShowFilters(false)} className="rounded-full bg-gray-100 p-2 text-gray-500" aria-label="Close filters"><X className="h-5 w-5" /></button></div><div className="space-y-3"><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search student / roll / batch" className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm" /><select value={batchFilter} onChange={(event) => { setBatchFilter(event.target.value); setStudentFilter(""); }} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm"><option value="">All Batches</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name}</option>)}</select><select value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm"><option value="">All Students</option>{(summary?.students || []).filter((student) => batchFilter ? student.batch?._id === batchFilter : true).map((student) => <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>)}</select><input type="date" value={paymentDateFilter} onChange={(event) => setPaymentDateFilter(event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm" /><select value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm"><option value="">All Payment Status</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option><option value="not-set">Fee Not Set</option></select></div><div className="mt-5 flex gap-2"><button onClick={clearStudentFilters} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">Clear</button><button onClick={() => setShowFilters(false)} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Apply Filters</button></div></div></div>}
    
    <ConfirmDialog open={Boolean(deleteId)} title="Delete payment?" message="This payment record will be permanently deleted and the fee summary will be recalculated." confirmLabel="Delete Payment" cancelText="Cancel" danger onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
  </div>;
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return <div className="flex justify-end border-t border-gray-100 px-4 py-3"><span className="text-xs text-gray-400">Page 1 of 1</span></div>;
  return <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3"><span className="text-xs text-gray-500">Page {page} of {totalPages}</span><div className="flex items-center gap-1"><button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /> Prev</button><span className="px-2 text-xs font-semibold text-gray-600">{page}/{totalPages}</span><button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="h-3.5 w-3.5" /></button></div></div>;
}

function StatCard({ title, value, icon: Icon, hint }) { return <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm sm:p-4"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-xs">{title}</p><Icon className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" /></div><p className="mt-2 text-xl font-bold text-gray-900 sm:mt-3 sm:text-2xl">{value}</p><p className="mt-1 text-[10px] text-gray-500 sm:text-xs">{hint}</p></div>; }
function DueCard({ title, subtitle, value, icon: Icon, tone }) { const classes = tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-blue-900"; const iconClass = tone === "amber" ? "text-amber-600" : "text-blue-600"; return <div className={`rounded-xl border p-4 sm:p-5 ${classes}`}><div className="flex items-start justify-between"><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs opacity-80">{subtitle}</p></div><Icon className={`h-5 w-5 ${iconClass}`} /></div><p className="mt-4 text-2xl font-bold">{money(value)}</p></div>; }
function InfoMetric({ label, value }) { return <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 text-sm font-bold text-gray-900">{value}</p></div>; }
function StatusBadge({ status }) { const config = { paid: ["Paid", "bg-emerald-50 text-emerald-700 ring-emerald-600/20"], partial: ["Partial", "bg-amber-50 text-amber-700 ring-amber-600/20"], unpaid: ["Unpaid", "bg-red-50 text-red-700 ring-red-600/20"] }[status] || ["Unknown", "bg-gray-50 text-gray-700 ring-gray-600/20"]; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config[1]}`}>{config[0]}</span>; }




