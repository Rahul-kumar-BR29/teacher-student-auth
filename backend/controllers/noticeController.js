import Notice from "../models/Notice.js";
import NoticeReply from "../models/NoticeReply.js";

// ============================================================
// POST /api/notices
// ============================================================
export const createNotice = async (req, res) => {
  try {
    const { title, content } = req.body;
    let { audience } = req.body; // 👈 let kiya taaki change kar sakein

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    // 👇 Agar Teacher hai, toh audience ko force "student" kar do
    if (req.auth.role === "teacher") {
      audience = "student";
    } else {
      audience = audience || "all"; // Admin ke liye default "all"
    }

    const notice = await Notice.create({
      title,
      content,
      audience,
      postedByRole: req.auth.role,
      postedBy: req.auth.userId,
    });

    return res.status(201).json({ success: true, notice });
  } catch (err) {
    console.error("createNotice error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// GET /api/notices
// ============================================================
export const getNotices = async (req, res) => {
  try {
    let query = {};

    // Student aur Teacher ko role ke hisaab se notices dikhao
    if (req.auth.role === "student") {
      query = { $or: [{ audience: "student" }, { audience: "all" }] };
    } else if (req.auth.role === "teacher") {
      query = { $or: [{ audience: "teacher" }, { audience: "all" }] };
    }
    // Admin ko sab dikhao (query khali)

    const notices = await Notice.find(query)
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(15);

    return res.json({ success: true, notices });
  } catch (err) {
    console.error("getNotices error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// DELETE /api/notices/:id
// ============================================================
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Teacher sirf apne bheje hue notice delete kar sakta hai
    if (
      req.auth.role === "teacher" &&
      notice.postedBy.toString() !== req.auth.userId
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own notices." });
    }

    await Notice.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Notice deleted" });
  } catch (err) {
    console.error("deleteNotice error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// POST /api/notices/:id/reply
// ============================================================
export const replyToNotice = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const reply = await NoticeReply.create({
      noticeId: req.params.id,
      repliedBy: req.auth.userId,
      message,
    });

    return res.status(201).json({ success: true, reply });
  } catch (err) {
    console.error("replyToNotice error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// GET /api/notices/:id/replies
// ============================================================
// ============================================================
// GET /api/notices/:id/replies
// ============================================================
// ============================================================
// GET /api/notices/:id/replies
// ============================================================
export const getNoticeReplies = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // 👇 Humne yahan se strict check hata diya hai
    // Ab koi bhi logged-in user (Student/Teacher/Admin) replies dekh sakta hai
    let query = { noticeId: req.params.id };

    // Agar student hai, toh sirf apne replies dekhe (Privacy ke liye)
    if (req.auth.role === "student") {
      query.repliedBy = req.auth.userId;
    }

    // Teacher aur Admin sabke replies dekh sakte hain

    const replies = await NoticeReply.find(query)
      .populate("repliedBy", "name role")
      .sort({ createdAt: 1 });

    return res.json({ success: true, replies });
  } catch (err) {
    console.error("getNoticeReplies error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
