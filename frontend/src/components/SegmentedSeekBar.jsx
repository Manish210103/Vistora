import React, { useRef, useState } from "react";
import "./SegmentedSeekBar.css";

export default function SegmentedSeekBar({ duration, currentTime, onSeek, segments }) {
  const barRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const getSeekTime = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    return Math.min(Math.max(ratio * duration, 0), duration);
  };

  const handleClick = (e) => {
    const time = getSeekTime(e);
    onSeek(time);
  };

  const handleMouseMove = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    setHoverX(x);
    const segment = segments.find((s) => time >= s.start && time < s.end);
    setHoveredSegment(segment);
    if (isDragging) {
      onSeek(time);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const time = getSeekTime(e);
    onSeek(time);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("mousemove", handleMouseMove);
  };

  return (
    <div
      ref={barRef}
      className="segmented-seekbar"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="track">
        {segments.map((seg, i) => {
          const left = (seg.start / duration) * 100;
          const width = ((seg.end - seg.start) / duration) * 100;
          return (
            <div
              key={i}
              className="segment"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
        <div
          className="progress"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <div
          className="thumb"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          onMouseDown={handleMouseDown}
        />
      </div>
      {hoveredSegment && (
        <div className="tooltip" style={{ left: hoverX }}>
          {hoveredSegment.title}
        </div>
      )}
    </div>
  );
}
