import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const periodIndex = (year, monthIndex) => year * 12 + monthIndex;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const selectedYear = Number.parseInt(searchParams.get("year"), 10) || new Date().getFullYear();

    await connectMongo();

    const [student, setting] = await Promise.all([
      Student.findById(id)
        .select("name rollNumber monthlyFee batch admissionDate status")
        .populate("batch", "name subject")
        .lean(),
      Setting.findOne().select("defaultFee").lean(),
    ]);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const payments = await Payment.find({ student: student._id, status: "paid" })
      .select("month year amount method date status createdAt")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const monthlyFee = Number(student.monthlyFee ?? setting?.defaultFee ?? 1000) || 0;
    const admissionDate = student.admissionDate ? new Date(student.admissionDate) : null;
    const admissionPeriod = admissionDate && !Number.isNaN(admissionDate.getTime())
      ? periodIndex(admissionDate.getFullYear(), admissionDate.getMonth())
      : periodIndex(selectedYear, 0);

    const now = new Date();
    const currentPeriod = periodIndex(now.getFullYear(), now.getMonth());
    const yearStartPeriod = periodIndex(selectedYear, 0);
    const yearEndPeriod = periodIndex(selectedYear, 11);

    const paidByPeriod = new Map();
    let totalPaidAllTime = 0;

    for (const payment of payments) {
      const monthIndex = MONTHS.indexOf(payment.month);
      if (monthIndex < 0 || !Number.isFinite(Number(payment.year))) continue;
      const key = periodIndex(Number(payment.year), monthIndex);
      const amount = Number(payment.amount) || 0;
      paidByPeriod.set(key, (paidByPeriod.get(key) || 0) + amount);
      totalPaidAllTime += amount;
    }

    let previousExpected = 0;
    let previousPaid = 0;
    const previousEnd = Math.min(yearStartPeriod - 1, currentPeriod);
    if (admissionPeriod <= previousEnd) {
      previousExpected = (previousEnd - admissionPeriod + 1) * monthlyFee;
      for (const [key, amount] of paidByPeriod.entries()) {
        if (key < yearStartPeriod) previousPaid += amount;
      }
    }
    const previousDue = Math.max(previousExpected - previousPaid, 0);

    const months = MONTHS.map((month, monthIndex) => {
      const key = periodIndex(selectedYear, monthIndex);
      const applicable = key >= admissionPeriod && key <= currentPeriod;
      const expected = applicable ? monthlyFee : 0;
      const paid = paidByPeriod.get(key) || 0;
      const due = Math.max(expected - paid, 0);

      let status = "upcoming";
      if (key < admissionPeriod) status = "not-applicable";
      else if (key <= currentPeriod) {
        if (expected > 0 && paid >= expected) status = "paid";
        else if (paid > 0) status = "partial";
        else status = "unpaid";
      }

      return { month, monthIndex, monthlyFee, expected, paid, due, status };
    });

    const yearExpected = months.reduce((sum, item) => sum + item.expected, 0);
    const yearPaid = months.reduce((sum, item) => sum + item.paid, 0);
    const yearDue = months.reduce((sum, item) => sum + item.due, 0);
    const totalOutstanding = previousDue + yearDue;

    const methodTotals = payments.reduce((acc, payment) => {
      const method = payment.method || "other";
      acc[method] = (acc[method] || 0) + (Number(payment.amount) || 0);
      return acc;
    }, {});

    return NextResponse.json({
      year: selectedYear,
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        batch: student.batch,
        monthlyFee,
        admissionDate: student.admissionDate,
        status: student.status,
      },
      previousDue,
      yearExpected,
      yearPaid,
      yearDue,
      totalOutstanding,
      totalPaidAllTime,
      methodTotals,
      months,
      paymentHistory: payments,
      period: {
        yearStartPeriod,
        yearEndPeriod,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load student fee details" }, { status: 500 });
  }
}
