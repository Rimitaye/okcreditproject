import React, { useState, useEffect } from "react"; // 🟢 Added useEffect
import { useNavigate } from "react-router-dom";
import { 
  MdArrowBack, MdSave, MdCameraAlt, MdPerson, MdPhone, 
  MdBusiness, MdCategory, MdLocationOn, MdEmail, 
  MdInfo, MdContactPage 
} from "react-icons/md";

export default function EditProfile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Initial State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    email: "",
    aboutUs: "",
    contactPerson: "",
    address: "",
    businessType: "Retail Shop",
    category: "General Store"
  });

  // 🟢 AUTO-FETCH DATA ON LOAD
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`https://okcreditproject.onrender.com/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          // Update state with actual data from MongoDB
          setFormData({
            name: data.name || "",
            phone: data.phone || data.mobile || "",
            businessName: data.businessName || "",
            email: data.email || "",
            aboutUs: data.aboutUs || "",
            contactPerson: data.contactPerson || "",
            address: data.address || "",
            businessType: data.businessType || "Retail Shop",
            category: data.category || "General Store"
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    if (userId) fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`https://okcreditproject.onrender.com/api/users/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Sync local storage so other parts of the app update
        localStorage.setItem("userName", formData.name);
        localStorage.setItem("userPhone", formData.phone);
        localStorage.setItem("businessName", formData.businessName);
        
        alert("Profile updated successfully!");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.clear(); // 🟢 Clears token, userId, and businessName
      navigate("/login");
      window.location.reload(); // Ensures the app state resets
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: "#fff", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #edf2f7", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <MdArrowBack size={24} onClick={() => navigate(-1)} style={{ cursor: "pointer", color: "#4a5568" }} />
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#2d3748" }}>Edit Profile</span>
        </div>
        <button 
        onClick={handleLogout} 
        style={{ 
          background: "none", 
          border: "none", 
          color: "#ef4444", // Red color for logout
          fontWeight: "700", 
          fontSize: "16px", 
          cursor: "pointer" 
        }}
      >
        Logout
      </button>
    
      </div>

      {/* AVATAR SECTION */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", background: "#fff" }}>
        <div style={{ position: "relative" }}>
          <div style={avatarCircle}>
            {formData.name ? formData.name.charAt(0).toUpperCase() : <MdPerson size={40} />}
          </div>
          <div style={editIconBadge}><MdCameraAlt size={16} color="#fff" /></div>
        </div>
        <h2 style={{ marginTop: "12px", fontSize: "18px", fontWeight: "700", color: "#2d3748", marginBottom: "4px" }}>
          {formData.phone || "Loading..."}
        </h2>
        <span style={{ fontSize: "13px", color: "#718096" }}>{formData.businessName || "Business Profile"}</span>
      </div>

      <div style={{ padding: "16px" }}>
        {/* SECTION 1: BUSINESS INFO */}
        <h3 style={sectionTitle}>Business Info</h3>
        <div style={cardStyle}>
          <div style={inputRow}>
            <MdPerson style={iconStyle} />
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Profile Name</label>
              <input name="name" value={formData.name} onChange={handleChange} style={minimalInput} placeholder="Your Name" />
            </div>
          </div>
          <div style={divider} />
          <div style={inputRow}>
            <MdPhone style={iconStyle} />
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Mobile Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} style={minimalInput} placeholder="Phone Number" />
            </div>
          </div>
          <div style={divider} />
          <div style={inputRow}>
            <MdBusiness style={iconStyle} />
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Business Name</label>
              <input name="businessName" value={formData.businessName} onChange={handleChange} style={minimalInput} placeholder="Shop Name" />
            </div>
          </div>
          <div style={divider} />
          <div style={inputRow}>
            <MdLocationOn style={iconStyle} />
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Business Address</label>
              <input name="address" value={formData.address} onChange={handleChange} style={minimalInput} placeholder="Enter full address" />
            </div>
          </div>
        </div>

        {/* SECTION 2: OTHER INFORMATION */}
        <h3 style={sectionTitle}>Other Information</h3>
        <div style={cardStyle}>
          <div style={inputRow}>
            <MdEmail style={iconStyle} />
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email Address</label>
              <input name="email" value={formData.email} onChange={handleChange} style={minimalInput} placeholder="Add email" />
            </div>
          </div>
          <div style={divider} />
          <div style={inputRow}>
            <MdInfo style={iconStyle} />
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>About Us</label>
              <input name="aboutUs" value={formData.aboutUs} onChange={handleChange} style={minimalInput} placeholder="Short description" />
            </div>
          </div>
          <div style={divider} />
          <div style={inputRow}>
            <MdContactPage style={iconStyle} />
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Contact Person Name</label>
              <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} style={minimalInput} placeholder="Manager/Owner name" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} style={modernSaveButton}>
          Update Profile
        </button>
      </div>
    </div>
  );
}

// STYLES
const avatarCircle = { width: "90px", height: "90px", borderRadius: "50%", background: "#f0fdf4", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };
const editIconBadge = { position: "absolute", bottom: "4px", right: "4px", background: "#10b981", padding: "6px", borderRadius: "50%", border: "2px solid #fff", display: "flex" };
const sectionTitle = { fontSize: "14px", fontWeight: "700", color: "#718096", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginLeft: "4px" };
const cardStyle = { background: "#fff", borderRadius: "16px", padding: "4px 16px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" };
const inputRow = { display: "flex", alignItems: "center", padding: "12px 0", gap: "16px" };
const iconStyle = { color: "#10b981", fontSize: "20px" };
const labelStyle = { fontSize: "11px", color: "#a0aec0", fontWeight: "600", marginBottom: "2px", display: "block" };
const minimalInput = { width: "100%", border: "none", outline: "none", fontSize: "15px", fontWeight: "500", color: "#2d3748", background: "transparent", padding: 0 };
const divider = { height: "1px", background: "#f1f5f9", width: "100%" };
const modernSaveButton = { width: "100%", padding: "16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "700", fontSize: "16px", marginTop: "8px", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)", cursor: "pointer" };