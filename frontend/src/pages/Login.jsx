import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://okcreditproject.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();
      console.log("Full Data from Server:", data);

if (data.status === "success") {
      // 🟢 THE KEY FIX: Save the token returned by your new backend logic
      localStorage.setItem("token", data.token);
    // data.userId comes from 'user._id' in auth.js
    localStorage.setItem("userId", data.userId);
    // data.userName comes from 'user.name' in auth.js
    localStorage.setItem("userName", data.userName);
    localStorage.setItem("userPhone", data.userPhone);
    navigate("/dashboard");
} else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Cannot connect to Node.js server. Please ensure the backend is running.");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "#2ecc71" }}>OkCredit Clone</h2>
      <p style={{ textAlign: "center", color: "#666" }}>Login to manage your business ledger</p>
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 30 }}>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          required
        />
        <button
          type="submit"
          style={{
            padding: 14,
            background: "#2ecc71",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          LOGIN
        </button>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
  Don't have an account? 
  <span 
    onClick={() => navigate("/register")} 
    style={{ color: "#2ecc71", cursor: "pointer", fontWeight: "bold", marginLeft: 5 }}
  >
    Register here
  </span>
</p>
      </form>
    </div>
  );
}