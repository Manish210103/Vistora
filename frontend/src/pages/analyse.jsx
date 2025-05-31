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
    console.log("videoId:", videoId);
    fetchVideoAnalysis();
  }, [videoId]);

  const segmentLineData = (summaryData?.segments ?? []).map((seg, idx) => {
    const start = isNaN(seg.start) ? 0 : parseFloat(seg.start.toFixed(2));
    const end = isNaN(seg.end) ? 0 : parseFloat(seg.end.toFixed(2));
    const duration = isNaN(end - start) ? 0 : parseFloat((end - start).toFixed(2));
    return {
      index: idx + 1,
      start,
      duration,
      title: seg.title || "Untitled Segment",
    };
  });

  console.log("segmentLineData:", segmentLineData);

  const keywordFrequencyData = (summaryData?.keywords ?? []).map((kw) => ({
    name: kw.length > 15 ? `${kw.slice(0, 15)}...` : kw,
    value: 1,
  }));

  const binSize = 5; 
  const maxDuration = Math.max(...segmentLineData.map(d => d.duration), 15);
  const bins = Array(Math.ceil(maxDuration / binSize)).fill(0).map((_, i) => ({
    range: `${i * binSize}-${(i + 1) * binSize}s`,
    count: segmentLineData.filter(d => d.duration >= i * binSize && d.duration < (i + 1) * binSize).length,
  }));

  const clusterData = (summaryData?.segments ?? [])
    .map((seg, idx) => {
      const text = seg.text.toLowerCase();
      let cluster = 0; 
      if (text.includes("object-oriented") || text.includes("class")) cluster = 1;
      else if (text.includes("compiler") || text.includes("memory")) cluster = 2;
      return {
        index: idx + 1,
        duration: parseFloat((seg.end - seg.start).toFixed(2)),
        cluster,
        title: seg.title,
      };
    })
    .sort((a, b) => a.index - b.index); 

  const totalDuration = summaryData?.segments?.length
    ? summaryData.segments[summaryData.segments.length - 1].end
    : 0;

  const totalSummaryWords = (summaryData?.summaryPoints ?? []).reduce(
    (sum, point) => sum + point.split(/\s+/).filter(word => word).length,
    0
  );

  const CustomTooltip = ({ active, payload, label }) => {
    console.log("Tooltip triggered:", { active, payload, label });
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
              <h4>Total Summary Words</h4>
              <p>{totalSummaryWords}</p>
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
              <h3>Segment Topic Clustering</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <XAxis
                    dataKey="index"
                    type="number"
                    domain={[1, segmentLineData.length]}
                    label={{ value: "Segment Index", position: "insideBottom" }}
                    allowDataOverflow
                  />
                  <YAxis dataKey="duration" label={{ value: "Duration (s)", angle: -90, position: "insideLeft" }} />
                  <Tooltip content={<ClusterTooltip />} wrapperStyle={{ zIndex: 1000, outline: "none",backgroundColor:"#000",padding:"12px",borderRadius:"12px"}}/>
                  {CLUSTER_COLORS.map((color, i) => (
                    <Scatter
                      key={`cluster-${i}`}
                      data={clusterData.filter(d => d.cluster === i)}
                      fill={color}
                      shape="circle"
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-large">
              <h3>Segment Duration Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bins}>
                  <XAxis dataKey="range" label={{ value: "Duration Range (s)", position: "insideBottom" }} />
                  <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                  <Tooltip wrapperStyle={{ zIndex: 1000, outline: "none",backgroundColor:"#000",padding:"12px",borderRadius:"12px"}}/>
                  <Bar dataKey="count" fill="#7209b7" isAnimationActive={false}/>
                </BarChart>
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