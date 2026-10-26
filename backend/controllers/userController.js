import User from "../models/User.js";

// ============================================================
// GET /api/users/me
// ============================================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId).select(
      "name email role status emailVerified createdAt studentId employeeId department", // 👈 Yahan naye fields add kiye
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// PATCH /api/users/me
// Document Section 9.3 — allowed fields only
// ============================================================
export const updateMe = async (req, res) => {
  try {
    // Sirf ye fields allowed hain — role/status/passwordHash NAHI
    const allowedFields = ["name", "employeeId", "department", "studentId"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const user = await User.findByIdAndUpdate(
      req.auth.userId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select(
      "name email role status emailVerified studentId employeeId department", // 👈 Yahan bhi sahi hai
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
