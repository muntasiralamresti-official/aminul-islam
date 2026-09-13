"use client";

import { useEffect, useMemo, useState } from "react";
import { X, RefreshCw, History, Wallet, CircleDollarSign, AlertCircle, CheckCircle2, Clock3, GraduationCap, CalendarDays, ChevronRight } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;
const dateText = (value) => value ? new Date(value).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatusBadge({ status }) {
  const map = { paid: ["Paid", "bg-emerald-100 text-emerald-700"], partial: ["Partial", "bg-amber-100 text-amber-700"], unpaid: ["Unpaid", "bg-red-100 text-red-700"], upcoming: ["Upcoming", "bg-slate-100 text-slate-600"], "not-applicable": ["N/A", "bg-slate-100 text-slate-500"] };
  const [label, classes] = map[status] || map.upcoming;
  return <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${classes}`}>{label}</span>;
}

export default function StudentFeeDetails({ studentId, initialYear = new Date().getFullYear(), onClose }) {
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const res = await fetch(`/api/fees/student/${studentId}?year=${year}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load fee details");
        if (!cancelled) setData(result);
      } catch (err) { if (!cancelled) setError(err.message || "Failed to load fee details"); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [studentId, year]);

  const years = useMemo(() => Array.from({ length: 7 }, (_, i) => initialYear - 3 + i), [initialYear]);
  if (!studentId) return null;

  const lastPayment = data?.paymentHistory?.[0];
  const paymentStatus = data?.months?.find((item) => item.month === MONTHS[new Date().getMonth()])?.status || "upcoming";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Student fee details">
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative flex min-h-full items-start justify-center p-0 sm:items-center sm:p-5">
        <div className="ui-modal-panel relative min-h-screen w-full max-w-5xl overflow-hidden bg-slate-50 shadow-2xl sm:min-h-0 sm:rounded-[28px]">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3"><button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Close"><X className="h-5 w-5" /></button><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">Fee & Payment</p><h2 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{data?.student?.name || "Student"}</h2></div></div>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500" aria-label="Fee history year">{years.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          </header>

          <div className="max-h-[calc(100vh-72px)] overflow-y-auto p-3 sm:max-h-[82vh] sm:p-6">
            {loading && <div className="flex min-h-80 items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-blue-600" /></div>}
            {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>}
            {!loading && data && <div className="space-y-4 sm:space-y-5">
              <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                <div className="border-l-[6px] border-blue-600 bg-gradient-to-br from-blue-50 via-white to-white p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"><GraduationCap className="h-7 w-7" /></div><div className="min-w-0 flex-1"><h3 className="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{data.student.name}</h3><p className="mt-1 text-sm text-slate-600">Roll: {data.student.rollNumber} <span className="mx-1 text-slate-300">|</span> {data.student.batch?.name || "No batch"}</p></div><StatusBadge status={paymentStatus} /></div>
                  <div className="mt-5 grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0"><div className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Wallet className="h-5 w-5 text-slate-500" /> Monthly Fee</div><div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{money(data.monthlyFee)}</div></div><div className="p-4 sm:p-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarDays className="h-5 w-5 text-slate-500" /> Last Payment</div><div className="mt-2 text-xl font-bold text-slate-950">{lastPayment ? dateText(lastPayment.date) : "No payment"}</div></div></div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0"><FeeStat title="Previous Due" value={money(data.previousDue)} icon={History} tone="amber" /><FeeStat title="Current / Year Due" value={money(data.yearDue)} icon={AlertCircle} tone="blue" /><FeeStat title={`${year} Paid`} value={money(data.yearPaid)} icon={CheckCircle2} tone="green" /><FeeStat title="Outstanding" value={money(data.totalOutstanding)} icon={AlertCircle} tone="red" /></div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5"><div><h3 className="text-base font-bold text-slate-950">Payment History</h3><p className="mt-0.5 text-xs text-slate-500">All recorded payments for this student</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{data.paymentHistory.length} records</span></div>
                <div className="space-y-2.5 p-3 sm:hidden">
                  {data.paymentHistory.length === 0 ? <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No payment history found.</div> : data.paymentHistory.map((payment) => <div key={payment._id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Wallet className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className="text-lg text-slate-950">{money(payment.amount)}</strong><StatusBadge status={payment.status === "paid" ? "paid" : "unpaid"} /></div><p className="mt-0.5 text-xs text-slate-500">{payment.month}, {payment.year} • {dateText(payment.date)} • <span className="capitalize">{payment.method}</span></p></div><ChevronRight className="h-4 w-4 text-slate-300" /></div>)}
                </div>
                <div className="hidden overflow-x-auto sm:block"><table className="min-w-[680px] w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Date</th><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Month</th><th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Amount</th><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Method</th><th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{data.paymentHistory.length === 0 ? <tr><td colSpan="5" className="px-5 py-8 text-center text-sm text-slate-500">No payment history found.</td></tr> : data.paymentHistory.map((payment) => <tr key={payment._id} className="hover:bg-slate-50"><td className="px-5 py-3 text-sm text-slate-600">{dateText(payment.date)}</td><td className="px-5 py-3 text-sm font-semibold text-slate-900">{payment.month}, {payment.year}</td><td className="px-5 py-3 text-right text-sm font-bold text-slate-950">{money(payment.amount)}</td><td className="px-5 py-3 text-sm capitalize text-slate-600">{payment.method}</td><td className="px-5 py-3 text-center"><StatusBadge status={payment.status === "paid" ? "paid" : "unpaid"} /></td></tr>)}</tbody></table></div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center gap-2"><CircleDollarSign className="h-5 w-5 text-blue-600" /><h3 className="font-bold text-slate-950">{year} Monthly Fee</h3></div>
                <div className="space-y-2 sm:hidden">{data.months.map((item) => <div key={item.month} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{item.month}</p><p className="mt-0.5 text-xs text-slate-500">Expected {money(item.expected)} • Paid {money(item.paid)}</p></div><div className="text-right"><p className={`font-bold ${item.due > 0 ? "text-red-600" : "text-emerald-700"}`}>{money(item.due)}</p><StatusBadge status={item.status} /></div></div>)}</div>
                <div className="hidden overflow-x-auto sm:block"><table className="min-w-[720px] w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Month</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Monthly Fee</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Expected</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Paid</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Due</th><th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{data.months.map((item) => <tr key={item.month} className="hover:bg-slate-50"><td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.month}</td><td className="px-4 py-3 text-right text-sm text-slate-600">{money(item.monthlyFee)}</td><td className="px-4 py-3 text-right text-sm text-slate-600">{money(item.expected)}</td><td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{money(item.paid)}</td><td className="px-4 py-3 text-right text-sm font-bold text-red-600">{money(item.due)}</td><td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div>
              </section>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries(data.methodTotals || {}).map(([method, amount]) => <div key={method} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs font-semibold capitalize text-slate-500">{method}</div><div className="mt-1 text-lg font-bold text-slate-950">{money(amount)}</div></div>)}</div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeeStat({ title, value, icon: Icon, tone }) {
  const tones = { amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700" };
  return <div className="p-3.5 sm:p-4"><div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${tones[tone] || tones.blue}`}><Icon className="h-4.5 w-4.5" /></div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-1 text-base font-bold text-slate-950 sm:text-lg">{value}</p></div>;
}
