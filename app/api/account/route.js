import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ email: session.user.email || "" });
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, email, newPassword } = await request.json();
    if (!currentPassword || !email) {
      return NextResponse.json(
        { error: "Email and current password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email" },
        { status: 400 },
      );
    }
    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }

    await connectMongo();
    const user = await User.findById(session.user.id).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const emailInUse = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });
    if (emailInUse) {
      return NextResponse.json(
        { error: "That email is already in use" },
        { status: 400 },
      );
    }

    user.email = normalizedEmail;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ email: user.email });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
