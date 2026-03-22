import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddCustomer() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🟢 Added missing state

  // 1. 🛡️ PROTECT THE PAGE
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId || userId === "null" || userId === "undefined") {
      console.warn("Unauthorized access: No userId found.");
      navigate("/login");
    }
  }, [navigate]);

  async function handleSave() {
    if (!name.trim()) return alert("Name is required");

    const userId = localStorage.getItem("userId");

    const customerData = {
      name: name.trim(),
      phone: phone || "",
      type: "customer",
      userId: userId
    };

    try {
      setIsLoading(true); 

      // 🟢 DIRECT CLOUD SAVE
      const response = await fetch("http://localhost:5000/api/customers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        console.log("✅ Saved to MongoDB successfully");
        navigate('/dashboard');
      } else {
        alert("Server error: Could not save customer.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("No internet connection. Please try again when online.");
    } finally {
      setIsLoading(false);
    }
  }

  // 📇 Add from Contacts (PWA-safe)
  async function handlePickContact() {
    if (!("contacts" in navigator) || !("ContactsManager" in window)) {
      alert("Contacts not supported on this device");
      return;
    }

    try {
      const contacts = await navigator.contacts.select(
        ["name", "tel"],
        { multiple: false }
      );

      if (contacts.length > 0) {
        const contact = contacts[0];
        setName(contact.name?.[0] || "");
        setPhone(contact.tel?.[0] || "");
      }
    } catch (err) {
      console.log("Contact pick cancelled", err);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ marginRight: 12, fontSize: 18, background: "none", border: "none" }}> ← </button>
        <h2 style={{ margin: 0 }}>Add Customer</h2>
      </div>

      <input
        placeholder="Customer name *"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: "100%", padding: 12, fontSize: 16, marginBottom: 12 }}
      />

      <input
        placeholder="Mobile number (optional)"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        style={{ width: "100%", padding: 12, fontSize: 16, marginBottom: 16 }}
      />

      <button
        onClick={handlePickContact}
        style={{ width: "100%", padding: 12, marginBottom: 24, background: "#f1f1f1", border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
      >
        📇 Add from Contacts
      </button>

      <button
        disabled={!name.trim() || isLoading}
        onClick={handleSave}
        style={{
          width: "100%", padding: 14, fontSize: 16,
          background: name.trim() ? "#2ecc71" : "#ccc",
          color: "#fff", border: "none", borderRadius: 6
        }}
      >
        {isLoading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}