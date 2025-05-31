import React, { useEffect, useRef } from "react";

const WaveformBackground = () => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const fftSize = 2048;

  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = fftSize;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      drawWaveform();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = "rgb(255, 255, 255)"; 
      ctx.lineWidth = 2;

      const sliceWidth = canvas.width / bufferLength;
      const yCenter = canvas.height / 2;
      const amplitude = canvas.height / 4; 

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0 - 1; 
        const y = yCenter + v * amplitude;
        const x = i * sliceWidth;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    draw();
  };

  useEffect(() => {
    setupAudio();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        background: "black",
      }}
    />
  );
};

export default WaveformBackground;