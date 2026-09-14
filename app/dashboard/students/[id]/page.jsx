"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Eye, Phone, Mail, MapPin, CalendarDays, GraduationCap, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import StudentIdCardImage from "./StudentIdCardImage";

const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

export default function StudentProfilePage({ params }) {
  const { id } = use(params);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${id}`).then((res) => res.json()).then(setStudent).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl space-y-4 p-4"><div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" /><div className="h-64 animate-pulse rounded-[26px] bg-slate-100" /><div className="h-52 animate-pulse rounded-[26px] bg-slate-100" /></div>;
  if (!student) return <div className="p-4 text-red-500">Student not found</div>;

  const photo = student.photoUrl || student.photo;
  const active = student.status === "active";

  return <div className="mx-auto w-full max-w-4xl pb-8">
    <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 no-print"><div className="flex min-w-0 items-center gap-2.5 sm:gap-4"><Link href="/dashboard/students" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /></Link><div className="min-w-0"><h1 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Student Information</h1><p className="hidden text-sm text-slate-500 sm:block">Student profile and admission details</p></div></div><Link href={`/dashboard/students/${student._id}/edit`} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 text-sm font-semibold text-white"><Edit className="h-4 w-4" /><span className="hidden sm:inline">Edit Profile</span><span className="sm:hidden">Edit</span></Link></div>

    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm no-print"><div className="bg-gradient-to-br from-slate-50 via-blue-50/70 to-white p-4 sm:p-6"><div className="flex items-center gap-4"><div className="relative shrink-0">{photo ? <img src={photo} alt={student.name} className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md sm:h-24 sm:w-24" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 sm:h-24 sm:w-24">{student.name?.charAt(0) || "S"}</div>}<span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white ${active ? "bg-emerald-500" : "bg-slate-400"}`} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="truncate text-2xl font-bold text-slate-950 sm:text-3xl">{student.name}</h2><p className="text-sm text-slate-500">ID: #{student.rollNumber}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{student.status}</span></div></div></div><div className="mt-5 grid grid-cols-1 gap-2.5 text-sm text-slate-700 sm:grid-cols-3"><div className="rounded-xl bg-white/75 px-3 py-2.5 ring-1 ring-slate-200/70">{student.batch?.subject || "Academic"} • {student.classLevel || "Class"}</div><div className="rounded-xl bg-white/75 px-3 py-2.5 ring-1 ring-slate-200/70">{student.batch?.name || "No batch"}</div><div className="rounded-xl bg-white/75 px-3 py-2.5 ring-1 ring-slate-200/70">Monthly fee {money(student.monthlyFee)}</div></div></div><div className="divide-y divide-slate-100 px-4 sm:px-6"><InfoRow icon={UsersRound} label="Full Name" value={student.name} /><InfoRow icon={Phone} label="Contact" value={student.phone || "N/A"} action={student.phone ? <a href={`tel:${student.phone}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Phone className="h-4 w-4" /></a> : null} /><InfoRow icon={Mail} label="Email" value={student.email || "N/A"} /><InfoRow icon={MapPin} label="Address" value={student.address || "N/A"} /><InfoRow icon={CalendarDays} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-BD") : "N/A"} /></div><div className="border-t border-slate-100 p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-slate-500" /><span className="font-semibold">Status</span></div><span className={`rounded-full px-4 py-2 text-sm font-bold uppercase ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student.status}</span></div></div></section>

    <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm no-print"><p className="mb-3 font-semibold text-slate-900">Actions</p><div className="grid grid-cols-3 gap-3"><div className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Eye className="h-6 w-6" /><span className="mt-1 text-sm font-semibold">View</span></div><Link href={`/dashboard/students/${student._id}/edit`} className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-blue-600 text-white"><Edit className="h-6 w-6" /><span className="mt-1 text-sm font-semibold">Edit</span></Link><Link href={`/dashboard/fees?student=${student._id}`} className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><WalletCards className="h-6 w-6" /><span className="mt-1 text-sm font-semibold">Fees</span></Link></div></section>

    <StudentIdCardImage student={student} />
  </div>;
}

function InfoRow({ icon: Icon, label, value, action }) { return <div className="flex min-h-[68px] items-center justify-between gap-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="truncate text-[15px] font-medium text-slate-950">{value}</p></div></div>{action}</div>; }
