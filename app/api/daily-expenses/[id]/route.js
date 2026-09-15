import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import DailyExpense from '@/models/DailyExpense';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    await connectMongo();
    const body = await request.json();
    const entry = await DailyExpense.findByIdAndUpdate(
      params.id,
      {
        type: body.type,
        category: body.category,
        amount: Number(body.amount),
        description: body.description || '',
        method: body.method || 'cash',
        date: body.date ? new Date(body.date) : new Date(),
      },
      { new: true, runValidators: true }
    );
    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update entry' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectMongo();
    const entry = await DailyExpense.findByIdAndDelete(params.id);
    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
