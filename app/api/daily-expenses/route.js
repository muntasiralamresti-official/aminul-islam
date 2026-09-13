import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import DailyExpense from '@/models/DailyExpense';
import Payment from '@/models/Payment';

export const dynamic = 'force-dynamic';

function rangeForMonth(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = Number.parseInt(searchParams.get('year') || now.getFullYear(), 10);
    const month = Number.parseInt(searchParams.get('month') || now.getMonth() + 1, 10);
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 });
    }

    const { start, end } = rangeForMonth(year, month);
    const [entries, feeIncome] = await Promise.all([
      DailyExpense.find({ date: { $gte: start, $lt: end } })
        .select('type category amount description method date createdAt updatedAt')
        .sort({ date: -1, _id: -1 })
        .lean(),
      Payment.find({ date: { $gte: start, $lt: end }, status: 'paid' })
        .select('amount date method student month year')
        .populate('student', 'name rollNumber')
        .sort({ date: -1, _id: -1 })
        .lean(),
    ]);

    const manualIncome = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const expense = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    const feeAmount = feeIncome.reduce((sum, payment) => sum + payment.amount, 0);
    const income = manualIncome + feeAmount;

    const transactions = [
      ...entries.map((entry) => ({ ...entry, source: 'manual' })),
      ...feeIncome.map((payment) => ({
        _id: `payment-${payment._id}`,
        type: 'income',
        category: 'Student Fee',
        amount: payment.amount,
        description: payment.student ? `${payment.student.name}${payment.student.rollNumber ? ` • Roll ${payment.student.rollNumber}` : ''}` : 'Student fee payment',
        method: payment.method,
        date: payment.date,
        source: 'payment',
        paymentId: payment._id,
        month: payment.month,
        year: payment.year,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({
      entries: transactions,
      summary: { income, expense, net: income - expense, feeIncome: feeAmount, manualIncome, count: transactions.length },
    });
  } catch (error) {
    console.error('Daily expense GET error:', error);
    return NextResponse.json({ error: 'Failed to load daily finance data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();
    const entry = await DailyExpense.create({
      type: body.type,
      category: body.category,
      amount: Number(body.amount),
      description: body.description || '',
      method: body.method || 'cash',
      date: body.date ? new Date(body.date) : new Date(),
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to create entry' }, { status: 400 });
  }
}
