import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/db';
import Note from '@/models/Note';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid note id' }, { status: 400 });
    }
    const body = await request.json();
    const title = body.title?.trim();
    const content = body.content?.trim();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await connectMongo();
    const note = await Note.findByIdAndUpdate(
      id,
      { title, content, category: body.category || 'General', pinned: Boolean(body.pinned) },
      { new: true, runValidators: true }
    );
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid note id' }, { status: 400 });
    }
    await connectMongo();
    const note = await Note.findByIdAndDelete(id);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
