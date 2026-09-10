import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Payment from '@/models/Payment';
import Student from '@/models/Student';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function periodIndex(year, month) {
  return year * 12 + month;
}

export async function GET(request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const year = Number.parseInt(searchParams.get('year'), 10) || new Date().getFullYear();
    const requestedMonth = searchParams.get('month') || MONTHS[new Date().getMonth()];
    const month = MONTHS.includes(requestedMonth) ? requestedMonth : MONTHS[new Date().getMonth()];
    const selectedMonthIndex = MONTHS.indexOf(month);
    const selectedPeriod = periodIndex(year, selectedMonthIndex);

    const [students, setting] = await Promise.all([
      Student.find({ status: 'active' })
        .select('name rollNumber monthlyFee batch admissionDate status')
        .populate('batch', 'name')
        .sort({ _id: 1 })
        .lean(),
      Setting.findOne().select('defaultFee').lean(),
    ]);

    const studentIds = students.map((student) => student._id);
    const payments = studentIds.length
      ? await Payment.find({
          status: 'paid',
          student: { $in: studentIds },
          year: { $lte: year },
        })
          .select('student month year amount')
          .lean()
      : [];

    const defaultFee = setting?.defaultFee ?? 1000;
    const paymentTotals = new Map();

    for (const payment of payments) {
      const studentId = String(payment.student);
      const monthIndex = MONTHS.indexOf(payment.month);
      if (monthIndex < 0 || !Number.isFinite(payment.year)) continue;

      const paymentPeriod = periodIndex(payment.year, monthIndex);
      if (paymentPeriod > selectedPeriod) continue;

      const entry = paymentTotals.get(studentId) || { previousPaid: 0, currentPaid: 0 };
      if (paymentPeriod === selectedPeriod) {
        entry.currentPaid += Number(payment.amount) || 0;
      } else {
        entry.previousPaid += Number(payment.amount) || 0;
      }
      paymentTotals.set(studentId, entry);
    }

    const rows = students.map((student) => {
      const studentId = String(student._id);
      const monthlyFee = Number(student.monthlyFee ?? defaultFee) || 0;
      const admissionDate = student.admissionDate ? new Date(student.admissionDate) : null;
      const admissionYear = admissionDate?.getFullYear();
      const admissionMonth = admissionDate?.getMonth();
      const admissionPeriod = Number.isFinite(admissionYear) && Number.isFinite(admissionMonth)
        ? periodIndex(admissionYear, admissionMonth)
        : selectedPeriod;
      const isAdmittedBySelectedMonth = admissionPeriod <= selectedPeriod;

      const currentExpected = isAdmittedBySelectedMonth ? monthlyFee : 0;
      const previousExpected = isAdmittedBySelectedMonth && admissionPeriod < selectedPeriod
        ? monthlyFee * (selectedPeriod - admissionPeriod)
        : 0;

      const paid = paymentTotals.get(studentId) || { previousPaid: 0, currentPaid: 0 };
      const previousDue = Math.max(previousExpected - paid.previousPaid, 0);
      const currentDue = Math.max(currentExpected - paid.currentPaid, 0);
      const totalDue = previousDue + currentDue;

      let paymentStatus = 'unpaid';
      if (currentExpected > 0 && paid.currentPaid >= currentExpected) {
        paymentStatus = 'paid';
      } else if (paid.currentPaid > 0) {
        paymentStatus = 'partial';
      }

      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        batch: student.batch,
        monthlyFee,
        expected: currentExpected,
        paid: paid.currentPaid,
        currentDue,
        previousDue,
        totalDue,
        paymentStatus,
      };
    });

    const summary = rows.reduce(
      (acc, row) => {
        acc.totalExpected += row.expected;
        acc.totalCollected += row.paid;
        acc.currentDue += row.currentDue;
        acc.previousDue += row.previousDue;
        if (row.paymentStatus === 'paid') acc.paidStudents += 1;
        if (row.paymentStatus === 'unpaid') acc.unpaidStudents += 1;
        if (row.paymentStatus === 'partial') acc.partialPayments += 1;
        return acc;
      },
      {
        totalExpected: 0,
        totalCollected: 0,
        currentDue: 0,
        previousDue: 0,
        paidStudents: 0,
        unpaidStudents: 0,
        partialPayments: 0,
      },
    );

    return NextResponse.json({
      month,
      year,
      ...summary,
      totalDue: summary.previousDue + summary.currentDue,
      students: rows,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to load fee summary' }, { status: 500 });
  }
}
