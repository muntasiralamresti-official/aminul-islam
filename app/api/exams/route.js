import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Exam from '@/models/Exam';
import Batch from '@/models/Batch'; // Ensure Batch is loaded

export async function GET(request) {
  try {
    await connectMongo();
    const exams = await Exam.find({})
      .populate('batch', 'name subject')
      .sort({ date: -1 });
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();
    const exam = await Exam.create(body);
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
