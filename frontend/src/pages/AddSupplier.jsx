import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddSupplier() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!name.trim()) return alert("Please enter a name");

    const supplierData = {
      name: name.trim(),
      phone: phone || "",
      // 🟢 CRITICAL: This ensures it shows up in the Supplier Dashboard
      type: "supplier", 
      userId: localStorage.getItem("userId"),
      balance: 0, // Initial Balance Due is 0
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("https://okcreditproject.onrender.com/api/customers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });

      if (res.ok) {
        navigate("/dashboard"); // Go back to dashboard after saving
      }
    } catch (err) {
      console.error("Failed to add supplier:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Add New Supplier</h3>
      <input 
        placeholder="Supplier Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        style={inputStyle}
      />
      <input 
        placeholder="Phone Number (Optional)" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
        style={inputStyle}
      />
      <button onClick={handleSave} style={buttonStyle}>
        Save Supplier
      </button>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' };
const buttonStyle = { width: '100%', padding: '12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' };