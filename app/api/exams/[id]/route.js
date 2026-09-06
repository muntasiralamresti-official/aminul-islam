import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Exam from '@/models/Exam';
import Batch from '@/models/Batch';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const exam = await Exam.findById(id).populate('batch', 'name subject');
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    // Note: We might want to delete associated results here as well in a real prod scenario.
    return NextResponse.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
