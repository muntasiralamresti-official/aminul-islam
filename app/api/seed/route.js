import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await connectMongo();
    const email = "aminulislam@gmail.com";
    const password = "aminul-islam86";
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.findOneAndUpdate(
      { role: "admin" },
      {
        name: "System Admin",
        email,
        password: hashedPassword,
        role: "admin",
        status: "active",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({
      message: `Admin ready. Email: ${admin.email}, Password: ${password}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
