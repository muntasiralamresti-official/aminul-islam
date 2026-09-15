"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Printer, Search, UserRound, X } from "lucide-react";

const qrUrl = (studentId) => `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(`${window.location.origin}/dashboard/students/${studentId}`)}`;

function StudentCard({ student, centerName, onRemove }) {
  const photo = student.photoUrl || student.photo;
  return (
    <article className="id-card print-card relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-blue-600" />
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 pb-3 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><CreditCard className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-extrabold uppercase tracking-[.16em] text-blue-600">{centerName || "Aminul Islam"}</p>
          <p className="text-sm font-black tracking-wide text-slate-900">STUDENT ID CARD</p>
        </div>
        <button type="button" onClick={onRemove} className="no-print flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove card"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex gap-4 px-5 py-5">
        <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-blue-100 bg-blue-50">
          {photo ? <img src={photo} alt={student.name} className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-blue-300" />}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h2 className="truncate text-lg font-black text-slate-950">{student.name}</h2>
          <p className="text-xs font-semibold text-slate-500">Class: <span className="text-slate-800">{student.classLevel || "—"}</span></p>
          <p className="text-xs font-semibold text-slate-500">Batch: <span className="text-slate-800">{student.batch?.name || "—"}</span></p>
          <p className="text-xs font-semibold text-slate-500">Roll / ID: <span className="text-slate-800">{student.rollNumber || "—"}</span></p>
        </div>
        <img src={qrUrl(student._id)} alt="Student QR" className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 p-1" />
      </div>

      <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-[10px]">
        <div><span className="font-bold uppercase tracking-wider text-slate-400">Guardian</span><p className="mt-0.5 font-bold text-slate-700">{student.guardianPhone || "—"}</p></div>
        <div className="text-right"><span className="font-bold uppercase tracking-wider text-slate-400">Status</span><p className="mt-0.5 font-bold uppercase text-emerald-600">{student.status || "active"}</p></div>
      </div>
    </article>
  );
}

export default function IDCardsPage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [centerName, setCenterName] = useState("Aminul Islam");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("aminul-islam-center-name");
      if (cached) setCenterName(cached);
    } catch {}
    fetch("/api/settings", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(data => { if (data?.centerName) setCenterName(data.centerName); }).catch(() => {});
    fetch("/api/students?page=1&limit=100", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(data => setStudents(data?.students || [])).catch(() => setStudents([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s => [s.name, s.rollNumber, s.phone, s.batch?.name, s.classLevel].some(v => String(v || "").toLowerCase().includes(q)));
  }, [students, search]);

  const toggle = (student) => setSelected(current => current.some(s => s._id === student._id) ? current.filter(s => s._id !== student._id) : [...current, student]);
  const removeCard = (id) => setSelected(current => current.filter(s => s._id !== id));

  return (
    <div className="w-full pb-6">
      <div className="no-print mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Student ID Cards</h1><p className="mt-1 text-sm text-gray-600">Select students and generate print-ready ID cards.</p></div>
        <button type="button" onClick={() => window.print()} disabled={!selected.length} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Printer className="mr-2 h-4 w-4" />Print {selected.length || "Cards"}</button>
      </div>

      <section className="no-print rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student by name, roll, batch..." className="min-h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" /></div>
          <button type="button" onClick={() => setSelected(filtered)} disabled={!filtered.length} className="min-h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Select visible</button>
          <button type="button" onClick={() => setSelected([])} className="min-h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-500 hover:bg-gray-50">Clear</button>
        </div>
        <div className="mt-3 flex max-h-72 flex-wrap gap-2 overflow-y-auto">
          {loading ? <p className="p-3 text-sm text-gray-500">Loading students...</p> : filtered.length ? filtered.map(student => {
            const active = selected.some(s => s._id === student._id);
            return <button key={student._id} type="button" onClick={() => toggle(student)} className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:border-blue-200"}`}><span className="block max-w-[180px] truncate">{student.name}</span><span className="mt-0.5 block text-[10px] font-medium opacity-70">Roll {student.rollNumber || "—"}</span></button>;
          }) : <p className="p-3 text-sm text-gray-500">No students found.</p>}
        </div>
      </section>

      <div className="no-print mt-5 flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-wider text-gray-500">Preview</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{selected.length} selected</span></div>
      {!selected.length ? <div className="no-print mt-3 flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center"><div><CreditCard className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-2 text-sm font-semibold text-gray-500">Select one or more students to preview their ID cards.</p></div></div> : <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{selected.map(student => <StudentCard key={student._id} student={student} centerName={centerName} onRemove={() => removeCard(student._id)} />)}</div>}

      <style jsx global>{`@media print { @page { size: A4; margin: 10mm; } body { background: white !important; } body * { visibility: hidden !important; } .print-card, .print-card * { visibility: visible !important; } .print-card { break-inside: avoid; box-shadow: none !important; border: 1px solid #cbd5e1 !important; width: 86mm; min-height: 54mm; display: inline-block; vertical-align: top; margin: 0 5mm 8mm 0; } .no-print { display: none !important; } }`}</style>
    </div>
  );
}
