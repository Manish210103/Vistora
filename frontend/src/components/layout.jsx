// src/components/Layout.jsx
import React from "react";
import Header from "./header";
import Footer from "./footer";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
