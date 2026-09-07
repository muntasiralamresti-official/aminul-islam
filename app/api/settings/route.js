import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Setting from '@/models/Setting';

export async function GET() {
  try {
    await connectMongo();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    } else if (setting.centerName === 'Coaching Pro') {
      setting = await Setting.findByIdAndUpdate(
        setting._id,
        { centerName: 'Aminul Islam' },
        { new: true },
      );
    }
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    await connectMongo();
    let setting = await Setting.findOne();
    
    if (!setting) {
      setting = await Setting.create(body);
    } else {
      setting = await Setting.findByIdAndUpdate(setting._id, body, { new: true });
    }
    
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
