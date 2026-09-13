"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Atom, CalendarDays, Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, History, RefreshCw, Wallet } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;
const dateText = (value) => value ? new Date(value).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatusBadge({ status }) {
  const map = {
    paid: ["PAID", "bg-emerald-500 text-white", Check],
    partial: ["PARTIAL", "bg-amber-500 text-white", Clock3],
    unpaid: ["UNPAID", "bg-red-500 text-white", CircleDollarSign],
    upcoming: ["UPCOMING", "bg-slate-200 text-slate-700", CalendarDays],
    "not-applicable": ["N/A", "bg-slate-200 text-slate-600", CalendarDays],
  };
  const [label, classes, Icon] = map[status] || map.upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold tracking-wide ${classes}`}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

function DetailStat({ title, value, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "text-slate-500",
    amber: "text-amber-600",
    blue: "text-blue-600",
    green: "text-emerald-600",
    red: "text-red-600",
  };
  return (
    <div className="min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{title}</p>
        <Icon className={`h-5 w-5 shrink-0 ${tones[tone] || tones.slate}`} />
      </div>
      <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{value}</p>
    </div>
  );
}

export default function StudentFeeDetails({ studentId, initialYear = new Date().getFullYear(), onClose }) {
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/fees/student/${studentId}?year=${year}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to load fee details");
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load fee details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [studentId, year]);

  const years = useMemo(() => Array.from({ length: 7 }, (_, i) => initialYear - 3 + i), [initialYear]);
  if (!studentId || typeof document === "undefined") return null;

  const currentMonth = MONTHS[new Date().getMonth()];
  const currentMonthData = data?.months?.find((item) => item.month === currentMonth);
  const paymentStatus = currentMonthData?.status || "upcoming";
  const lastPayment = data?.paymentHistory?.[0];
  const batchName = data?.student?.batch?.name || "No batch";
  const subject = data?.student?.batch?.subject || "";

  const modal = (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Student fee details">
      <div className="flex min-h-full items-start justify-center sm:items-center sm:p-5">
        <div className="flex min-h-screen w-full max-w-5xl flex-col overflow-hidden bg-[#f4f7fb] shadow-2xl sm:min-h-0 sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-[30px]">
          <header className="flex shrink-0 items-center justify-between bg-[#f4f7fb] px-4 py-4 sm:px-6 sm:py-5">
            <button onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-800 transition hover:bg-white active:scale-95" aria-label="Back">
              <ArrowLeft className="h-8 w-8" strokeWidth={2} />
            </button>
            <h2 className="text-[26px] font-bold tracking-tight text-slate-950 sm:text-2xl">Payment Details</h2>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500" aria-label="Fee history year">
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 sm:px-6 sm:pb-6">
            {loading && <div className="flex min-h-80 items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-blue-600" /></div>}
            {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>}

            {!loading && data && (
              <div className="space-y-4 sm:space-y-5">
                <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.10)]">
                  <div className="border-l-[7px] border-blue-600 bg-gradient-to-br from-[#eef7ff] via-[#f8fbff] to-white px-5 py-6 sm:px-7 sm:py-7">
                    <div className="flex items-start gap-4">
                      <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 sm:flex">
                        <Atom className="h-7 w-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="truncate text-[30px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-4xl">{data.student.name}</h3>
                          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-100 px-3.5 py-2 text-sm font-extrabold text-blue-900 sm:px-4 sm:py-2.5">
                            Roll: {data.student.rollNumber || "—"}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-semibold text-slate-700 sm:text-lg">
                          <span className="inline-flex items-center gap-2"><Atom className="h-5 w-5 text-slate-500" />{subject || batchName}</span>
                          {subject && <><span className="text-slate-300">•</span><span>{batchName}</span></>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-2">
                    <DetailStat title="Monthly Fee" value={money(data.monthlyFee)} icon={Wallet} tone="blue" />
                    <DetailStat title="Previous Due" value={money(data.previousDue)} icon={History} tone="amber" />
                    <DetailStat title="Current Due" value={money(currentMonthData?.due)} icon={CircleDollarSign} tone="red" />
                    <DetailStat title="Last Payment" value={lastPayment ? dateText(lastPayment.date) : "No payment"} icon={CalendarDays} tone="green" />
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-5 sm:px-7">
                    <div>
                      <p className="text-[13px] font-extrabold uppercase tracking-wide text-slate-900">Payment Status</p>
                      <p className="mt-1 text-xs text-slate-500">{currentMonth}, {new Date().getFullYear()}</p>
                    </div>
                    <StatusBadge status={paymentStatus} />
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
                    <div><h3 className="text-base font-bold text-slate-950">Payment History</h3><p className="mt-0.5 text-xs text-slate-500">All recorded payments for this student</p></div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{data.paymentHistory.length} records</span>
                  </div>
                  <div className="space-y-2.5 p-3 sm:hidden">
                    {data.paymentHistory.length === 0 ? <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No payment history found.</div> : data.paymentHistory.map((payment) => (
                      <div key={payment._id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Wallet className="h-5 w-5" /></div>
                        <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className="text-lg text-slate-950">{money(payment.amount)}</strong><StatusBadge status={payment.status === "paid" ? "paid" : "unpaid"} /></div><p className="mt-0.5 text-xs text-slate-500">{payment.month}, {payment.year} • {dateText(payment.date)} • <span className="capitalize">{payment.method}</span></p></div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="min-w-[680px] w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Date</th><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Month</th><th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Amount</th><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Method</th><th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{data.paymentHistory.length === 0 ? <tr><td colSpan="5" className="px-5 py-8 text-center text-sm text-slate-500">No payment history found.</td></tr> : data.paymentHistory.map((payment) => <tr key={payment._id}><td className="px-5 py-3 text-sm text-slate-600">{dateText(payment.date)}</td><td className="px-5 py-3 text-sm font-semibold text-slate-900">{payment.month}, {payment.year}</td><td className="px-5 py-3 text-right text-sm font-bold text-slate-950">{money(payment.amount)}</td><td className="px-5 py-3 text-sm capitalize text-slate-600">{payment.method}</td><td className="px-5 py-3 text-center"><StatusBadge status={payment.status === "paid" ? "paid" : "unpaid"} /></td></tr>)}</tbody></table>
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-3 flex items-center gap-2"><CircleDollarSign className="h-5 w-5 text-blue-600" /><h3 className="font-bold text-slate-950">{year} Monthly Fee</h3></div>
                  <div className="space-y-2 sm:hidden">{data.months.map((item) => <div key={item.month} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{item.month}</p><p className="mt-0.5 text-xs text-slate-500">Expected {money(item.expected)} • Paid {money(item.paid)}</p></div><div className="text-right"><p className={`font-bold ${item.due > 0 ? "text-red-600" : "text-emerald-700"}`}>{money(item.due)}</p><StatusBadge status={item.status} /></div></div>)}</div>
                  <div className="hidden overflow-x-auto sm:block"><table className="min-w-[720px] w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Month</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Monthly Fee</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Expected</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Paid</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Due</th><th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{data.months.map((item) => <tr key={item.month}><td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.month}</td><td className="px-4 py-3 text-right text-sm text-slate-600">{money(item.monthlyFee)}</td><td className="px-4 py-3 text-right text-sm text-slate-600">{money(item.expected)}</td><td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{money(item.paid)}</td><td className="px-4 py-3 text-right text-sm font-bold text-red-600">{money(item.due)}</td><td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
