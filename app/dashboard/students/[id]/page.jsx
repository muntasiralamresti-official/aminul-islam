"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Eye, Phone, Mail, MapPin, CalendarDays, GraduationCap, ShieldCheck, UsersRound, Clock3, Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

export default function StudentProfilePage({ params }) {
  const { id } = use(params);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => setStudent(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl space-y-4 p-4"><div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" /><div className="h-64 animate-pulse rounded-[26px] bg-slate-100" /><div className="h-52 animate-pulse rounded-[26px] bg-slate-100" /></div>;
  if (!student) return <div className="p-4 text-red-500">Student not found</div>;

  const displayPhoto = student.photoUrl || student.photo;
  const isActive = student.status === "active";

  const downloadIdCard = async () => {
    if (downloading) return;
    setDownloading(true);

    const exportRoot = document.createElement("div");
    exportRoot.id = "student-id-card-pdf-download";
    exportRoot.style.cssText = [
      "position:fixed", "left:-10000px", "top:0", "width:430px", "box-sizing:border-box",
      "background:#ffffff", "color:#0f172a", "font-family:Arial,Helvetica,sans-serif",
      "font-size:14px", "line-height:1.35", "border:1px solid #e2e8f0", "border-radius:22px",
      "overflow:hidden", "z-index:-1", "all:initial", "display:block", "width:430px",
      "box-sizing:border-box", "background:#ffffff", "color:#0f172a", "font-family:Arial,Helvetica,sans-serif"
    ].join(";");

    const header = document.createElement("div");
    header.style.cssText = "box-sizing:border-box;background:#1d4ed8;color:#ffffff;padding:18px 20px;";
    const eyebrow = document.createElement("div");
    eyebrow.textContent = "STUDENT IDENTITY CARD";
    eyebrow.style.cssText = "font-size:11px;font-weight:700;letter-spacing:2px;opacity:.85;margin:0 0 5px;";
    const school = document.createElement("div");
    school.textContent = "Aminul Islam";
    school.style.cssText = "font-size:21px;font-weight:800;margin:0;";
    header.append(eyebrow, school);

    const body = document.createElement("div");
    body.style.cssText = "box-sizing:border-box;background:#ffffff;padding:20px;";

    const identity = document.createElement("div");
    identity.style.cssText = "display:flex;align-items:center;gap:16px;min-height:96px;";

    const photoWrap = document.createElement("div");
    photoWrap.style.cssText = "width:96px;height:96px;min-width:96px;border-radius:16px;overflow:hidden;background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#1d4ed8;font-size:30px;font-weight:800;";
    photoWrap.textContent = student.name?.charAt(0) || "S";

    if (displayPhoto) {
      const img = document.createElement("img");
      img.src = displayPhoto;
      img.alt = student.name || "Student";
      img.crossOrigin = "anonymous";
      img.style.cssText = "display:block;width:96px;height:96px;object-fit:cover;";
      photoWrap.textContent = "";
      photoWrap.appendChild(img);
    }

    const identityText = document.createElement("div");
    identityText.style.cssText = "min-width:0;flex:1;";
    const name = document.createElement("div");
    name.textContent = student.name || "Student";
    name.style.cssText = "font-size:20px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    const idText = document.createElement("div");
    idText.textContent = `Student ID: #${student.rollNumber || "N/A"}`;
    idText.style.cssText = "margin-top:5px;font-size:13px;font-weight:600;color:#64748b;";
    const status = document.createElement("span");
    status.textContent = student.status || "active";
    status.style.cssText = `display:inline-block;margin-top:8px;padding:4px 9px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;background:${isActive ? "#d1fae5" : "#f1f5f9"};color:${isActive ? "#047857" : "#475569"};`;
    identityText.append(name, idText, status);
    identity.append(photoWrap, identityText);

    const fields = document.createElement("div");
    fields.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;";
    const addField = (label, value) => {
      const item = document.createElement("div");
      item.style.cssText = "box-sizing:border-box;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;min-height:54px;";
      const l = document.createElement("div");
      l.textContent = label;
      l.style.cssText = "font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;";
      const v = document.createElement("div");
      v.textContent = String(value || "N/A");
      v.style.cssText = "margin-top:4px;font-size:12px;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
      item.append(l, v);
      fields.appendChild(item);
    };
    addField("Class", student.classLevel);
    addField("Batch", student.batch?.name);
    addField("Subject", student.batch?.subject);
    addField("Phone", student.phone);

    const footer = document.createElement("div");
    footer.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:14px;border-top:1px solid #e2e8f0;";
    const admission = document.createElement("div");
    const admissionLabel = document.createElement("div");
    admissionLabel.textContent = "ADMISSION DATE";
    admissionLabel.style.cssText = "font-size:10px;font-weight:700;letter-spacing:1px;color:#94a3b8;";
    const admissionValue = document.createElement("div");
    admissionValue.textContent = student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-BD") : "N/A";
    admissionValue.style.cssText = "margin-top:4px;font-size:12px;font-weight:700;color:#334155;";
    admission.append(admissionLabel, admissionValue);
    const qr = document.createElement("div");
    qr.textContent = "QR\nCODE";
    qr.style.cssText = "width:54px;height:54px;border:2px dashed #cbd5e1;border-radius:12px;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-line;font-size:9px;font-weight:700;color:#94a3b8;";
    footer.append(admission, qr);

    body.append(identity, fields, footer);
    exportRoot.append(header, body);
    document.body.appendChild(exportRoot);

    try {
      await document.fonts?.ready;
      const images = [...exportRoot.querySelectorAll("img")];
      await Promise.all(images.map((img) => new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.onload = resolve;
        img.onerror = () => {
          const fallback = document.createElement("div");
          fallback.textContent = student.name?.charAt(0) || "S";
          fallback.style.cssText = "width:96px;height:96px;border-radius:16px;background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#1d4ed8;font-size:30px;font-weight:800;";
          img.replaceWith(fallback);
          resolve();
        };
        setTimeout(resolve, 5000);
      })));

      let canvas;
      try {
        canvas = await html2canvas(exportRoot, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 5000,
          removeContainer: true,
        });
      } catch (firstError) {
        console.warn("ID photo/export image failed; retrying without images.", firstError);
        exportRoot.querySelectorAll("img").forEach((img) => {
          const fallback = document.createElement("div");
          fallback.textContent = student.name?.charAt(0) || "S";
          fallback.style.cssText = "width:96px;height:96px;border-radius:16px;background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#1d4ed8;font-size:30px;font-weight:800;";
          img.replaceWith(fallback);
        });
        canvas = await html2canvas(exportRoot, { scale: 3, backgroundColor: "#ffffff", logging: false, removeContainer: true });
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const cardWidth = 86;
      const cardHeight = (canvas.height * cardWidth) / canvas.width;
      const x = (pageWidth - cardWidth) / 2;
      pdf.addImage(canvas.toDataURL("image/png", 1), "PNG", x, 20, cardWidth, cardHeight, undefined, "FAST");
      pdf.save(`student-id-${student.rollNumber || student._id}.pdf`);
    } catch (error) {
      console.error("Failed to generate ID card PDF", error);
      alert("PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      exportRoot.remove();
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 no-print">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <Link href="/dashboard/students" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50" aria-label="Back to students"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="min-w-0"><h1 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Student Information</h1><p className="hidden text-sm text-slate-500 sm:block">Student profile and admission details</p></div>
        </div>
        <Link href={`/dashboard/students/${student._id}/edit`} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 text-sm font-semibold text-white"><Edit className="h-4 w-4" /><span className="hidden sm:inline">Edit Profile</span><span className="sm:hidden">Edit</span></Link>
      </div>

      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm no-print">
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/70 to-white p-4 sm:p-6"><div className="flex items-center gap-4"><div className="relative shrink-0">{displayPhoto ? <img src={displayPhoto} alt={student.name} className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md sm:h-24 sm:w-24" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 sm:h-24 sm:w-24">{student.name?.charAt(0) || "S"}</div>}<span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="truncate text-2xl font-bold text-slate-950 sm:text-3xl">{student.name}</h2><p className="text-sm text-slate-500">ID: #{student.rollNumber}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{student.status}</span></div></div></div><div className="mt-5 grid grid-cols-1 gap-2.5 text-sm text-slate-700 sm:grid-cols-3"><div className="rounded-xl bg-white/75 px-3 py-2.5 ring-1 ring-slate-200/70">{student.batch?.subject || "Academic"} • {student.classLevel || "Class"}</div><div className="rounded-xl bg-white/75 px-3 py-2.5 ring-1 ring-slate-200/70">{student.batch?.name || "No batch"}</div><div className="rounded-xl bg-white/75 px-3 py-2.5 ring-1 ring-slate-200/70">Monthly fee {money(student.monthlyFee)}</div></div></div>
        <div className="divide-y divide-slate-100 px-4 sm:px-6"><InfoRow icon={UsersRound} label="Full Name" value={student.name} /><InfoRow icon={Phone} label="Contact" value={student.phone || "N/A"} action={student.phone ? <a href={`tel:${student.phone}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Phone className="h-4 w-4" /></a> : null} /><InfoRow icon={Mail} label="Email" value={student.email || "N/A"} /><InfoRow icon={MapPin} label="Address" value={student.address || "N/A"} /><InfoRow icon={CalendarDays} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-BD") : "N/A"} /></div>
        <div className="border-t border-slate-100 p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-slate-500" /><span className="font-semibold">Status</span></div><span className={`rounded-full px-4 py-2 text-sm font-bold uppercase ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student.status}</span></div></div>
      </section>

      <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm no-print"><p className="mb-3 font-semibold text-slate-900">Actions</p><div className="grid grid-cols-3 gap-3"><div className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Eye className="h-6 w-6" /><span className="mt-1 text-sm font-semibold">View</span></div><Link href={`/dashboard/students/${student._id}/edit`} className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-blue-600 text-white"><Edit className="h-6 w-6" /><span className="mt-1 text-sm font-semibold">Edit</span></Link><Link href={`/dashboard/fees?student=${student._id}`} className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><WalletIcon /><span className="mt-1 text-sm font-semibold">Fees</span></Link></div></section>

      <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm no-print"><div className="mb-4 flex items-center justify-between"><div><p className="font-semibold text-slate-900">Student ID Card</p><p className="mt-0.5 text-xs text-slate-500">Download the ID card directly as a PDF.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">#{student.rollNumber}</span></div><div className="flex justify-center rounded-2xl bg-slate-50 p-4 sm:p-6"><div id="student-id-card-pdf" className="w-full max-w-[430px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-lg"><div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-5 py-4 text-white"><p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">Student Identity Card</p><h3 className="mt-1 text-xl font-extrabold">Aminul Islam</h3></div><div className="p-5"><div className="flex items-center gap-4">{displayPhoto ? <img src={displayPhoto} alt={student.name} className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow ring-1 ring-slate-200" /> : <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-100 text-3xl font-extrabold text-blue-700">{student.name?.charAt(0) || "S"}</div>}<div className="min-w-0"><h4 className="truncate text-xl font-extrabold text-slate-950">{student.name}</h4><p className="mt-1 text-sm font-semibold text-slate-500">Student ID: #{student.rollNumber}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student.status}</span></div></div><div className="mt-5 grid grid-cols-2 gap-2.5"><IdField label="Class" value={student.classLevel} /><IdField label="Batch" value={student.batch?.name} /><IdField label="Subject" value={student.batch?.subject} /><IdField label="Phone" value={student.phone} /></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admission Date</p><p className="mt-1 text-xs font-semibold text-slate-700">{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-BD") : "N/A"}</p></div><div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-[9px] font-bold text-slate-400">QR<br />CODE</div></div></div></div></div><div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={downloadIdCard} disabled={downloading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white disabled:opacity-70"><Download className="h-4 w-4" />{downloading ? "Generating PDF..." : "Download PDF"}</button><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"><Printer className="h-4 w-4" />Print ID Card</button></div></section>

      <style jsx global>{`.print-only-id-card{display:none}@media print{@page{size:A4 portrait;margin:12mm}body *{visibility:hidden!important}.print-only-id-card,.print-only-id-card *{visibility:visible!important}}`}</style>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, action }) { return <div className="flex min-h-[68px] items-center gap-3 py-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-0.5 truncate text-[15px] font-medium text-slate-950">{value}</p></div>{action}</div>; }
function IdField({ label, value }) { return <div className="rounded-xl bg-slate-50 px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-xs font-bold text-slate-800">{value || "N/A"}</p></div>; }
function WalletIcon() { return <span className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-current"><span className="h-1.5 w-3 rounded-full border border-current" /></span>; }
