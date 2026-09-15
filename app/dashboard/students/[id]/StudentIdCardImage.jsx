"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";

const esc = (value) =>
  String(value || "N/A").replace(/[&<>\"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
  })[c]);

const wrapText = (value, maxChars) => {
  const text = String(value || "N/A").trim();
  if (text.length <= maxChars) return [text];

  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    if (word.length > maxChars) {
      if (line) {
        lines.push(line);
        line = "";
      }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      continue;
    }

    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 2);
};

const svgLines = (value, x, y, maxChars, options = {}) => {
  const { fontSize = 18, lineHeight = 24, weight = 800, fill = "#1e293b" } = options;
  return wrapText(value, maxChars)
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${esc(line)}</tspan>`
    )
    .join("");
};

function loadPhoto(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 300;
        const context = canvas.getContext("2d");
        if (!context) return resolve(null);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        resolve(null);
      }
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
      const width = 1200;
      const height = 760;
      const photoData = await loadPhoto(photo);

      const rawName = student?.name || "Student";
      const nameLines = wrapText(rawName, 22);
      const roll = student?.rollNumber || "N/A";
      const cls = student?.classLevel || "N/A";
      const batch = student?.batch?.name || "N/A";
      const subject = student?.batch?.subject || "N/A";
      const phone = student?.phone || "N/A";
      const admission = student?.admissionDate
        ? new Date(student.admissionDate).toLocaleDateString("en-BD")
        : "N/A";
      const status = String(student?.status || "active").toUpperCase();
      const initial = String(rawName).trim().charAt(0).toUpperCase() || "S";

      const photoSvg = photoData
        ? `<image href="${photoData}" x="65" y="195" width="210" height="210" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>`
        : `<circle cx="170" cy="300" r="105" fill="#dbeafe"/><text x="170" y="320" text-anchor="middle" font-family="Arial, Noto Sans, sans-serif" font-size="82" font-weight="800" fill="#1d4ed8">${esc(initial)}</text>`;

      const nameSvg = nameLines
        .map(
          (line, index) =>
            `<tspan x="320" dy="${index === 0 ? 0 : 34}" font-size="${nameLines.length > 1 ? 27 : 32}" font-weight="800" fill="#0f172a">${esc(line)}</tspan>`
        )
        .join("");
      const infoTop = nameLines.length > 1 ? 322 : 290;
      const statusTop = nameLines.length > 1 ? 347 : 315;

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="headerGradient" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#0f172a"/>
      <stop offset=".58" stop-color="#1d4ed8"/>
      <stop offset="1" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="accentGradient" x1="0" x2="1">
      <stop stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#818cf8"/>
    </linearGradient>
    <filter id="cardShadow">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0f172a" flood-opacity=".2"/>
    </filter>
    <clipPath id="photoClip">
      <circle cx="170" cy="300" r="105"/>
    </clipPath>
  </defs>

  <rect x="28" y="28" width="1144" height="704" rx="42" fill="#ffffff" filter="url(#cardShadow)"/>
  <path d="M28 70Q28 28 70 28H1130Q1172 28 1172 70V215H28Z" fill="url(#headerGradient)"/>
  <circle cx="1070" cy="70" r="170" fill="#ffffff" opacity=".06"/>

  <text x="78" y="88" font-family="Arial, Noto Sans, sans-serif" font-size="22" font-weight="700" letter-spacing="4" fill="#bfdbfe">STUDENT IDENTITY CARD</text>
  <text x="78" y="145" font-family="Arial, Noto Sans, sans-serif" font-size="42" font-weight="800" fill="#ffffff">Aminul Islam</text>
  <text x="78" y="181" font-family="Arial, Noto Sans, sans-serif" font-size="17" fill="#dbeafe">Academic Student Management System</text>

  <circle cx="170" cy="300" r="118" fill="#ffffff"/>
  ${photoSvg}
  <circle cx="170" cy="300" r="111" fill="none" stroke="#bfdbfe" stroke-width="6"/>
  <circle cx="252" cy="382" r="17" fill="${active ? "#10b981" : "#94a3b8"}" stroke="#ffffff" stroke-width="7"/>

  <text x="320" y="250" font-family="Arial, Noto Sans, sans-serif">${nameSvg}</text>
  <text x="320" y="${infoTop}" font-family="Arial, Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#64748b">STUDENT ID  #${esc(roll)}</text>
  <rect x="320" y="${statusTop}" width="122" height="38" rx="19" fill="${active ? "#d1fae5" : "#f1f5f9"}"/>
  <text x="381" y="${statusTop + 25}" text-anchor="middle" font-family="Arial, Noto Sans, sans-serif" font-size="14" font-weight="800" fill="${active ? "#047857" : "#475569"}">${esc(status)}</text>

  <rect x="320" y="395" width="365" height="94" rx="20" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="345" y="425" font-family="Arial, Noto Sans, sans-serif" font-size="13" font-weight="700" fill="#94a3b8">CLASS</text>
  <text x="345" y="458" font-family="Arial, Noto Sans, sans-serif">${svgLines(cls, 345, 458, 15, { fontSize: 16, lineHeight: 20 })}</text>
  <text x="515" y="425" font-family="Arial, Noto Sans, sans-serif" font-size="13" font-weight="700" fill="#94a3b8">BATCH</text>
  <text x="515" y="458" font-family="Arial, Noto Sans, sans-serif">${svgLines(batch, 515, 458, 15, { fontSize: 15, lineHeight: 20 })}</text>

  <rect x="710" y="250" width="390" height="74" rx="16" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="738" y="276" font-family="Arial, Noto Sans, sans-serif" font-size="12" font-weight="700" fill="#94a3b8">SUBJECT</text>
  <text x="738" y="301" font-family="Arial, Noto Sans, sans-serif">${svgLines(subject, 738, 301, 29, { fontSize: 16, lineHeight: 19 })}</text>

  <rect x="710" y="340" width="390" height="74" rx="16" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="738" y="366" font-family="Arial, Noto Sans, sans-serif" font-size="12" font-weight="700" fill="#94a3b8">PHONE</text>
  <text x="738" y="391" font-family="Arial, Noto Sans, sans-serif">${svgLines(phone, 738, 391, 29, { fontSize: 16, lineHeight: 19 })}</text>

  <line x1="78" y1="530" x2="1100" y2="530" stroke="#e2e8f0" stroke-width="2"/>
  <text x="78" y="565" font-family="Arial, Noto Sans, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#94a3b8">ADMISSION DATE</text>
  <text x="78" y="600" font-family="Arial, Noto Sans, sans-serif" font-size="20" font-weight="800" fill="#1e293b">${esc(admission)}</text>
  <text x="500" y="565" font-family="Arial, Noto Sans, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#94a3b8">CARD TYPE</text>
  <text x="500" y="600" font-family="Arial, Noto Sans, sans-serif" font-size="20" font-weight="800" fill="#1e293b">OFFICIAL STUDENT ID</text>

  <rect x="965" y="545" width="105" height="105" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
  <path d="M983 565h25v25h-25zM1027 565h25v25h-25zM983 607h25v25h-25zM1032 607h7v7h-7zM1046 607h7v7h-7zM1032 621h7v11h-7zM1046 621h7v7h-7z" fill="#0f172a"/>
  <text x="1017" y="675" text-anchor="middle" font-family="Arial, Noto Sans, sans-serif" font-size="10" font-weight="700" fill="#94a3b8">VERIFY ID</text>
  <rect x="78" y="682" width="1022" height="4" rx="2" fill="url(#accentGradient)"/>
</svg>`;

      const svgUrl = URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      );

      try {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = svgUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = width * 2;
        canvas.height = height * 2;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (!blob) throw new Error("PNG generation failed");

        const downloadUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = downloadUrl;
        anchor.download = `student-id-${student?.rollNumber || student?._id}.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(downloadUrl);
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    } catch (error) {
      console.error("Student ID card image generation failed:", error);
      alert("ID Card image তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="no-print mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900">Student ID Card</p>
          <p className="mt-0.5 text-xs text-slate-500">Modern card • Download as PNG image</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          #{student?.rollNumber || "N/A"}
        </span>
      </div>

      <div className="rounded-[26px] bg-slate-100/80 p-3 sm:p-6">
        <div className="mx-auto max-w-[720px] overflow-hidden rounded-[24px] bg-white shadow-xl ring-1 ring-slate-200">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-800 to-indigo-600 px-6 py-7 text-white">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10" />
            <p className="relative text-[10px] font-bold uppercase tracking-[.25em] text-blue-200">Student Identity Card</p>
            <h3 className="relative mt-2 text-2xl font-extrabold">Aminul Islam</h3>
            <p className="relative mt-1 text-xs text-blue-100">Academic Student Management System</p>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                {photo ? (
                  <img src={photo} alt={student?.name || "Student"} crossOrigin="anonymous" className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-blue-100 sm:h-32 sm:w-32" />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-4xl font-extrabold text-blue-700 sm:h-32 sm:w-32">{student?.name?.charAt(0) || "S"}</div>
                )}
                <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
              </div>

              <div className="min-w-0">
                <h4 className="truncate text-2xl font-extrabold text-slate-950">{student?.name || "Student"}</h4>
                <p className="mt-1 text-sm font-semibold text-slate-500">Student ID: #{student?.rollNumber || "N/A"}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student?.status || "active"}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Class" value={student?.classLevel} />
              <Field label="Batch" value={student?.batch?.name} />
              <Field label="Subject" value={student?.batch?.subject} />
              <Field label="Phone" value={student?.phone} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admission Date</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-BD") : "N/A"}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-[9px] font-extrabold tracking-widest text-slate-400">QR</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={downloadImage} disabled={downloading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70">
          <Download className="h-4 w-4" />
          {downloading ? "Preparing Image..." : "Download PNG"}
        </button>
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">
          <Printer className="h-4 w-4" />
          Print ID Card
        </button>
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-slate-800">{value || "N/A"}</p>
    </div>
  );
}
