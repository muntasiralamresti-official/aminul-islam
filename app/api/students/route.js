import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Student from '@/models/Student';
import Batch from '@/models/Batch'; // Ensure Batch is loaded

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');
    
    let query = {};
    if (batchId) query.batch = batchId;

    const students = await Student.find(query)
      .populate('batch', 'name subject')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();
    
    // Check roll number uniqueness
    const existing = await Student.findOne({ rollNumber: body.rollNumber });
    if (existing) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 });
    }

    const student = await Student.create(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
