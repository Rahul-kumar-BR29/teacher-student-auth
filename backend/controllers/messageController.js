import Message from "../models/Message.js";
import User from "../models/User.js";
import MailReply from "../models/MailReply.js";

// POST /api/messages (Student sends to Teacher)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, content } = req.body;

    if (!receiverId || !subject || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher selected" });
    }

    const message = await Message.create({
      sender: req.auth.userId,
      receiver: receiverId,
      subject,
      content,
    });

    return res
      .status(201)
      .json({ success: true, message: "Mail sent successfully" });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/messages/teachers (List all teachers for dropdown)
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "teacher",
      status: "active",
    }).select("name department");
    return res.json({ success: true, teachers });
  } catch (err) {
    console.error("getTeachers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/messages/inbox
export const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.auth.userId })
      .populate("sender", "name email role")
      .sort({ createdAt: -1 });
    return res.json({ success: true, messages });
  } catch (err) {
    console.error("getInbox error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/messages/sent
export const getSent = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.auth.userId })
      .populate("receiver", "name role")
      .sort({ createdAt: -1 });
    return res.json({ success: true, messages });
  } catch (err) {
    console.error("getSent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Reply bhejne ke liye
export const replyToMail = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ message: "Message is required" });

    const reply = await MailReply.create({
      mailId: req.params.id,
      repliedBy: req.auth.userId,
      message,
    });

    return res.status(201).json({ success: true, reply });
  } catch (err) {
    console.error("replyToMail error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Replies fetch karne ke liye
export const getMailReplies = async (req, res) => {
  try {
    const replies = await MailReply.find({ mailId: req.params.id })
      .populate("repliedBy", "name role")
      .sort({ createdAt: 1 });
    return res.json({ success: true, replies });
  } catch (err) {
    console.error("getMailReplies error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
