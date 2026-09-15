import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/Note';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { content: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      ];
    }

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 }).lean();
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const title = body.title?.trim();
    const content = body.content?.trim();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await connectMongo();
    const note = await Note.create({
      title,
      content,
      category: body.category || 'General',
      pinned: Boolean(body.pinned),
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
