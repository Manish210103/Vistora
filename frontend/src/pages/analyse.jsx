import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import useVideoStore from "../store/videoStore";
import "./Analyse.css";
import visualise from "../assets/visualise.svg";

const COLORS = ["#7209b7", "#f72585", "#b5179e", "#a62fde", "#c77dff"];
const CLUSTER_COLORS = ["#f72585", "#7209b7", "#b5179e"];

export default function Analyse() {
  const { videoId } = useVideoStore();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  const fetchVideoAnalysis = async () => {
    if (!videoId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/video/id/${videoId}`);
      console.log("Fetched video analysis:", response.data);
      setSummaryData(response.data);
    } catch (err) {
      setError("Failed to fetch video data");
      console.error("Fetch video analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!videoId || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchVideoAnalysis();
  }, [videoId]);

  const segmentLineData = (summaryData?.segments ?? []).map((seg, idx) => {
    const safeStart = typeof seg.start === "number" && !isNaN(seg.start) ? seg.start : 0;
    const safeEnd = typeof seg.end === "number" && !isNaN(seg.end) ? seg.end : 0;
    const duration = Math.max(0, parseFloat((safeEnd - safeStart).toFixed(2)));
  
    return {
      index: idx + 1,
      start: parseFloat(safeStart.toFixed(2)),
      duration,
      title: seg.title || "Untitled Segment",
    };
  });
  


  const keywordFrequencyData = (summaryData?.keywords ?? []).map((kw) => ({
    name: kw.length > 15 ? `${kw.slice(0, 15)}...` : kw,
    value: 1,
  }));

  const clusterData = (summaryData?.segments ?? []).map((seg, idx) => ({
    index: idx + 1,
    duration: parseFloat((seg.end - seg.start).toFixed(2)),
    cluster: seg.cluster,
    title: seg.title,
    x: seg.x,
    y: seg.y,
  }));
  

  const totalDuration = summaryData?.audioDuration ?? 0;


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload || {};
      return (
        <div className="custom-tooltip">
          <strong>{data.title || "No Title"}</strong>
          <p>Segment: {data.index || label || "N/A"}</p>
          <p>Start: {data.start !== undefined ? `${data.start}s` : "N/A"}</p>
          <p>Duration: {data.duration !== undefined ? `${data.duration}s` : "N/A"}</p>
        </div>
      );
    }
    return null;
  };

  const SentimentTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sentimentValue = payload[0].value;
      const time = label;
  
      let sentimentLabel = "Neutral";
      if (sentimentValue > 0.3) sentimentLabel = "Positive 😊";
      else if (sentimentValue < -0.3) sentimentLabel = "Negative 😞";
  
      return (
        <div
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "12px",
            borderRadius: "12px",
            zIndex: 1000,
            outline: "none",
          }}
        >
          <p><strong>Time:</strong> {time}s</p>
          <p><strong>Sentiment:</strong> {sentimentLabel}</p>
        </div>
      );
    }
    return null;
  };
  

  const ClusterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload || {};
      return (
        <div className="custom-tooltip">
          <strong>{data.title || "No Title"}</strong>
          <p>Segment: {data.index || "N/A"}</p>
          <p>Duration: {data.duration || "N/A"}s</p>
          <p>Cluster: {data.cluster !== undefined ? data.cluster : "N/A"}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analyse-container">
      <h2>Analysis</h2>

      {loading && <p>Loading...</p>}

      {error && (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          <button className="analyse-btn" onClick={fetchVideoAnalysis}>Retry</button>
        </div>
      )}

      {!loading && !error && summaryData && (
        <>
          <div className="top-summary-boxes">
            <div className="summary-box">
              <h4>Total Keywords</h4>
              <p>{summaryData.keywords?.length ?? 0}</p>
            </div>
            <div className="summary-box">
              <h4>Video Title</h4>
              <p>{summaryData.originalName ?? "Untitled Video"}</p>
            </div>
            <div className="summary-box">
              <h4>Total Duration</h4>
              <p>
                {totalDuration
                  ? `${Math.floor(totalDuration / 60)}m ${Math.floor(totalDuration % 60)}s`
                  : "N/A"}
              </p>
            </div>
            <div className="summary-box">
              <h4>Compression Ratio</h4>
              <p>
                {summaryData.transcriptWordCount
                  ? `1 : ${Math.round(
                    summaryData.transcriptWordCount /
                    summaryData.summaryPoints.join(" ").split(" ").length
                    )}`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-large">
              <h3>Segment Duration Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={segmentLineData} isAnimationActive={false}>
                  <XAxis dataKey="index" label={{ value: "Segment Index", position: "insideBottom" }} />
                  <YAxis label={{ value: "Duration (s)", angle: -90, position: "insideLeft" }} />
                  <Tooltip content={<CustomTooltip />} offset={10} wrapperStyle={{ zIndex: 1000, outline: "none", backgroundColor:"#000",padding:"12px",borderRadius:"12px" }} />
                  <Line type="monotone" dataKey="duration" stroke="#a62fde" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-small">
              <h3>Keyword Pie Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={keywordFrequencyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    label
                  >
                    {keywordFrequencyData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip wrapperStyle={{ zIndex: 1000, outline: "none",backgroundColor:"#000",padding:"12px",borderRadius:"12px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-row">
          <div className="chart-small">
            <h3>Semantic Clustering of Transcript Segments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis
                  type="number"
                  dataKey="x"
                  name="X"
                  label={{ value: "X", position: "insideBottom" }}
                  domain={[0, 100]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Y"
                  label={{ value: "Y", angle: -90, position: "insideLeft" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={<ClusterTooltip />}
                  wrapperStyle={{
                    zIndex: 1000,
                    outline: "none",
                    backgroundColor: "#000",
                    padding: "12px",
                    borderRadius: "12px",
                  }}
                />
                {[...new Set(clusterData.map((d) => d.cluster))].map((clusterId, idx) => (
                  <Scatter
                    key={`cluster-${clusterId}`}
                    name={`Cluster ${clusterId}`}
                    data={clusterData.filter((d) => d.cluster === clusterId)}
                    fill={CLUSTER_COLORS[idx % CLUSTER_COLORS.length]}
                    shape="circle"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

            <div className="chart-large">
              <h3>Sentiment Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summaryData?.segments ?? []}>
                  <XAxis dataKey="start" label={{ value: "Time (s)", position: "insideBottom" }} />
                  <YAxis domain={[-1, 1]} label={{ value: "Sentiment", angle: -90, position: "insideLeft" }} />
                  <Tooltip content={<SentimentTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#f72585"
                    dot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        </>
      )}

      {!loading && !error && !summaryData && (
        <img className="no-visualise" src={visualise} alt="No visualisation available" />
      )}
    </div>
  );
}