import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import Batch from '@/models/Batch';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');
    const dateParam = searchParams.get('date');

    if (!batchId || !dateParam) {
      return NextResponse.json({ error: 'Batch and Date are required' }, { status: 400 });
    }

    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ batch: batchId, date })
      .populate('records.student', 'name rollNumber');

    if (!attendance) {
      // Include legacy students where status is missing, while excluding explicitly inactive students.
      const students = await Student.find({
        batch: batchId,
        status: { $ne: 'inactive' },
      })
        .select('name rollNumber')
        .sort({ _id: 1 })
        .lean();

      return NextResponse.json({
        batch: batchId,
        date,
        isNew: true,
        records: students.map((student) => ({
          student,
          status: 'present',
        })),
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();

    const { batch, date: dateParam, records } = body;
    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { batch, date },
      { batch, date, records },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
