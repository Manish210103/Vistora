/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { Filter } from "lucide-react";
import axios from "axios";
import "./history.css"
import _ from "lodash";
import history from "../assets/history.svg";
import history1 from "../assets/history1.svg";
import Notification from "../components/notification";
import VideoPlayer from "../components/VideoPlayer";
import { generatePDF } from "../utils/pdfGenerator";


export default function History() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [error, setError] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [videoDetails, setVideoDetails] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterAnalyzed, setFilterAnalyzed] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinKeywords, setFilterMinKeywords] = useState(0);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const limit = 10;
  const isFetchingRef = useRef(false);
  const listRef = useRef(null);
  const hasFetchedRef = useRef({});

  const fetchVideos = async (pageNum) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;

    try {
      isFetchingRef.current = true;
      const response = await axios.get(
        `http://localhost:5000/api/video/user/${userId}?page=${pageNum}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newVideos = response.data.videos;
      setVideos((prev) => [...prev, ...newVideos]);
      setFilteredVideos((prev) => [...prev, ...newVideos]);
      if (newVideos.length < limit) setHasMore(false);
    } catch (err) {
      setError("Failed to fetch videos");
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideoId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/video/${selectedVideoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        const err = await response.json();
        setNotification({ message: "Failed to delete video.", type: "error" });
        return;
      }
  
      setNotification({ message: "Video deleted successfully!", type: "success" });
  
      setVideos((prev) => prev.filter((v) => v._id !== selectedVideoId));
      setSelectedVideoId(null);
    } catch (error) {
      console.error("Delete error:", error);
      setNotification({ message: "An error occurred.", type: "error" });
    }
  };
  

  useEffect(() => {
    if (hasFetchedRef.current[page]) return;

    hasFetchedRef.current[page] = true;
    fetchVideos(page);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      const element = listRef.current;
      if (!element || isFetchingRef.current || !hasMore) return;

      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) {
        setPage((prev) => prev + 1);
      }
    };

    const el = listRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  useEffect(() => {
    let filtered = [...videos];

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((video) =>
        video.originalName?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterAnalyzed !== null) {
      filtered = filtered.filter((v) => v.isAnalyzed === filterAnalyzed);
    }

    if (filterStartDate) {
      const start = new Date(filterStartDate);
      filtered = filtered.filter((v) => new Date(v.createdAt) >= start);
    }

    if (filterEndDate) {
      const end = new Date(filterEndDate);
      filtered = filtered.filter((v) => new Date(v.createdAt) <= end);
    }

    if (filterMinKeywords > 0) {
      filtered = filtered.filter((v) => (v.keywords?.length || 0) >= filterMinKeywords);
    }

    setFilteredVideos(filtered);
  }, [search, videos, filterAnalyzed, filterStartDate, filterEndDate, filterMinKeywords]);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!selectedVideoId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/video/id/${selectedVideoId}`);
        setVideoDetails(res.data);
      } catch (err) {
        console.error("Failed to fetch video details:", err);
      }
    };
    fetchVideoDetails();
  }, [selectedVideoId]);

  return (
    <div className="history-split-layout">
      <div className="left-panel">
        <div className="top-controls">
          <div className="search-container">
            <input
              className="search-box"
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="filter-btn" onClick={() => setShowFilterPopup(!showFilterPopup)}>
            <Filter size={18} />
          </button>
        </div>

        {showFilterPopup && (
          <div className="filter-popup">
            <h3 className="filter-title">Filters</h3>
            <hr className="filter-line"/>
            <label>
              <input
                type="checkbox"
                checked={filterAnalyzed === true}
                onChange={(e) => setFilterAnalyzed(e.target.checked ? true : null)}
              />
              Only Analyzed
            </label>
            <label>
              Date From:
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </label>
            <label>
              Date To:
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </label>
          </div>
        )}

      <div className="video-list" ref={listRef}>
        {filteredVideos.length === 0 ? (
            <img src={history1} alt="No history" className="no-history1" />
        ) : (
          <>
            {filteredVideos.map((video) => (
              <div
                key={video._id}
                className={`video-item ${selectedVideoId === video._id ? "selected" : ""}`}
                onClick={() => setSelectedVideoId(video._id)}
              >
                <video
                  className="video-thumb"
                  src={`http://localhost:5000/${video.videoPath}`}
                  muted
                />
                <div className="video-meta">
                  <p className="video-title">{video.originalName || "Untitled"}</p>
                  <p className="video-date">{new Date(video.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      </div>

      <div className="right-panel">
        {selectedVideoId && videoDetails ? (
          <div className="right-panel-inner">
            <div className="right-left">
            <VideoPlayer
              videoUrl={`http://localhost:5000/${videoDetails.videoPath}`}
              segments={videoDetails.segments}
            />

              <div className="video-info">
                <h2>{_.capitalize(videoDetails.originalName || "Untitled Video")}</h2>
                <p><strong>Uploaded at:</strong> {new Date(videoDetails.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> {videoDetails.isAnalyzed ? "Analyzed" : "Pending"}</p>
              </div>
            </div>


            <div className="right-right">
              <h2 className="right-title">Details</h2>
              <button
                className="delete-btn"
                onClick={() => handleDeleteVideo(selectedVideoId)}
                title="Delete video"
              >
                Delete
              </button>
              <button
                className="download-btn"
                onClick={() => generatePDF(videoDetails)}
              >
                Download PDF
              </button>

              <div className="right-content-scroll">
                <section>
                  <h3>Summary</h3>
                  <p>{(videoDetails.summaryPoints && videoDetails.summaryPoints.length > 0)
                    ? videoDetails.summaryPoints
                    : "No Summary available."}</p>
                </section>
                <section>
                  <h3>Keywords</h3>
                  <p>{(videoDetails.keywords && videoDetails.keywords.length > 0)
                    ? videoDetails.keywords.join(", ")
                    : "No keywords available."}</p>
                </section>
                <section>
                  <h3>Segments</h3>
                  <ul>
                    {(videoDetails.segments && videoDetails.segments.length > 0)
                      ? videoDetails.segments.map((seg, i) => (
                          <li key={i}>{seg.title || seg}</li>
                        ))
                      : <li>No segments available.</li>}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <img className="no-history" src={history} alt="" />
        )}
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </div>
  );
}
