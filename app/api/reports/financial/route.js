import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Payment from '@/models/Payment';
import Student from '@/models/Student';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

    const students = await Student.find({ status: 'active' }).select('monthlyFee');
    const setting = await Setting.findOne();
    const defaultFee = setting?.defaultFee ?? 1000;

    // Every active student's own monthly fee contributes to the expected amount.
    // The default fee is only a fallback for older students without a fee value.
    const totalExpectedPerMonth = students.reduce(
      (total, student) => total + (student.monthlyFee ?? defaultFee),
      0
    );

    const paymentsByMonth = await Payment.aggregate([
      { $match: { year: year } },
      { $group: { _id: '$month', collected: { $sum: '$amount' } } }
    ]);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    let yearlyCollected = 0;
    const currentMonthIndex = new Date().getMonth();
    const isCurrentYear = year === new Date().getFullYear();

    const monthlyData = months.map((month, index) => {
      const found = paymentsByMonth.find(p => p._id === month);
      const collected = found ? found.collected : 0;

      yearlyCollected += collected;

      let expected = 0;
      if (!isCurrentYear || index <= currentMonthIndex) {
        expected = totalExpectedPerMonth;
      }

      const due = Math.max(expected - collected, 0);

      return {
        month: month.substring(0, 3),
        fullMonth: month,
        collected,
        due,
        expected
      };
    });

    let yearlyExpected = 0;
    if (isCurrentYear) {
      yearlyExpected = totalExpectedPerMonth * (currentMonthIndex + 1);
    } else if (year < new Date().getFullYear()) {
      yearlyExpected = totalExpectedPerMonth * 12;
    }

    const yearlyDue = Math.max(yearlyExpected - yearlyCollected, 0);

    return NextResponse.json({
      year,
      yearlyCollected,
      yearlyDue,
      yearlyExpected,
      monthlyData
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
