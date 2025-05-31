const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const videoController = require("../controllers/videoController");

router.post(
  "/upload",
  authMiddleware,
  upload.single("video"),
  videoController.uploadVideo
);
router.get("/user/:userId", videoController.getUserVideos);
router.get("/id/:id", videoController.getVideoById);
router.delete("/:id", authMiddleware, videoController.deleteVideo);
router.post("/analyze", videoController.analyzeVideo);
router.patch(
  "/update-summary",
  authMiddleware,
  videoController.updateVideoSummary
);

module.exports = router;
