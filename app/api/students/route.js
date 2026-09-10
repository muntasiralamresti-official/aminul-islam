import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Student from '@/models/Student';
import Batch from '@/models/Batch';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');
    const rawSearch = searchParams.get('search')?.trim() || '';
    const search = rawSearch ? escapeRegex(rawSearch) : '';
    const hasPagination = searchParams.has('page') || searchParams.has('limit') || Boolean(search);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10) || 10));
    const all = searchParams.get('all') === 'true';

    const query = {};
    if (batchId) query.batch = batchId;

    if (search) {
      const batchMatches = await Batch.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
        ],
      }).select('_id').lean();

      const searchOr = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { guardianPhone: { $regex: search, $options: 'i' } },
      ];

      if (batchMatches.length) {
        searchOr.push({ batch: { $in: batchMatches.map((batch) => batch._id) } });
      }
      query.$or = searchOr;
    }

    if (!hasPagination || all) {
      const students = await Student.find(query)
        .populate('batch', 'name subject')
        .sort({ _id: -1 });
      return NextResponse.json(students);
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('batch', 'name subject')
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Student.countDocuments(query),
    ]);

    return NextResponse.json({
      students,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectMongo();

    const existing = await Student.findOne({ rollNumber: body.rollNumber });
    if (existing) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 });
    }

    const student = await Student.create(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
