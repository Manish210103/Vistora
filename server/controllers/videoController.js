const Video = require("../models/Video");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

exports.uploadVideo = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const video = new Video({
      userId: req.userId,
      videoPath: file.path,
      originalName: file.originalname,
    });

    await video.save();
    res.status(201).json({ message: "Upload successful", video });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.analyzeVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const videoPath = path.resolve(video.videoPath);
    const pythonScriptPath = path.resolve(
      __dirname,
      "../../ml-pipeline/main.py"
    );
    const pythonCwd = path.dirname(pythonScriptPath);
    const pythonExecutable = "C:\\Program Files\\Python311\\python.exe"; 


    let responded = false; 

    const pythonProcess = spawn(
      pythonExecutable,
      [pythonScriptPath, videoPath],
      {
        cwd: pythonCwd,
        env: {
          ...process.env,
          PYTHONPATH: pythonCwd, 
        },
      }
    );

    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python process:", err);
      if (!responded) {
        responded = true;
        return res
          .status(500)
          .json({ message: "Python execution failed", error: err.message });
      }
    });

    let output = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python stderr:", data.toString());
    });

    pythonProcess.on("close", async (code) => {
      if (responded) return;
      responded = true;

      if (code !== 0) {
        return res.status(500).json({ message: "Analysis failed" });
      }

      try {
        const result = JSON.parse(output);
      
        await Video.findByIdAndUpdate(videoId, {
          $set: {
            summaryPoints: result.summary_points || [],
            keywords: result.keywords || [],
            segments: result.segments || [],
            isAnalyzed: true,
            audioDuration: result.audio_duration || 0,
            transcriptWordCount: result.transcript_word_count || 0,
          },
        });
      
        res.json(result);
      } catch (err) {
        console.error("Parse error:", err);
        res.status(500).json({ message: "Failed to parse result" });
      }
      
    });
  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments({ userId });

    res.json({
      videos,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateVideoSummary = async (req, res) => {
  try {
    const { videoId, summaryPoints, keywords, segments } = req.body;

    const updated = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          summaryPoints,
          keywords,
          segments,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({ message: "Video summary updated", video: updated });
  } catch (err) {
    console.error("Update summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(video);
  } catch (error) {
    console.error("Get video by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    fs.unlink(video.videoPath, async (err) => {
      if (err) {
        console.error("Failed to delete video file:", err);
        return res.status(500).json({ message: "File deletion error" });
      }

      await Video.findByIdAndDelete(id);

      res.json({ message: "Video deleted successfully" });
    });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ message: "Server error" });
  }
};