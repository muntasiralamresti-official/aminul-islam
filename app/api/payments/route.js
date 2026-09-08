import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Payment from '@/models/Payment';
import Student from '@/models/Student'; // Ensure Student model is loaded

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectMongo();
    const payments = await Payment.find({})
      .populate('student', 'name rollNumber')
      .sort({ createdAt: -1 });
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
