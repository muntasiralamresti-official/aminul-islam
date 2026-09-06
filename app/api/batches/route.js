import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Batch from '@/models/Batch';

export async function GET() {
  try {
    await connectMongo();
    const batches = await Batch.find({}).sort({ createdAt: -1 });
    return NextResponse.json(batches);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();
    const batch = await Batch.create(body);
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
