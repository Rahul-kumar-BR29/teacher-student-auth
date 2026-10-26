import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const seedAdmin = async () => {
  await connectDB();

  const email = "admin@rridtech.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("⚠️ Admin already exists");
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("Admin@12345", BCRYPT_ROUNDS);

  await User.create({
    name: "Super Admin",
    email,
    passwordHash,
    role: "admin",
    status: "active",
    emailVerified: true,
  });

  console.log("✅ Admin created!");
  console.log("   Email: admin@rridtech.com");
  console.log("   Password: Admin@12345");

  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
