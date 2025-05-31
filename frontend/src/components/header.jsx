import React, { useEffect, useState } from "react";
import { useNavigate, NavLink  } from "react-router-dom";
import "./header.css";
import Notification from "./notification";

export default function Header() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setNotification({ message: "Logged out successfully", type: "success" });
    setTimeout(() => {
      navigate("/login");;
    }, 1500);
  };

  return (
    <header className="header">
      <div className="header-left">
        <span>Vis</span><span className="color-primary">tora</span>
      </div>
      <nav className="header-nav">
        <NavLink to="/upload" className="header-link" activeclassname="active">Upload</NavLink>
        <NavLink to="/history" className="header-link" activeclassname="active">History</NavLink>
        <NavLink to="/analyse" className="header-link" activeclassname="active">Visualise</NavLink>
      </nav>
      <div className="header-right">
        {email && <span className="user-email">{email}</span>}
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </header>
  );
}
