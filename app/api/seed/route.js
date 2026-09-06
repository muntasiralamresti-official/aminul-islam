import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectMongo();
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@coaching.com' });
    if (adminExists) {
      return NextResponse.json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'System Admin',
      email: 'admin@coaching.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    });

    return NextResponse.json({ message: 'Admin created successfully. Email: admin@coaching.com, Password: admin123' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
