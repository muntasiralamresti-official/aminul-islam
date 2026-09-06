import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');
    const month = parseInt(searchParams.get('month')); // 1-12
    const year = parseInt(searchParams.get('year'));

    if (!batchId || !month || !year) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await connectMongo();

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Find all attendance records for this batch in the given date range
    const attendances = await Attendance.find({
      batch: batchId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('records.student', 'name rollNumber photo');

    // Aggregate data per student
    const summaryMap = {}; // studentId -> { student, present, absent, late, totalDays }

    attendances.forEach(attendanceDoc => {
      attendanceDoc.records.forEach(record => {
        const studentId = record.student._id.toString();
        
        if (!summaryMap[studentId]) {
          summaryMap[studentId] = {
            student: record.student,
            present: 0,
            absent: 0,
            late: 0,
            totalDays: 0
          };
        }
        
        summaryMap[studentId][record.status]++;
        summaryMap[studentId].totalDays++;
      });
    });

    const summaryArray = Object.values(summaryMap);
    // Sort by roll number or name
    summaryArray.sort((a, b) => (a.student.rollNumber || '').localeCompare(b.student.rollNumber || ''));

    return NextResponse.json({ summary: summaryArray, totalClasses: attendances.length });
  } catch (error) {
    console.error('Summary API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
