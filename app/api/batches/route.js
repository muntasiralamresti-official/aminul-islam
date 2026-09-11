import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Batch from '@/models/Batch';

export async function GET() {
  try {
    await connectMongo();
    // _id is indexed by MongoDB and keeps this list query from requiring
    // an in-memory sort on createdAt as the collection grows.
    const batches = await Batch.find({}).sort({ _id: -1 });
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
