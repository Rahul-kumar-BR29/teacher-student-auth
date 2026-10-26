import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "suspended", "disabled"],
      required: true,
      default: "active",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    employeeId: { type: String },
    department: { type: String },
    studentId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
