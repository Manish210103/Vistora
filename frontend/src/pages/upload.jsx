import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Video, X } from "lucide-react";
import useVideoStore from "../store/videoStore";
import "./Upload.css";
import upload from "../assets/upload.svg";
import Notification from "../components/notification";
import analyseGif from "../assets/analyse.gif";

export default function Upload() {
  const {
    video,
    setVideo,
    videoId,
    setVideoId,
    summaryData,
    setSummaryData,
    reset,
  } = useVideoStore();

  const [preview, setPreview] = useState(null); 
  const [videoUrl, setVideoUrl] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [analyseLoading, setAnalyseLoading] = useState(false);
  const [analyseError, setAnalyseError] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const videoRef = useRef();

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
      setNotification({ message: "Please select a video first.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("video", video);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/video/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotification({ message: res.data.message , type: "success" });
      setVideoId(res.data.video._id);
      setSummaryData(null);

      setVideoUrl(`http://localhost:5000/${res.data.video.videoPath}`);

    } catch (err) {
      setNotification({ message: err.response?.data?.message, type: "error" });
    }
  };

  const handleAnalyse = async () => {
    if ((!video && !videoUrl) || !videoId) return;

    setAnalyseLoading(true);
    setAnalyseError(null);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/video/analyze",
        { videoId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummaryData(response.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setAnalyseError("Failed to get analysis");
      setSummaryData(null);
    } finally {
      setAnalyseLoading(false);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleRemoveVideo = () => {
    setVideo(null);
    setPreview(null);
    setVideoUrl(null);
    setVideoId(null);
    setSummaryData(null);
    setAnalyseError(null);
    reset();
  };

  return (
    <div className="upload-page">
      <div className="center-panel">
        <div className="search-container">
          <input
            className="search-box"
            type="text"
            placeholder="Search video title, tags..."
          />
        </div>

        {!video && !videoUrl ? (
          <label className="upload-box">
            <Video className="upload-icon" />
            <span className="upload-text">Click here to upload</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                setVideo(e.target.files[0]);
                setVideoUrl(null);
              }}
            />
          </label>
        ) : isLoading ? (
          <div className="loader">Loading video preview...</div>
        ) : (
          <div className="preview-container">
            <video
              ref={videoRef}
              src={video ? preview : videoUrl}
              controls
              className="video-preview"
            />
            <button
              className="remove-button"
              onClick={handleRemoveVideo}
              aria-label="Remove video"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="action-buttons">
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={(!video && !videoUrl) || isLoading}
            style={{
              opacity: (video || videoUrl) && !isLoading ? 1 : 0.6,
              cursor: (video || videoUrl) && !isLoading ? "pointer" : "not-allowed",
            }}
          >
            Upload
          </button>

          <button
            className="analyse-button"
            onClick={handleAnalyse}
            disabled={
              (!video && !videoUrl) || isLoading || analyseLoading || !videoId
            }
            style={{
              opacity:
                (video || videoUrl) && !isLoading && !analyseLoading && videoId
                  ? 1
                  : 0.6,
              cursor:
                (video || videoUrl) && !isLoading && !analyseLoading && videoId
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {analyseLoading ? "Analyzing..." : "Analyse"}
          </button>
        </div>
      </div>

      <div className="right-panel">
        <h3 className="summary-title">Summary</h3>
        <div className="summary-placeholder">
          {analyseError && <p style={{ color: "red" }}>{analyseError}</p>}

          {analyseLoading ? (
            <div className="loading-gif-wrapper">
              <img src={analyseGif} alt="Analyzing..." className="analyse-loader" />
            </div>
          ) : (
            !summaryData &&
            !analyseError && <img className="no-upload" src={upload} alt="" />
          )}


          {summaryData && (
            <>
              {summaryData.summary_points?.length > 0 && (
                <>
                  <h4>Summary Points:</h4>
                  <ul>
                    {summaryData.summary_points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </>
              )}

              {summaryData.keywords?.length > 0 && (
                <>
                  <h4>Keywords:</h4>
                  <p>{summaryData.keywords.join(", ")}</p>
                </>
              )}

              {summaryData.segments?.length > 0 && (
                <>
                  <h4>Segment Titles:</h4>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {summaryData.segments.map((seg, idx) => (
                      <li key={idx}>
                        <span
                          style={{
                            cursor: "pointer",
                            color: "blue",
                            textDecoration: "underline",
                            marginRight: "8px",
                          }}
                          onClick={() => handleSeek(seg.start)}
                        >
                          {formatTime(seg.start)}
                        </span>
                        – {seg.title}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </div>
    
  );
}
