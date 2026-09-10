"use client";

import { useEffect, useMemo, useState } from "react";
import { X, RefreshCw, History, Wallet, CircleDollarSign, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

function StatusBadge({ status }) {
  const map = {
    paid: ["Paid", "bg-emerald-50 text-emerald-700"],
    partial: ["Partial", "bg-amber-50 text-amber-700"],
    unpaid: ["Unpaid", "bg-red-50 text-red-700"],
    upcoming: ["Upcoming", "bg-gray-100 text-gray-600"],
    "not-applicable": ["N/A", "bg-gray-100 text-gray-500"],
  };
  const [label, classes] = map[status] || map.upcoming;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
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

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Student fee details">
      <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="ui-modal-panel relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Fee Details</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{data?.student?.name || "Student"}</h2>
              {data?.student && <p className="mt-1 text-sm text-gray-500">Roll: {data.student.rollNumber} · {data.student.batch?.name || "No batch"}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>

          <div className="max-h-[82vh] overflow-y-auto p-4 sm:p-6">
            {loading && <div className="flex min-h-64 items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-blue-600" /></div>}
            {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>}
            {!loading && data && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <div className="rounded-lg bg-gray-50 px-3 py-2"><span className="block text-[11px] uppercase text-gray-500">Monthly Fee</span><strong className="text-gray-900">{money(data.monthlyFee)}</strong></div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2"><span className="block text-[11px] uppercase text-gray-500">Admission</span><strong className="text-gray-900">{data.student.admissionDate ? new Date(data.student.admissionDate).toLocaleDateString() : "—"}</strong></div>
                  </div>
                  <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" aria-label="Fee history year">
                    {years.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <MiniStat title="Previous Due" value={money(data.previousDue)} icon={History} />
                  <MiniStat title={`${year} Expected`} value={money(data.yearExpected)} icon={CircleDollarSign} />
                  <MiniStat title={`${year} Paid`} value={money(data.yearPaid)} icon={Wallet} />
                  <MiniStat title={`${year} Due`} value={money(data.yearDue)} icon={AlertCircle} />
                  <MiniStat title="Total Outstanding" value={money(data.totalOutstanding)} icon={AlertCircle} emphasis />
                </div>

                <section>
                  <div className="mb-3 flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-blue-600" /><h3 className="font-semibold text-gray-900">{year} Monthly Fee History</h3></div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-[720px] w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Month</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Monthly Fee</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Expected</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Paid</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Due</th><th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Status</th></tr></thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {data.months.map((item) => <tr key={item.month} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm font-medium text-gray-900">{item.month}</td><td className="px-4 py-3 text-right text-sm text-gray-600">{money(item.monthlyFee)}</td><td className="px-4 py-3 text-right text-sm text-gray-600">{money(item.expected)}</td><td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{money(item.paid)}</td><td className="px-4 py-3 text-right text-sm font-semibold text-red-600">{money(item.due)}</td><td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2"><History className="h-4 w-4 text-blue-600" /><h3 className="font-semibold text-gray-900">Payment History</h3></div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-[680px] w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Month</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Amount</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Method</th><th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Status</th></tr></thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {data.paymentHistory.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">No payment history found.</td></tr> : data.paymentHistory.map((payment) => <tr key={payment._id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</td><td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.month}, {payment.year}</td><td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{money(payment.amount)}</td><td className="px-4 py-3 text-sm capitalize text-gray-600">{payment.method}</td><td className="px-4 py-3 text-center"><StatusBadge status={payment.status === "paid" ? "paid" : "unpaid"} /></td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(data.methodTotals || {}).map(([method, amount]) => <div key={method} className="rounded-xl border border-gray-200 p-3"><div className="text-xs capitalize text-gray-500">{method}</div><div className="mt-1 font-bold text-gray-900">{money(amount)}</div></div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ title, value, icon: Icon, emphasis }) {
  return <div className={`rounded-xl border p-3 ${emphasis ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}><Icon className={`h-4 w-4 ${emphasis ? "text-red-600" : "text-gray-500"}`} /><div className="mt-2 text-[11px] font-medium text-gray-500">{title}</div><div className={`mt-0.5 text-base font-bold ${emphasis ? "text-red-700" : "text-gray-900"}`}>{value}</div></div>;
}
