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
    const payment = await Payment.create(body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
