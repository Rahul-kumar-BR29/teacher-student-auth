import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";

import {
  registerStudent,
  registerTeacher,
  login,
  googleLogin,
  googleTeacherRegister,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: "Too many requests, try later" },
});

// ============================================================
// Standard Auth Routes
// ============================================================
router.post("/register", authLimiter, registerStudent);
router.post("/teacher/register", authLimiter, registerTeacher);
router.post("/login", authLimiter, login);
router.post("/logout", authenticate, logout);

// Password Reset & Verification
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/verify-email", verifyEmail);

// ============================================================
// 👇 Backend OAuth Google Routes 👇
// ============================================================

router.get("/google", (req, res, next) => {
  const role = req.query.role || "student";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: JSON.stringify({ role: role }),
  })(req, res, next);
});

// 1. User ko Google ke login page par bhejna (Role ke saath)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3001/login?error=GoogleAuthFailed",
  }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        throw new Error("User not found after Google Auth");
      }

      // 👇 Naya Check: Agar Teacher hai aur status 'active' nahi hai, toh login mat karwao
      if (user.role === "teacher" && user.status !== "active") {
        return res.redirect(
          `http://localhost:3001/login?error=${encodeURIComponent(
            `Your teacher account is ${user.status}. Please wait for admin approval.`,
          )}`,
        );
      }

      // Apna JWT token generate karein
      const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
        subject: user._id.toString(),
        issuer: "rrid-auth-service",
        audience: "rrid-web-api",
        expiresIn: "15m",
        algorithm: "HS256",
      });

      // Frontend par token, name, role aur status bhejein
      res.redirect(
        `http://localhost:3001/login?token=${token}&name=${encodeURIComponent(user.name)}&role=${user.role}&employeeId=${user.employeeId || ""}&department=${user.department || ""}`,
      );
    } catch (err) {
      console.error("❌ GOOGLE CALLBACK ERROR:", err.message);
      res.redirect("http://localhost:3001/login?error=Google login failed");
    }
  },
);

export default router;
