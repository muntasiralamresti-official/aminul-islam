import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Student from "@/models/Student";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BATCH_SIZE = 3;

export async function GET(request) {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "ImageKit is not configured. Add IMAGEKIT_PRIVATE_KEY in Vercel Environment Variables." },
        { status: 500 },
      );
    }

    await connectMongo();

    // Process only a few images per request so Vercel does not time out.
    // The old `photo` field is removed only after ImageKit upload + DB update succeed.
    const students = await Student.find({
      photo: { $type: "string", $ne: "" },
      $or: [{ photoUrl: "" }, { photoUrl: { $exists: false } }],
    })
      .select("_id name roll photo photoUrl")
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .lean();

    if (students.length === 0) {
      return NextResponse.json({
        message: "No students need image migration.",
        processed: 0,
        successCount: 0,
        failCount: 0,
        remainingCount: 0,
        done: true,
      });
    }

    let successCount = 0;
    let failCount = 0;
    const failures = [];

    const authHeader = "Basic " + Buffer.from(`${privateKey}:`).toString("base64");

    for (const student of students) {
      try {
        const formData = new FormData();
        formData.append("file", student.photo);
        formData.append("fileName", `student-${student._id}-${crypto.randomUUID()}.jpg`);
        formData.append("folder", "/students");
        formData.append("useUniqueFileName", "true");

        const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          headers: { Authorization: authHeader },
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.url) {
          console.error(`ImageKit migration failed for ${student._id}:`, uploadData);
          failCount++;
          failures.push(student._id.toString());
          continue;
        }

        // Only clear the legacy base64 photo after the ImageKit URL is saved.
        await Student.updateOne(
          { _id: student._id, photo: student.photo },
          { $set: { photoUrl: uploadData.url }, $unset: { photo: 1 } },
        );
        successCount++;
      } catch (error) {
        console.error(`Migration error for ${student._id}:`, error);
        failCount++;
        failures.push(student._id.toString());
      }
    }

    const remainingCount = await Student.countDocuments({
      photo: { $type: "string", $ne: "" },
      $or: [{ photoUrl: "" }, { photoUrl: { $exists: false } }],
    });

    return NextResponse.json({
      message: remainingCount > 0 ? "Migration batch complete" : "Migration complete",
      processed: students.length,
      successCount,
      failCount,
      failures,
      remainingCount,
      done: remainingCount === 0,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Image migration failed. Please try again." },
      { status: 500 },
    );
  }
}
