// components/notification.jsx
import React, { useEffect } from "react";
import correct from "../assets/correct.svg";
import wrong from "../assets/wrong.svg";

const notificationStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  minWidth: "250px",
  padding: "15px 20px",
  color: "#fff",
  fontWeight: "600",
  fontSize: "14px",
  zIndex: 1000,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
  display: "flex",
  alignItems: "center",
  borderRadius: "8px",
  gap: "10px",
};

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 1500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        ...notificationStyle,
        backgroundColor: type === "success" ? "#4CAF50" : "#f44336",
      }}
    >
      <img
        src={type === "success" ? correct : wrong}
        alt={type === "success" ? "Success" : "Error"}
        style={{ width: "40px", height: "40px" }} 
      />
      {message}
    </div>
  );
}