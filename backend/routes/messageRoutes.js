import express from "express";

import authenticate from "../middleware/authenticate.js";
import allowRoles from "../middleware/allowRoles.js";
import {
  sendMessage,
  getTeachers,
  getInbox,
  getSent,
  replyToMail,
  getMailReplies,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/teachers", authenticate, allowRoles("student"), getTeachers);
router.post("/", authenticate, allowRoles("student"), sendMessage);
router.get("/inbox", authenticate, allowRoles("teacher"), getInbox);
router.get("/sent", authenticate, allowRoles("student"), getSent);

router.post("/:id/reply", authenticate, allowRoles("teacher"), replyToMail);
router.get("/:id/replies", authenticate, allowRoles("teacher"), getMailReplies);

export default router;
