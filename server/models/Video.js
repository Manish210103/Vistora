const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoPath: { type: String, required: true },
  originalName: { type: String },
  summaryPoints: { type: [String], default: [] },
  keywords: { type: [String], default: [] },
  segments: {
    type: [
      {
        title: String,
        start: Number,
        end: Number,
        text: String,
        sentiment: Number,
        cluster: Number,
        x: Number,
        y: Number,
      },
    ],
    default: [],
  },
  isAnalyzed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  audioDuration: { type: Number, default: 0 },
  transcriptWordCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Video", videoSchema);
