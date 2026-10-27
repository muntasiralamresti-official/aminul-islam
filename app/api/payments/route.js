import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Payment from '@/models/Payment';
import Student from '@/models/Student';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = Number.parseInt(searchParams.get('year') || '', 10);
    const query = {};

    if (month) query.month = month;
    if (Number.isFinite(year)) query.year = year;

    const payments = await Payment.find(query)
      .select('student month year amount method date status createdAt')
      .populate('student', 'name rollNumber')
      .sort({ date: -1, _id: -1 })
      .lean();

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();

    // 1. Support direct array of payments
    if (Array.isArray(body)) {
      const payments = await Payment.insertMany(body);
      return NextResponse.json(payments, { status: 201 });
    }

    // 2. Support multi-month advance payment
    if (Array.isArray(body.months) && body.months.length > 0) {
      const { months, amount, discount, ...rest } = body;
      const count = months.length;
      const totalAmount = Number(amount) || 0;
      const totalDiscount = Number(discount) || 0;
      const amountPerMonth = Math.round((totalAmount / count) * 100) / 100;
      const discountPerMonth = Math.round((totalDiscount / count) * 100) / 100;

      const docs = months.map((m, idx) => {
        const isLast = idx === count - 1;
        const mAmount = isLast ? Math.round((totalAmount - amountPerMonth * (count - 1)) * 100) / 100 : amountPerMonth;
        const mDiscount = isLast ? Math.round((totalDiscount - discountPerMonth * (count - 1)) * 100) / 100 : discountPerMonth;
        return {
          ...rest,
          month: m,
          amount: mAmount,
          discount: mDiscount,
        };
      });

      const payments = await Payment.insertMany(docs);
      return NextResponse.json(payments, { status: 201 });
    }

    // 3. Single payment
    const payment = await Payment.create(body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
