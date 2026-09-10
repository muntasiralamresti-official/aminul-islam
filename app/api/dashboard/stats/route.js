import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Student from '@/models/Student';
import Batch from '@/models/Batch';
import Payment from '@/models/Payment';
import Attendance from '@/models/Attendance';
import Exam from '@/models/Exam';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

const monthsOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDhakaDayBounds() {
  const now = new Date();
  const dhakaDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const start = new Date(`${dhakaDate}T00:00:00+06:00`);
  const end = new Date(`${dhakaDate}T23:59:59.999+06:00`);
  return { start, end };
}

export async function GET() {
  try {
    await connectMongo();

    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      month: 'long',
    }).format(now);
    const currentYear = Number(new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
    }).format(now));
    const { start: todayStart, end: todayEnd } = getDhakaDayBounds();

    const setting = await Setting.findOne().lean();
    const defaultFee = setting?.defaultFee ?? 1000;

    const [
      totalStudents,
      activeStudents,
      todayCollectionResult,
      monthlyCollectionResult,
      feeSummary,
      attendanceSummary,
      trendData,
      recentPayments,
      recentStudents,
      recentExams,
      recentAttendance,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Payment.aggregate([
        { $match: { date: { $gte: todayStart, $lte: todayEnd }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { month: currentMonth, year: currentYear, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Student.aggregate([
        { $match: { status: 'active' } },
        { $group: {
          _id: null,
          feeWithValue: { $sum: { $ifNull: ['$monthlyFee', 0] } },
          studentsWithValue: { $sum: { $cond: [{ $ne: ['$monthlyFee', null] }, 1, 0] } },
        } },
      ]),
      Attendance.aggregate([
        { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
        { $unwind: '$records' },
        { $group: {
          _id: null,
          marked: { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ['$records.status', ['present', 'late']] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0] } },
        } },
      ]),
      Payment.aggregate([
        { $match: { year: currentYear, status: 'paid' } },
        { $group: { _id: '$month', total: { $sum: '$amount' } } },
      ]),
      Payment.find({ status: 'paid' })
        .sort({ date: -1 })
        .limit(5)
        .populate('student', 'name')
        .lean(),
      Student.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('batch', 'name')
        .lean(),
      Exam.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('batch', 'name')
        .lean(),
      Attendance.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('batch', 'name')
        .lean(),
    ]);

    const collectionThisMonth = monthlyCollectionResult[0]?.total || 0;
    const todayCollection = todayCollectionResult[0]?.total || 0;
    const summary = feeSummary[0];
    const expectedCollection = summary
      ? summary.feeWithValue + Math.max(activeStudents - summary.studentsWithValue, 0) * defaultFee
      : activeStudents * defaultFee;
    const totalDue = Math.max(expectedCollection - collectionThisMonth, 0);

    const attendance = attendanceSummary[0] || { marked: 0, present: 0, absent: 0 };

    const formattedTrend = monthsOrder.map((month) => {
      const found = trendData.find((item) => item._id === month);
      return { name: month.substring(0, 3), total: found ? found.total : 0 };
    });

    const recentActivity = [
      ...recentPayments.map((payment) => ({
        id: `payment-${payment._id}`,
        type: 'payment',
        title: `${payment.student?.name || 'Student'}'s fee paid`,
        detail: `৳${payment.amount?.toLocaleString() || 0}`,
        date: payment.date || payment.createdAt,
      })),
      ...recentStudents.map((student) => ({
        id: `student-${student._id}`,
        type: 'student',
        title: `${student.name} added to ${student.batch?.name || 'a batch'}`,
        detail: 'New student',
        date: student.createdAt,
      })),
      ...recentExams.map((exam) => ({
        id: `exam-${exam._id}`,
        type: 'exam',
        title: 'New exam created',
        detail: `${exam.title}${exam.batch?.name ? ` · ${exam.batch.name}` : ''}`,
        date: exam.createdAt,
      })),
      ...recentAttendance.map((record) => ({
        id: `attendance-${record._id}`,
        type: 'attendance',
        title: 'Attendance marked',
        detail: record.batch?.name || 'Batch attendance',
        date: record.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    return NextResponse.json({
      totalStudents,
      activeStudents,
      totalBatches: await Batch.countDocuments(),
      todayCollection,
      collectionThisMonth,
      totalDue,
      currentMonth,
      todayAttendance: attendance.marked,
      presentToday: attendance.present,
      absentToday: attendance.absent,
      monthlyFinancial: {
        expected: expectedCollection,
        collected: collectionThisMonth,
        due: totalDue,
      },
      trend: formattedTrend,
      recentActivity,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
