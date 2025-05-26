const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadVideo,
  getSummary,
  getVideoStatus,
} = require("../controllers/videoController");


// Upload a new video (protected route)
router.post("/upload", authMiddleware, uploadVideo);

// Get generated summary clips and text for a video (protected)
router.get("/summary/:videoId", authMiddleware, getSummary);

// Check processing status of uploaded video (protected)
router.get("/status/:videoId", authMiddleware, getVideoStatus);
router.post("/upload", authMiddleware, uploadVideo);


module.exports = router;
