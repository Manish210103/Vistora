import React, { useRef, useState } from "react";
import SegmentedSeekBar from "./SegmentedSeekBar";
import "./VideoPlayer.css";
import reset from "../assets/reset.svg";
import volumeup from "../assets/volume.svg";
import volumedown from "../assets/mute.svg";

export default function CustomVideoPlayer({ videoUrl, segments }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true); 

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted || volume === 0) {
      video.muted = false;
      video.volume = 0.5;
      setVolume(0.5);
      setIsMuted(false);
    } else {
      video.muted = true;
      video.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const changeVolume = (e) => {
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    videoRef.current.muted = false;
    setVolume(vol);
    setIsMuted(false);
  };

  const resetVideo = () => {
    const video = videoRef.current;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (time) => {
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const currentSegment = segments.find(
    (s) => currentTime >= s.start && currentTime < s.end
  );

  return (
    <div className="video-player-wrapper">
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        width="100%"
        height="auto"
        className="video"
      />

      {showCaptions && currentSegment?.text && (
        <div className="caption-overlay">{currentSegment.text}</div>
      )}

      <div className="controls">
        <button onClick={togglePlay} className="play-pause-btn">
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <button onClick={resetVideo} className="reset-btn" title="Reset">
          <img src={reset} alt="Reset" />
        </button>

        <div className="volume-control">
          <button onClick={toggleMute} className="volume-btn">
            {isMuted || volume === 0 ? (
              <img src={volumedown} alt="Muted" />
            ) : (
              <img src={volumeup} alt="Volume" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={changeVolume}
            className="volume-slider"
          />
        </div>

        <button
          onClick={() => setShowCaptions((prev) => !prev)}
          className="captions-btn"
          title="Toggle Captions"
        >
          {showCaptions ? "CC On" : "CC Off"}
        </button>

        <div className="time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <SegmentedSeekBar
        duration={duration}
        currentTime={currentTime}
        onSeek={handleSeek}
        segments={segments}
      />
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
