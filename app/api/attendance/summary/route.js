import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';

export const dynamic = 'force-dynamic';

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');
    const month = Number.parseInt(searchParams.get('month'), 10);
    const year = Number.parseInt(searchParams.get('year'), 10);

    if (!batchId || !month || !year || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    await connectMongo();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [students, attendances] = await Promise.all([
      Student.find({ batch: batchId, status: 'active' })
        .select('name rollNumber photo')
        .sort({ rollNumber: 1, _id: 1 })
        .lean(),
      Attendance.find({
        batch: batchId,
        date: { $gte: startDate, $lte: endDate },
      })
        .select('date records')
        .sort({ date: 1 })
        .lean(),
    ]);

    const classDates = attendances.map((item) => ({
      date: dateKey(item.date),
      day: new Date(item.date).getDate(),
    }));

    const recordByStudent = new Map();
    for (const attendance of attendances) {
      const key = dateKey(attendance.date);
      for (const record of attendance.records || []) {
        const studentId = String(record.student);
        if (!recordByStudent.has(studentId)) recordByStudent.set(studentId, {});
        recordByStudent.get(studentId)[key] = record.status;
      }
    }

    const summary = students.map((student) => {
      const studentId = String(student._id);
      const calendar = recordByStudent.get(studentId) || {};
      let present = 0;
      let absent = 0;
      let late = 0;
      let totalDays = 0;
      let maxAbsentStreak = 0;
      let currentAbsentStreak = 0;
      let runningAbsentStreak = 0;

      for (const classDate of classDates) {
        const status = calendar[classDate.date];
        if (!status) {
          runningAbsentStreak = 0;
          continue;
        }

        totalDays += 1;
        if (status === 'present') present += 1;
        if (status === 'late') late += 1;
        if (status === 'absent') {
          absent += 1;
          runningAbsentStreak += 1;
          maxAbsentStreak = Math.max(maxAbsentStreak, runningAbsentStreak);
        } else {
          runningAbsentStreak = 0;
        }
      }

      for (let index = classDates.length - 1; index >= 0; index -= 1) {
        const status = calendar[classDates[index].date];
        if (!status) continue;
        if (status === 'absent') currentAbsentStreak += 1;
        else break;
      }

      const attended = present + late;
      const attendancePercentage = totalDays > 0
        ? Math.round((attended / totalDays) * 1000) / 10
        : 0;

      return {
        student,
        present,
        absent,
        late,
        totalDays,
        attended,
        attendancePercentage,
        currentAbsentStreak,
        maxAbsentStreak,
        needsAttention: currentAbsentStreak >= 3 || maxAbsentStreak >= 3,
        calendar,
      };
    });

    const totalMarked = summary.reduce((sum, row) => sum + row.totalDays, 0);
    const totalAttended = summary.reduce((sum, row) => sum + row.attended, 0);
    const averageAttendance = totalMarked > 0
      ? Math.round((totalAttended / totalMarked) * 1000) / 10
      : 0;

    return NextResponse.json({
      summary,
      totalClasses: attendances.length,
      classDates,
      averageAttendance,
      studentsNeedingAttention: summary.filter((row) => row.needsAttention).length,
    });
  } catch (error) {
    console.error('Summary API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
