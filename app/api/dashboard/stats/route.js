import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Student from '@/models/Student';
import Batch from '@/models/Batch';
import Payment from '@/models/Payment';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectMongo();
    
    const totalStudents = await Student.countDocuments();
    const totalBatches = await Batch.countDocuments();
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const paymentsThisMonth = await Payment.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const collectionThisMonth = paymentsThisMonth.length > 0 ? paymentsThisMonth[0].total : 0;
    
    // Fetch settings for dynamic fee calculation
    const Setting = (await import('@/models/Setting')).default;
    let setting = await Setting.findOne();
    const defaultFee = setting?.defaultFee || 1000;

    const expectedCollection = totalStudents * defaultFee;
    const totalDue = expectedCollection > collectionThisMonth ? expectedCollection - collectionThisMonth : 0;

    // Trend data for chart
    const trendData = await Payment.aggregate([
      { $match: { year: currentYear } },
      { $group: { _id: '$month', total: { $sum: '$amount' } } }
    ]);

    // Map trend to ordered months
    const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const formattedTrend = monthsOrder.map(m => {
      const found = trendData.find(t => t._id === m);
      return { name: m.substring(0, 3), total: found ? found.total : 0 };
    });

    return NextResponse.json({
      totalStudents,
      totalBatches,
      collectionThisMonth,
      totalDue,
      currentMonth,
      trend: formattedTrend
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
