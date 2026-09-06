import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Batch from '@/models/Batch';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectMongo();
    const batch = await Batch.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectMongo();
    const batch = await Batch.findByIdAndDelete(id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
