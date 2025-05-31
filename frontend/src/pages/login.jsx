import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";
import loginImage from "../assets/login-bg.webp";
import Notification from "../components/notification";
import SpectrogramBackground from "../components/SpectrogramBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: "", type: "" });

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("userId", res.data.userId);
      setNotification({ message: "Login successful!", type: "success" });
      setTimeout(() => {
        navigate("/upload");
      }, 1000);
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Login failed", type: "error" });
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <SpectrogramBackground />

      <div className="login-container">
        <img
          className="login-image"
          src={loginImage}
          alt="Login Background"
          style={{ opacity: 0.8, zIndex: 5 }}
        />
        <h2 className="login-title">Login</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <button onClick={handleLogin} className="login-button">
          Login
        </button>

        <hr className="login-divider" />

        <p className="login-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "" })}
        />
      </div>
    </div>
  );
}