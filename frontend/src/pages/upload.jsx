// src/pages/Upload.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Video, X } from "lucide-react";
import "./Upload.css";

export default function Upload() {
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!video) {
      setPreview(null);
      setIsLoading(false);
      return;
    }

    const objectUrl = URL.createObjectURL(video);
    setIsLoading(true);

    const videoEl = document.createElement("video");
    videoEl.src = objectUrl;
    videoEl.onloadeddata = () => {
      setPreview(objectUrl);
      setIsLoading(false);
    };

    return () => URL.revokeObjectURL(objectUrl);
  }, [video]);

  const handleUpload = async () => {
    if (!video) {
      alert("Please select a video first.");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert(res.data.msg);
      setVideo(null);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    }
  };

  return (
    <div className="upload-page">
      <div className="center-panel">
        {!video ? (
          <label className="upload-box">
            <Video className="upload-icon" />
            <span className="upload-text">Click here to upload</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files[0])}
            />
          </label>
        ) : isLoading ? (
          <div className="loader">Loading video preview...</div>
        ) : (
          <div className="preview-container">
            <video src={preview} controls className="video-preview" />
            <button
              className="remove-button"
              onClick={() => setVideo(null)}
              aria-label="Remove video"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!video || isLoading}
          style={{ opacity: video && !isLoading ? 1 : 0.6, cursor: video && !isLoading ? "pointer" : "not-allowed" }}
        >
          Upload
        </button>
      </div>

      <div className="right-panel">
        <h3 className="summary-title">Summary</h3>
        <div className="summary-placeholder">
          <p>Summarized text will appear here after processing.</p>
        </div>
      </div>
    </div>
  );
}
