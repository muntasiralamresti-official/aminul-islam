import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Result from '@/models/Result';
import Student from '@/models/Student';
import Exam from '@/models/Exam';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('exam');

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    // Get the exam and its batch to find all students in that batch
    const exam = await Exam.findById(examId);
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    const students = await Student.find({ batch: exam.batch, status: 'active' });
    const existingResults = await Result.find({ exam: examId }).populate('student', 'name rollNumber');

    // Merge existing results with students who don't have results yet
    const combinedData = students.map(student => {
      const existing = existingResults.find(r => r.student._id.toString() === student._id.toString());
      if (existing) {
        return existing;
      }
      return {
        isNew: true,
        student: { _id: student._id, name: student.name, rollNumber: student.rollNumber },
        marksObtained: '',
        remarks: ''
      };
    });

    return NextResponse.json(combinedData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();
    
    const { exam, results } = body;
    
    // Process results (upsert)
    const operations = results.map(r => ({
      updateOne: {
        filter: { exam: exam, student: r.student },
        update: { $set: { marksObtained: r.marksObtained, remarks: r.remarks || '' } },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Result.bulkWrite(operations);
    }

    return NextResponse.json({ message: 'Results saved successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
