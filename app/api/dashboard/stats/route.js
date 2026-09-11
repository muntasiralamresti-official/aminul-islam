import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Student from '@/models/Student';
import Batch from '@/models/Batch';
import Payment from '@/models/Payment';
import Attendance from '@/models/Attendance';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDhakaDayBounds() {
  const now = new Date();
  const dhakaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  return { start: new Date(`${dhakaDate}T00:00:00+06:00`), end: new Date(`${dhakaDate}T23:59:59.999+06:00`) };
}

export async function GET() {
  try {
    await connectMongo();
    const now = new Date();
    const currentMonth = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', month: 'long' }).format(now);
    const currentYear = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', year: 'numeric' }).format(now));
    const { start: todayStart, end: todayEnd } = getDhakaDayBounds();

    // Keep the dashboard fast by combining related metric queries. This reduces
    // the number of MongoDB round-trips while keeping recent-activity queries small.
    const [setting, studentMetrics, batchCount, paymentMetrics, attendanceSummary, recentPayments, recentStudents, recentAttendance] = await Promise.all([
      Setting.findOne().select('defaultFee').lean(),
      Student.aggregate([
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            activeStudents: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            feeWithValue: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'active'] }, { $ne: ['$monthlyFee', null] }] },
                  { $ifNull: ['$monthlyFee', 0] },
                  0,
                ],
              },
            },
            studentsWithValue: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'active'] }, { $ne: ['$monthlyFee', null] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Batch.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid', $or: [{ year: currentYear }, { date: { $gte: todayStart, $lte: todayEnd } }] } },
        {
          $facet: {
            today: [
              { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ],
            currentMonth: [
              { $match: { year: currentYear, month: currentMonth } },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ],
            trend: [
              { $match: { year: currentYear } },
              { $group: { _id: '$month', total: { $sum: '$amount' } } },
            ],
          },
        },
      ]),
      Attendance.aggregate([
        { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
        { $unwind: '$records' },
        {
          $group: {
            _id: null,
            marked: { $sum: 1 },
            present: { $sum: { $cond: [{ $in: ['$records.status', ['present', 'late']] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0] } },
          },
        },
      ]),
      Payment.find({ status: 'paid' }).select('student amount date createdAt').sort({ date: -1 }).limit(5).populate('student', 'name').lean(),
      Student.find().select('name batch createdAt').sort({ createdAt: -1 }).limit(5).populate('batch', 'name').lean(),
      Attendance.find().select('batch createdAt').sort({ createdAt: -1 }).limit(5).populate('batch', 'name').lean(),
    ]);

    const defaultFee = setting?.defaultFee ?? 1000;
    const metrics = studentMetrics[0] || { totalStudents: 0, activeStudents: 0, feeWithValue: 0, studentsWithValue: 0 };
    const payments = paymentMetrics[0] || { today: [], currentMonth: [], trend: [] };
    const totalStudents = metrics.totalStudents || 0;
    const activeStudents = metrics.activeStudents || 0;
    const collectionThisMonth = payments.currentMonth[0]?.total || 0;
    const todayCollection = payments.today[0]?.total || 0;
    const expectedCollection = metrics.feeWithValue + Math.max(activeStudents - metrics.studentsWithValue, 0) * defaultFee;
    const totalDue = Math.max(expectedCollection - collectionThisMonth, 0);
    const attendance = attendanceSummary[0] || { marked: 0, present: 0, absent: 0 };
    const formattedTrend = monthsOrder.map((month) => {
      const found = payments.trend.find((item) => item._id === month);
      return { name: month.substring(0, 3), total: found ? found.total : 0 };
    });

    const recentActivity = [
      ...recentPayments.map((payment) => ({ id: `payment-${payment._id}`, type: 'payment', title: `${payment.student?.name || 'Student'}'s fee paid`, detail: `৳${payment.amount?.toLocaleString() || 0}`, date: payment.date || payment.createdAt })),
      ...recentStudents.map((student) => ({ id: `student-${student._id}`, type: 'student', title: `${student.name} added to ${student.batch?.name || 'a batch'}`, detail: 'New student', date: student.createdAt })),
      ...recentAttendance.map((record) => ({ id: `attendance-${record._id}`, type: 'attendance', title: 'Attendance marked', detail: record.batch?.name || 'Batch attendance', date: record.createdAt })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    return NextResponse.json({ totalStudents, activeStudents, totalBatches: batchCount, todayCollection, collectionThisMonth, totalDue, currentMonth, todayAttendance: attendance.marked, presentToday: attendance.present, absentToday: attendance.absent, monthlyFinancial: { expected: expectedCollection, collected: collectionThisMonth, due: totalDue }, trend: formattedTrend, recentActivity });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
