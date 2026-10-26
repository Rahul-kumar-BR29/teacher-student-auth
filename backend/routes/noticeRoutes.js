import express from "express";
import {
  createNotice,
  getNotices,
  deleteNotice,
  replyToNotice,
  getNoticeReplies,
} from "../controllers/noticeController.js";
import authenticate from "../middleware/authenticate.js";
import allowRoles from "../middleware/allowRoles.js";

const router = express.Router();

// ============================================================
// Notice Routes
// ============================================================

// 1. Sabhi Notices Dekhna
router.get("/", authenticate, getNotices);

// 2. Naya Notice Bhejna (Sirf Admin aur Teacher)
router.post("/", authenticate, allowRoles("admin", "teacher"), createNotice);

// 3. Notice Delete Karna (Sirf Admin)
router.delete("/:id", authenticate, allowRoles("admin"), deleteNotice);

// ============================================================
// Reply Routes (Teacher/Admin dono reply kar sakein)
// ============================================================

// 4. Notice par Reply Bhejna (Admin, Teacher, Student sabhi kar sakte hain)
router.post("/:id/reply", authenticate, replyToNotice);

// 5. Notice ke Replies Dekhna
router.get("/:id/replies", authenticate, getNoticeReplies);

export default router;
