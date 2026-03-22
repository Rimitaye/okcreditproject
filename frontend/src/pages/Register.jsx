import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", phone: "", password: "" });
  const navigate = useNavigate();

const handleRegister = async (e) => {
    e.preventDefault();
    try {
const response = await fetch("http://localhost:5000/api/auth/register", {        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ CHANGE THIS LINE:
        body: JSON.stringify(formData), 
      });

      const data = await response.json();
    

      if (data.status === "success") {
        alert("Registration Successful! Please login.");
        navigate("/login");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
  alert("Cannot connect to Node.js server. Please check if 'node server.js' is running."); // ✅ NEW MESSAGE
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "#2ecc71" }}>Create Account</h2>
      <p style={{ textAlign: "center", color: "#666" }}>Join OkCredit to manage your business ledger</p>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 30 }}>
        <input
          type="text"
          placeholder="Business/Owner Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <input
          type="password"
          placeholder="Set Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button
          type="submit"
          style={{
            padding: 14, background: "#2ecc71", color: "#fff",
            border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer"
          }}
        >
          REGISTER
        </button>
      </form>
      
      <p style={{ textAlign: "center", marginTop: 20 }}>
        Already have an account? <Link to="/login" style={{ color: "#2ecc71" }}>Login here</Link>
      </p>
    </div>
  );
}