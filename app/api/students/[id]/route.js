import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Student from '@/models/Student';
import Batch from '@/models/Batch';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const student = await Student.findById(id).populate('batch');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectMongo();
    const student = await Student.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
