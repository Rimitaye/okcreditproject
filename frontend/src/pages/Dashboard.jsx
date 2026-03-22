import React, { useEffect, useState,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdSearch, MdClose, MdMic } from "react-icons/md";
import CustomerRow from "../components/CustomerRow.jsx";
import SupplierRow from "../components/SupplierRow.jsx";
import BottomNav from "../components/BottomNav.jsx";
import SyncStatus from "../components/SyncStatus.jsx";
import AIChat from "../components/AIChat";

// ✅ FIX 1: Accept customers and suppliers as props from App.jsx
export default function Dashboard({ customers = [], suppliers = [] }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(localStorage.getItem("dashboardMode") || "customer");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  // ✅ FIX 2: Build the combined list from props — no internal fetch needed.
  // App.jsx owns the data and re-fetches on window focus, so this stays in sync automatically.
  const list = [
    ...customers.map(c => ({ ...c, type: "customer", balance: Number(c.balance || 0) })),
    ...suppliers.map(s => ({ ...s, type: "supplier", balance: Number(s.balance || 0) })),
  ];

  // 🎤 Voice Search
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();
    recognition.onresult = (event) => {
      setSearchQuery(event.results[0][0].transcript);
      setIsSearchOpen(true);
    };
  };

 const filteredList = useMemo(() => {
  const sourceData = mode === "customer" ? customers : suppliers;

  return sourceData.filter((item) => {
    const itemName = item?.name || ""; 
    return itemName.toLowerCase().includes(searchQuery.toLowerCase());
  });
}, [mode, customers, suppliers, searchQuery]); 

const netSummary = useMemo(() => {
  return filteredList.reduce((acc, item) => {
    const bal = Number(item.balance) || 0; 
    acc.totalAmount += bal;
    acc.count += 1;
    return acc;
  }, { totalAmount: 0, count: 0 });
}, [filteredList]);

const netBalance = netSummary.totalAmount;

  const getStatus = () => {
    if (netBalance > 0) return { label: mode === "customer" ? "You Get" : "You Pay", color: mode === "customer" ? "#2ecc71" : "#e74c3c" };
    if (netBalance < 0) return { label: mode === "customer" ? "Advance" : "You Get", color: "#74be71" };
    return { label: "Settled", color: "#95a5a6" };
  };
  const status = getStatus();

  const fabStyle = {
    position: "fixed", bottom: "80px", right: "20px",
    backgroundColor: mode === "customer" ? "#1a73e8" : "#2ecc71",
    color: "#fff", border: "none", borderRadius: "50px",
    padding: "12px 24px", fontSize: "16px", fontWeight: "700",
    display: "flex", alignItems: "center", gap: "8px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)", cursor: "pointer", zIndex: 1000,
  };

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 1100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div onClick={() => navigate("/profile")} style={{ width: "36px", height: "36px", background: "#1a73e8", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase" }}>
            {userName ? userName.charAt(0) : "U"}
          </div>
          <div style={{ fontWeight: "700", fontSize: "18px", color: "#333" }}>{userName}</div>
        </div>
      </div>

      {/* ✅ FIX 3: No isSyncing state needed — App.jsx handles loading.
          Pass false so the SyncStatus bar stays hidden while idle. */}
      <SyncStatus isSyncing={false} />

      {/* Mode Toggle + Search */}
      <div style={{ display: "flex", alignItems: "center", margin: "12px 16px", background: "#f1f1f1", borderRadius: "25px", padding: "4px", gap: "4px", transition: "all 0.3s ease" }}>
        <button
          onClick={() => { setMode("customer"); localStorage.setItem("dashboardMode", "customer"); }}
          style={{ flex: isSearchOpen ? "0.6" : "1", padding: "10px", borderRadius: "20px", border: "none", fontSize: isSearchOpen ? "12px" : "14px", background: mode === "customer" ? "#fff" : "transparent", fontWeight: mode === "customer" ? "600" : "400", transition: "0.3s" }}
        >Customer</button>
        <button
          onClick={() => { setMode("supplier"); localStorage.setItem("dashboardMode", "supplier"); }}
          style={{ flex: isSearchOpen ? "0.6" : "1", padding: "10px", borderRadius: "20px", border: "none", fontSize: isSearchOpen ? "12px" : "14px", background: mode === "supplier" ? "#fff" : "transparent", fontWeight: mode === "supplier" ? "600" : "400", transition: "0.3s" }}
        >Supplier</button>
        <div style={{ display: "flex", alignItems: "center", flex: isSearchOpen ? "2" : "0.2", background: isSearchOpen ? "#fff" : "transparent", borderRadius: "20px", padding: isSearchOpen ? "0 8px" : "0", transition: "all 0.3s ease", overflow: "hidden" }}>
          {!isSearchOpen ? (
            <div onClick={() => setIsSearchOpen(true)} style={{ padding: "8px", cursor: "pointer", width: "100%", textAlign: "center" }}><MdSearch size={22} color="#666" /></div>
          ) : (
            <>
              <input autoFocus placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", outline: "none", padding: "8px", fontSize: "14px" }} />
              <MdMic size={20} color="#1a73e8" onClick={startVoiceSearch} style={{ cursor: "pointer", marginRight: "5px" }} />
              <MdClose size={20} color="#666" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} style={{ cursor: "pointer" }} />
            </>
          )}
        </div>
      </div>

      {/* Net Balance Card */}
      <div
        onClick={() => navigate("/reports", { state: { mode } })}
        style={{ margin: "0 16px 16px 16px", padding: "20px", background: "#fff", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", cursor: "pointer" }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "12px", color: "#5f6368", fontWeight: "700", textTransform: "uppercase" }}>{mode} Summary</div>
          <div style={{ fontSize: "13px", color: "#80868b" }}>
            <span style={{ fontWeight: "600", color: "#333" }}>{netSummary.count}</span> {mode}s Added
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "22px", fontWeight: "900", color: status.color }}>₹{Math.abs(netBalance).toLocaleString("en-IN")}</div>
          <div style={{ fontSize: "10px", fontWeight: "800", color: status.color, background: `${status.color}15`, padding: "3px 10px", borderRadius: "100px", display: "inline-block", marginTop: "4px" }}>
            {status.label}
          </div>
        </div>
      </div>

      {/* List */}
      {filteredList.map(item =>
        mode === "customer"
          ? <CustomerRow key={item._id} customer={item} />
          : <SupplierRow key={item._id} supplier={item} />
      )}

      {filteredList.length === 0 && (
        <div style={{ padding: 40, color: "#999", textAlign: "center" }}>
          {searchQuery ? `No matches for "${searchQuery}"` : `No ${mode}s yet`}
        </div>
      )}

      <AIChat />

      <button onClick={() => navigate(mode === "customer" ? "/add-customer" : "/add-supplier")} style={fabStyle}>
        <span style={{ fontSize: "24px", lineHeight: "0" }}>+</span>
        Add {mode === "customer" ? "Customer" : "Supplier"}
      </button>
      <BottomNav active="home" />
    </div>
  );
}
