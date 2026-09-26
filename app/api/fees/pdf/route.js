"use server";

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import connectMongo from "@/lib/db";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function periodIndex(year, monthIndex) {
  return year * 12 + monthIndex;
}

function findBengaliFont() {
  const packageDir = path.join(process.cwd(), "node_modules", "@fontsource", "noto-sans-bengali");
  const candidates = [
    path.join(packageDir, "files", "noto-sans-bengali-bengali-400-normal.ttf"),
    path.join(packageDir, "files", "noto-sans-bengali-latin-400-normal.ttf"),
    path.join(packageDir, "files", "noto-sans-bengali-400-normal.ttf"),
    path.join(packageDir, "NotoSansBengali-Regular.ttf"),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return null;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (/noto.?sans.?bengali/i.test(entry.name) && /\.ttf$/i.test(entry.name)) {
        return full;
      }
    }
    return null;
  };

  return walk(packageDir);
}

const money = (value) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

function drawCell(doc, text, x, y, width, height, options = {}) {
  const { align = "left", bold = false, fill = null, color = "#111827" } = options;
  if (fill) {
    doc.save().fillColor(fill).rect(x, y, width, height).fill().restore();
  }
  doc.save()
    .strokeColor("#e5e7eb")
    .lineWidth(0.5)
    .rect(x, y, width, height)
    .stroke()
    .fillColor(color)
    .fontSize(8)
    .font("NotoSansBengali")
    .text(String(text ?? "—"), x + 5, y + 6, {
      width: width - 10,
      height: height - 8,
      align,
      lineBreak: false,
      ellipsis: true,
    })
    .restore();
}

export async function GET(request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const year = Number.parseInt(searchParams.get("year"), 10) || new Date().getFullYear();
    const requestedMonth = searchParams.get("month") || MONTHS[new Date().getMonth()];
    const month = MONTHS.includes(requestedMonth) ? requestedMonth : MONTHS[new Date().getMonth()];
    const selectedMonthIndex = MONTHS.indexOf(month);
    const selectedPeriod = periodIndex(year, selectedMonthIndex);
    const status = searchParams.get("status") || "all";

    const [students, setting] = await Promise.all([
      Student.find({ status: "active" })
        .select("name rollNumber monthlyFee batch admissionDate status")
        .populate("batch", "name")
        .sort({ _id: 1 })
        .lean(),
      Setting.findOne().select("defaultFee").lean(),
    ]);

    const defaultFee = Number(setting?.defaultFee ?? 1000) || 1000;
    const payments = await Payment.find({ status: "paid" })
      .select("student month year amount discount date")
      .lean();

    const paymentTotals = new Map();

    for (const payment of payments) {
      const monthIndex = MONTHS.indexOf(payment.month);
      const paymentYear = Number(payment.year);
      if (monthIndex < 0 || !Number.isFinite(paymentYear)) continue;

      const paymentPeriod = periodIndex(paymentYear, monthIndex);
      const studentId = String(payment.student);
      const entry = paymentTotals.get(studentId) || { previousPaid: 0, currentPaid: 0 };

      const amount = (Number(payment.amount) || 0) + (Number(payment.discount) || 0);
      if (paymentPeriod <= selectedPeriod) {
        if (paymentPeriod === selectedPeriod) entry.currentPaid += amount;
        else entry.previousPaid += amount;
      }

      paymentTotals.set(studentId, entry);
    }

    let rows = students.map((student) => {
      const studentId = String(student._id);
      const monthlyFee = Number(student.monthlyFee ?? defaultFee) || 0;
      const admissionDate = student.admissionDate ? new Date(student.admissionDate) : null;
      const admissionYear = admissionDate?.getFullYear();
      const admissionMonth = admissionDate?.getMonth();
      const admissionPeriod = Number.isFinite(admissionYear) && Number.isFinite(admissionMonth)
        ? periodIndex(admissionYear, admissionMonth)
        : selectedPeriod;

      const admitted = admissionPeriod <= selectedPeriod;
      const currentExpected = admitted ? monthlyFee : 0;
      const previousExpected = admitted && admissionPeriod < selectedPeriod
        ? monthlyFee * (selectedPeriod - admissionPeriod)
        : 0;

      const paid = paymentTotals.get(studentId) || { previousPaid: 0, currentPaid: 0 };
      const previousDue = Math.max(previousExpected - paid.previousPaid, 0);
      const currentDue = Math.max(currentExpected - paid.currentPaid, 0);

      let paymentStatus = "unpaid";
      if (currentExpected > 0 && paid.currentPaid >= currentExpected) paymentStatus = "paid";
      else if (paid.currentPaid > 0) paymentStatus = "partial";

      return {
        name: student.name || "—",
        rollNumber: student.rollNumber || "—",
        batch: student.batch?.name || "—",
        monthlyFee,
        paid: paid.currentPaid,
        previousDue,
        currentDue,
        totalDue: previousDue + currentDue,
        paymentStatus,
      };
    });

    if (status !== "all") rows = rows.filter((row) => row.paymentStatus === status);

    const fontPath = findBengaliFont();
    if (!fontPath) throw new Error("Noto Sans Bengali font was not found after installation.");

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 32, bottom: 34, left: 32, right: 32 },
      info: {
        Title: `Fee Collection Report - ${month} ${year}`,
        Author: "Aminul Islam Coaching Center",
      },
    });

    doc.registerFont("NotoSansBengali", fontPath);
    doc.font("NotoSansBengali");

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const width = doc.page.width;
    const left = 32;
    const right = width - 32;
    const contentWidth = right - left;
    const statusLabel = status === "all" ? "All Students" : status === "paid" ? "Paid Students" : status === "partial" ? "Partial Payments" : "Unpaid Students";

    const drawHeader = () => {
      doc.font("NotoSansBengali").fillColor("#111827").fontSize(17).text("Aminul Islam Coaching Center", left, 28);
      doc.fontSize(11).fillColor("#4b5563").text("Fee Collection Report", left, 50);
      doc.fontSize(9).fillColor("#6b7280").text(`${month} ${year}  •  ${statusLabel}  •  ${rows.length} students`, left, 66);
      doc.moveTo(left, 82).lineTo(right, 82).strokeColor("#dbe1e8").lineWidth(0.7).stroke();
    };

    const columns = [
      ["#", 26, "center"],
      ["Student", 128, "left"],
      ["Roll", 62, "left"],
      ["Batch", 100, "left"],
      ["Monthly Fee", 76, "right"],
      ["Paid", 70, "right"],
      ["Previous Due", 80, "right"],
      ["Current Due", 78, "right"],
      ["Total Due", 76, "right"],
      ["Status", contentWidth - (26 + 128 + 62 + 100 + 76 + 70 + 80 + 78 + 76), "center"],
    ];

    const rowHeight = 26;
    const headerHeight = 28;
    let y = 96;

    const drawTableHeader = () => {
      let x = left;
      for (const [label, colWidth, align] of columns) {
        drawCell(doc, label, x, y, colWidth, headerHeight, { align, bold: true, fill: "#eef2f7", color: "#374151" });
        x += colWidth;
      }
      y += headerHeight;
    };

    const drawPageFooter = () => {
      const pageNumber = doc.bufferedPageRange().count;
      doc.font("NotoSansBengali").fontSize(8).fillColor("#9ca3af");
      doc.text(`Generated: ${new Date().toLocaleDateString("bn-BD")}`, left, doc.page.height - 24);
      doc.text(`Page ${pageNumber}`, right - 45, doc.page.height - 24, { width: 45, align: "right" });
    };

    drawHeader();
    drawTableHeader();

    rows.forEach((row, index) => {
      if (y + rowHeight > doc.page.height - 38) {
        drawPageFooter();
        doc.addPage();
        drawHeader();
        y = 96;
        drawTableHeader();
      }

      const values = [
        index + 1,
        row.name,
        row.rollNumber,
        row.batch,
        money(row.monthlyFee),
        money(row.paid),
        money(row.previousDue),
        money(row.currentDue),
        money(row.totalDue),
        row.paymentStatus === "paid" ? "Paid" : row.paymentStatus === "partial" ? "Partial" : "Unpaid",
      ];

      let x = left;
      columns.forEach(([_, colWidth, align], colIndex) => {
        drawCell(doc, values[colIndex], x, y, colWidth, rowHeight, {
          align,
          fill: index % 2 === 0 ? "#ffffff" : "#f8fafc",
          color: colIndex === 9
            ? row.paymentStatus === "paid" ? "#047857" : row.paymentStatus === "partial" ? "#b45309" : "#b91c1c"
            : "#1f2937",
        });
        x += colWidth;
      });
      y += rowHeight;
    });

    drawPageFooter();
    doc.end();

    await new Promise((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);
    });

    const pdf = Buffer.concat(chunks);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="fee-report-${month.toLowerCase()}-${year}-${status}.pdf"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Fee PDF error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate fee PDF" }, { status: 500 });
  }
}
