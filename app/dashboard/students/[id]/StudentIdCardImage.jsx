"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";

const esc = (value) => String(value || "N/A").replace(/[&<>\"]/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[c]));

function loadPhoto(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || 300; c.height = img.naturalHeight || 300;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.92));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function StudentIdCardImage({ student }) {
  const [downloading, setDownloading] = useState(false);
  const photo = student?.photoUrl || student?.photo;
  const active = student?.status === "active";

  const downloadImage = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const w = 1200, h = 760;
      const photoData = await loadPhoto(photo);
      const name = esc(student?.name || "Student");
      const roll = esc(student?.rollNumber || "N/A");
      const cls = esc(student?.classLevel || "N/A");
      const batch = esc(student?.batch?.name || "N/A");
      const subject = esc(student?.batch?.subject || "N/A");
      const phone = esc(student?.phone || "N/A");
      const admission = esc(student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-BD") : "N/A");
      const status = esc(student?.status || "active").toUpperCase();
      const initial = esc((student?.name || "S").trim().charAt(0).toUpperCase());
      const photoSvg = photoData
        ? `<defs><clipPath id="pc"><circle cx="170" cy="300" r="105"/></clipPath></defs><image href="${photoData}" x="65" y="195" width="210" height="210" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc)"/>`
        : `<circle cx="170" cy="300" r="105" fill="#dbeafe"/><text x="170" y="320" text-anchor="middle" font-family="Arial,sans-serif" font-size="82" font-weight="800" fill="#1d4ed8">${initial}</text>`;
      const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0f172a"/><stop offset=".58" stop-color="#1d4ed8"/><stop offset="1" stop-color="#4f46e5"/></linearGradient><linearGradient id="a" x1="0" x2="1"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#818cf8"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0f172a" flood-opacity=".2"/></filter></defs><rect x="28" y="28" width="1144" height="704" rx="42" fill="#fff" filter="url(#s)"/><path d="M28 70Q28 28 70 28H1130Q1172 28 1172 70V215H28Z" fill="url(#g)"/><circle cx="1070" cy="70" r="170" fill="#fff" opacity=".06"/><text x="78" y="88" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="4" fill="#bfdbfe">STUDENT IDENTITY CARD</text><text x="78" y="145" font-family="Arial,sans-serif" font-size="42" font-weight="800" fill="#fff">Aminul Islam</text><text x="78" y="181" font-family="Arial,sans-serif" font-size="17" fill="#dbeafe">Academic Student Management System</text><circle cx="170" cy="300" r="118" fill="#fff"/>${photoSvg}<circle cx="170" cy="300" r="111" fill="none" stroke="#bfdbfe" stroke-width="6"/><circle cx="252" cy="382" r="17" fill="${active ? "#10b981" : "#94a3b8"}" stroke="#fff" stroke-width="7"/><text x="320" y="250" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#0f172a">${name}</text><text x="320" y="290" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#64748b">STUDENT ID  #${roll}</text><rect x="320" y="315" width="122" height="38" rx="19" fill="${active ? "#d1fae5" : "#f1f5f9"}"/><text x="381" y="340" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="800" fill="${active ? "#047857" : "#475569"}">${status}</text><rect x="320" y="385" width="365" height="92" rx="20" fill="#f8fafc" stroke="#e2e8f0"/><text x="345" y="415" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#94a3b8">CLASS</text><text x="345" y="449" font-family="Arial,sans-serif" font-size="19" font-weight="800" fill="#1e293b">${cls}</text><text x="510" y="415" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#94a3b8">BATCH</text><text x="510" y="449" font-family="Arial,sans-serif" font-size="19" font-weight="800" fill="#1e293b">${batch}</text><rect x="710" y="250" width="390" height="62" rx="16" fill="#f8fafc" stroke="#e2e8f0"/><text x="738" y="276" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#94a3b8">SUBJECT</text><text x="738" y="300" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#1e293b">${subject}</text><rect x="710" y="328" width="390" height="62" rx="16" fill="#f8fafc" stroke="#e2e8f0"/><text x="738" y="354" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#94a3b8">PHONE</text><text x="738" y="378" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#1e293b">${phone}</text><line x1="78" y1="520" x2="1100" y2="520" stroke="#e2e8f0" stroke-width="2"/><text x="78" y="555" font-family="Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#94a3b8">ADMISSION DATE</text><text x="78" y="590" font-family="Arial,sans-serif" font-size="20" font-weight="800" fill="#1e293b">${admission}</text><text x="500" y="555" font-family="Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#94a3b8">CARD TYPE</text><text x="500" y="590" font-family="Arial,sans-serif" font-size="20" font-weight="800" fill="#1e293b">OFFICIAL STUDENT ID</text><rect x="965" y="545" width="105" height="105" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/><path d="M983 565h25v25h-25zM1027 565h25v25h-25zM983 607h25v25h-25zM1032 607h7v7h-7zM1046 607h7v7h-7zM1032 621h7v11h-7zM1046 621h7v7h-7z" fill="#0f172a"/><text x="1017" y="675" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#94a3b8">VERIFY ID</text><rect x="78" y="666" width="1022" height="4" rx="2" fill="url(#a)"/></svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
      const canvas = document.createElement("canvas"); canvas.width = w * 2; canvas.height = h * 2;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url);
      const a = document.createElement("a"); a.href = canvas.toDataURL("image/png", 1); a.download = `student-id-${student?.rollNumber || student?._id}.png`; a.click();
    } catch (error) { console.error(error); alert("ID Card image তৈরি করা যায়নি। আবার চেষ্টা করুন।"); }
    finally { setDownloading(false); }
  };

  return <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 no-print"><div className="mb-4 flex items-center justify-between"><div><p className="text-base font-semibold text-slate-900">Student ID Card</p><p className="mt-0.5 text-xs text-slate-500">Modern card • Download as PNG image</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">#{student?.rollNumber}</span></div><div className="rounded-[26px] bg-slate-100/80 p-3 sm:p-6"><div className="mx-auto max-w-[720px] overflow-hidden rounded-[24px] bg-white shadow-xl ring-1 ring-slate-200"><div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-800 to-indigo-600 px-6 py-7 text-white"><div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10"/><p className="relative text-[10px] font-bold uppercase tracking-[.25em] text-blue-200">Student Identity Card</p><h3 className="relative mt-2 text-2xl font-extrabold">Aminul Islam</h3><p className="relative mt-1 text-xs text-blue-100">Academic Student Management System</p></div><div className="p-5 sm:p-7"><div className="flex items-center gap-6"><div className="relative shrink-0">{photo ? <img src={photo} alt={student?.name} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-blue-100 sm:h-32 sm:w-32"/> : <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-4xl font-extrabold text-blue-700 sm:h-32 sm:w-32">{student?.name?.charAt(0) || "S"}</div>}<span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white ${active ? "bg-emerald-500" : "bg-slate-400"}`}/></div><div className="min-w-0"><h4 className="truncate text-2xl font-extrabold text-slate-950">{student?.name}</h4><p className="mt-1 text-sm font-semibold text-slate-500">Student ID: #{student?.rollNumber}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student?.status}</span></div></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><Field label="Class" value={student?.classLevel}/><Field label="Batch" value={student?.batch?.name}/><Field label="Subject" value={student?.batch?.subject}/><Field label="Phone" value={student?.phone}/></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admission Date</p><p className="mt-1 text-sm font-bold text-slate-700">{student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-BD") : "N/A"}</p></div><div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-[9px] font-extrabold tracking-widest text-slate-400">QR</div></div></div></div></div></div><div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={downloadImage} disabled={downloading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"><Download className="h-4 w-4"/>{downloading ? "Preparing Image..." : "Download PNG"}</button><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"><Printer className="h-4 w-4"/>Print ID Card</button></div></div>;
}

function Field({ label, value }) { return <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100"><p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">{label}</p><p className="mt-1 truncate text-xs font-bold text-slate-800">{value || "N/A"}</p></div>; }
