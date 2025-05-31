import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import registerImage from "../assets/register-bg.webp";
import Notification from "../components/notification";
import SpectrogramBackground from "../components/SpectrogramBackground";

import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: "", type: "" });

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", { email, password });
      setNotification({ message: "Registration successful! Please login.", type: "success" });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Registration failed", type: "error" });
    }
  };

  return (
    <div className="register-container">
      <SpectrogramBackground />
      <img className="register-image" src={registerImage} alt="Register Background" />
      <h2 className="register-title">Register</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="register-input"
      />

      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="password-toggle"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>

      <button onClick={handleRegister} className="register-button">
        Register
      </button>

      <hr className="register-divider" />

      <p className="register-footer">
        Already have an account?{" "}
        <a href="/login">
          Login
        </a>
      </p>
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </div>
  );
}
