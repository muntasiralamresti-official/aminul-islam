import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const email = (process.env.ADMIN_EMAIL || "aminulislam@gmail.com")
  .trim()
  .toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error("ADMIN_PASSWORD is required");

const connection = await mongoose.connect(uri);
const users = connection.connection.collection("users");
const passwordHash = await bcrypt.hash(password, 10);

await users.updateOne(
  { email },
  {
    $set: {
      name: "System Admin",
      email,
      password: passwordHash,
      status: "active",
      updatedAt: new Date(),
    },
    $setOnInsert: { createdAt: new Date() },
  },
  { upsert: true },
);

console.log(`Account ready: ${email}`);
await mongoose.disconnect();
