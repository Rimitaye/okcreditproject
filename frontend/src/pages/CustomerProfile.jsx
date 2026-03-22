import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdArrowBack, MdPhone, MdLocationOn, MdDelete,MdEdit } from "react-icons/md";

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/customers/${id}`);
        setCustomer(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching customer", err);
      }
    };
    fetchCustomer();
  }, [id]);

const handleUpdate = async () => {
  try {
    // 🎯 Adding '/profile' tells the backend to use the correct "Door"
    const url = `http://localhost:5000/api/customers/profile/${id}`;
    
    const dataToSend = {
      name: customer.name,
      phone: customer.phone,
      address: customer.address
    };

    console.log("🚀 Sending to NEW door:", url);

    const response = await axios.put(url, dataToSend);
    
    if (response.status === 200) {
      alert("Profile updated successfully.");
    }
  } catch (err) {
    console.error("Connection error:", err);
  }
};

  const handleDelete = async () => {
    if (window.confirm("Are you sure? All transaction data will be deleted permanently.")) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        navigate("/"); // Redirect to home after deletion
      } catch (err) {
        alert("Error deleting customer");
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", padding: "15px", display: "flex", alignItems: "center", gap: "15px", borderBottom: "1px solid #eee" }}>
        <MdArrowBack size={24} onClick={() => navigate(-1)} style={{ cursor: "pointer" }} />
        <span style={{ fontWeight: "bold", fontSize: "18px" }}>Customer Profile</span>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Name Display */}
       {/* Name Edit Section */}
{/* Name Edit Section */}
<div style={{ background: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "20px", textAlign: "center" }}>
  <div style={{ 
    width: "60px", height: "60px", background: "#1976d2", color: "#fff", 
    borderRadius: "50%", display: "flex", alignItems: "center", 
    justifyContent: "center", fontSize: "24px", fontWeight: "bold", margin: "0 auto 15px" 
  }}>
    {customer.name ? customer.name.charAt(0).toUpperCase() : "?"}
  </div>

  {/* 🟢 Container for Input + Icon */}
  <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
    <input
      type="text"
      value={customer.name}
      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
      style={{ 
        fontSize: "20px", 
        fontWeight: "bold", 
        textAlign: "center", 
        border: "none", 
        borderBottom: "1px solid #ddd", 
        width: "80%", 
        outline: "none",
        padding: "5px 25px 5px 5px" // Room for the icon on the right
      }}
    />
    <MdEdit 
      size={18} 
      style={{ 
        position: "absolute", 
        right: "12%", 
        top: "50%", 
        transform: "translateY(-50%)", 
        color: "#888",
        pointerEvents: "none" // Click passes through to the input
      }} 
    />
  </div>
</div>
        {/* Form Fields */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#666", fontSize: "14px", marginBottom: "8px" }}>
              <MdPhone /> Mobile Number
            </label>
            <input
              type="text"
              value={customer.phone || ""}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="Add mobile number"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#666", fontSize: "14px", marginBottom: "8px" }}>
              <MdLocationOn /> Address
            </label>
            <textarea
              value={customer.address || ""}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="Add address"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", minHeight: "80px" }}
            />
          </div>

          <button onClick={handleUpdate} style={{ width: "100%", padding: "12px", background: "none", color: "#61b858a0", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
            SAVE PROFILE
          </button>
        </div>

        {/* Delete Action */}
        <button 
          onClick={handleDelete}
          style={{ width: "100%", marginTop: "30px", padding: "12px", background: "none", color: "#d63031", border: "1px solid #e7e2e2", borderRadius: "5px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          <MdDelete /> DELETE CUSTOMER
        </button>
      </div>
    </div>
  );
}