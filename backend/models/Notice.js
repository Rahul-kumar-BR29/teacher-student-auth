import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      enum: ["student", "teacher", "all"],
      default: "all",
      required: true,
    },

    postedByRole: {
      type: String,
      enum: ["admin", "teacher"],
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notice", noticeSchema);
