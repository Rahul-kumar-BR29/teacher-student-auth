import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import EmailVerificationToken from "../models/EmailVerificationToken.js";
import { generateRandomToken, hashToken } from "../utils/token.js";
import { sendEmail } from "../utils/email.js";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// ============================================================
// 1. POST /api/auth/register — Student Registration
// ============================================================
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "student",
      status: "active",
      emailVerified: false,
    });

    const rawToken = generateRandomToken();
    await EmailVerificationToken.create({
      userId: user._id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyUrl = `${process.env.CLIENT_ORIGIN}/verify-email?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      text: `Click to verify: ${verifyUrl}`,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Verify your email if required.",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    console.error("registerStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// 2. POST /api/auth/teacher/register — Teacher Registration
// ============================================================
export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, employeeId, department } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Password too short" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "teacher",
      status: "pending",
      employeeId,
      department,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher registration submitted. Await admin approval.",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    console.error("registerTeacher error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// 3. POST /api/auth/login
// ============================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+passwordHash");

    if (!user) {
      console.log(`❌ LOGIN FAIL: Email database mein nahi hai -> ${email}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log(`❌ LOGIN FAIL: Password match nahi hua -> ${email}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status !== "active") {
      console.log(`❌ LOGIN FAIL: Status '${user.status}' hai -> ${email}`);
      return res
        .status(403)
        .json({ message: `Account is ${user.status}. Contact admin.` });
    }

    console.log(`✅ LOGIN SUCCESS: ${email}`);

    const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
      subject: user._id.toString(),
      issuer: "rrid-auth-service",
      audience: "rrid-web-api",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      algorithm: "HS256",
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || null,
        department: user.department || null,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 3.5 POST /api/auth/google-login (NAYA ADD KIYA GAYA)
// ============================================================
export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Invalid Google data" });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Agar naya user hai, toh register kar do (by default Student)
      const randomPassword = Math.random().toString(36).slice(-8) + "A1!";
      const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

      user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "student",
        status: "active",
        emailVerified: true,
      });
    } else {
      // Agar user pehle se hai, toh check karo active hai ya nahi
      if (user.status !== "active") {
        return res
          .status(403)
          .json({ message: `Account is ${user.status}. Contact admin.` });
      }
    }

    const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
      subject: user._id.toString(),
      issuer: "rrid-auth-service",
      audience: "rrid-web-api",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      algorithm: "HS256",
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        employeeId: user.employeeId,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Google Teacher Registration (Naya API)
export const googleTeacherRegister = async (req, res) => {
  try {
    const { name, email, employeeId, department } = req.body;

    if (!name || !email || !employeeId || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Google users ke liye random strong password
    const randomPassword = Math.random().toString(36).slice(-8) + "A1!";
    const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

    await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "teacher",
      status: "pending", // Admin approval zaroori hai
      employeeId,
      department,
      emailVerified: true, // Google ne verify kar diya hai
    });

    return res.status(201).json({
      success: true,
      message:
        "Teacher registration submitted via Google. Await admin approval.",
    });
  } catch (err) {
    console.error("Google Teacher Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ============================================================
// 4. POST /api/auth/logout
// ============================================================
export const logout = async (req, res) => {
  return res.json({ success: true, message: "Logged out successfully" });
};

// ============================================================
// 5. POST /api/auth/forgot-password
// ============================================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const GENERIC_RESPONSE = {
      success: true,
      message: "If the email exists, a reset link was sent.",
    };

    if (!email) return res.json(GENERIC_RESPONSE);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json(GENERIC_RESPONSE);

    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password reset request",
      text: `Reset your password: ${resetUrl}\nLink expires in 15 minutes.`,
    });

    return res.json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// 6. POST /api/auth/reset-password
// ============================================================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password too short" });
    }

    const tokenHash = hashToken(token);

    const record = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.passwordHash = passwordHash;
    await user.save();

    record.usedAt = new Date();
    await record.save();

    await sendEmail({
      to: user.email,
      subject: "Security Alert: Password Changed",
      text: `Hello ${user.name},\n\nYour password has been changed successfully. If this wasn't you, contact admin immediately.`,
    });

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 7. GET /api/auth/verify-email
// ============================================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const tokenHash = hashToken(token);

    const record = await EmailVerificationToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.emailVerified = true;
    await user.save();

    record.usedAt = new Date();
    await record.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
