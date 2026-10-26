import User from "../models/User.js";

// ============================================================
// GET /api/admin/teachers/pending
// Document Section 4.4
// ============================================================
export const listPendingTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "teacher",
      status: "pending",
    }).select("name email employeeId department createdAt");
    return res.json({ success: true, teachers });
  } catch (err) {
    console.error("listPendingTeachers error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// PATCH /api/admin/teachers/:id/approval
// Document Section 4.4
// ============================================================
export const updateTeacherApproval = async (req, res) => {
  try {
    const { decision } = req.body; // "approve" ya "reject"
    const teacherId = req.params.id;

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }
    if (teacher.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    teacher.status = decision === "approve" ? "active" : "rejected";
    teacher.approvedBy = req.auth.userId;
    teacher.approvedAt = new Date();
    await teacher.save();

    return res.json({
      success: true,
      message: `Teacher ${decision}d successfully`,
    });
  } catch (err) {
    console.error("updateTeacherApproval error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/stats
// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({
      role: "teacher",
      status: "active",
    });
    const pendingTeachers = await User.countDocuments({
      role: "teacher",
      status: "pending",
    });

    // 👇 Naya Count: Rejected Teachers
    const rejectedTeachers = await User.countDocuments({
      role: "teacher",
      status: "rejected",
    });

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        pendingTeachers,
        rejectedTeachers,
      }, // 👈 Add kiya
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/users?role=student&status=active
export const getUsersList = async (req, res) => {
  try {
    const { role, status } = req.query;

    // Query build karein
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select("name email role status employeeId department createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, users });
  } catch (err) {
    console.error("getUsersList error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting the main admin (optional safety)
    if (user.email === "admin@rridtech.com") {
      return res
        .status(403)
        .json({ message: "Cannot delete the super admin account" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
