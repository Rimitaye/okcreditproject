import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { 
  MdArrowBack, 
  MdArrowDownward, 
  MdArrowUpward, 
  MdFileDownload, 
} from "react-icons/md";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Reports({ transactions = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filterType, setFilterType] = useState("all");


// 1. Get the Mode from the Dashboard (e.g., "customer")
const reportMode = (location.state?.mode || "customer").toLowerCase();
console.log("Current Page Mode:", reportMode);
console.log("First Item Type in List:", transactions[0]?.type);

// Inside Reports.jsx
const filteredData = useMemo(() => {
  if (!transactions || transactions.length === 0) return [];

  const currentMode = (location.state?.mode || "customer").toLowerCase();

  return transactions.filter(tx => {
    // 🟢 THE FIX: 
    // 1. Get the type, or default to "customer" if it's missing
    // 2. Make sure it's lowercase to match the 'currentMode'
    const itemType = (tx.type || "customer").toLowerCase();
    
    return itemType === currentMode;
  });
}, [transactions, location.state]);

// 3. The Math (Sum of A + B + C logic as you requested)
const totals = useMemo(() => {
  return filteredData.reduce((acc, tx) => {
    const bal = Number(tx.balance || 0);
    acc.net += bal; // Direct Sum: Net Balance = A + B + C...

    if (bal < 0) {
      acc.advances += Math.abs(bal); // Negative is ADVANCE (You Owe)
      acc.pCount += 1;
    } else if (bal > 0) {
      acc.dues += bal;               // Positive is DUE (They Owe)
      acc.cCount += 1;
    }
    return acc;
  }, { advances: 0, dues: 0, net: 0, pCount: 0, cCount: 0 });
}, [filteredData]);

const netBalance = totals.net;
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Business Financial Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Report Type: ${filterType.toUpperCase()}`, 14, 30);
    // Dynamic labeling for PDF
    const status = netBalance > 0 ? 'ADVANCE' : netBalance < 0 ? 'DUE' : 'SETTLED';
    doc.text(`Net Balance: RS. ${Math.abs(netBalance)} (${status})`, 14, 35);

    const tableRows = filteredData.map(tx => [
      tx.name,
      (tx.type || "customer").toUpperCase(),
      `Rs. ${Math.abs(tx.balance || tx.amount || 0)}`, 
      new Date(tx.date || tx.updatedAt).toLocaleDateString()
    ]);

    doc.autoTable({
      head: [['Name', 'Type', 'Amount/Balance', 'Date']],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [26, 115, 232] }
    });

    doc.save(`Report_${filterType}.pdf`);
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", paddingBottom: "40px" }}>
      <div style={headerStyle}>
        <MdArrowBack size={24} onClick={() => navigate(-1)} style={{ cursor: "pointer" }} />
        <span style={{ fontWeight: "700", fontSize: "18px" }}>{reportMode.toUpperCase()} Report</span>
        <MdFileDownload size={24} onClick={handleDownload} style={{ cursor: "pointer", color: "#1a73e8" }} />
      </div>

      <div style={tabContainerStyle}>
        {["all", "week", "month"].map((t) => (
          <button 
            key={t}
            onClick={() => setFilterType(t)}
            style={t === filterType ? activeTabStyle : tabStyle}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
<div style={cardStyle}>
  <div style={{ textAlign: "center", padding: "10px 0" }}>
    <div style={{ fontSize: "12px", color: "#666", textTransform: "uppercase" }}>Net Balance</div>
    
    {/* 1. Safe Net Balance Display */}
    <h1 style={{ 
      fontSize: "32px", 
      margin: "8px 0", 
      color: netBalance > 0 ? "#2ecc71" : netBalance < 0 ? "#e74c3c" : "#95a5a6" 
    }}>
      ₹{(netBalance || 0).toLocaleString('en-IN')}
    </h1>
    
    <div style={{ fontWeight: "bold", color: netBalance > 0 ? "#2ecc71" : netBalance < 0 ? "#e74c3c" : "#95a5a6" }}>
      {netBalance > 0 ? "ADVANCE (YOU OWE)" : netBalance < 0 ? "DUE (YOU GET)" : "SETTLED"}
    </div>
  </div>

  <div style={{ display: "flex", borderTop: "1px solid #eee", marginTop: "20px", paddingTop: "15px" }}>
    {/* 2. Safe Advances Box */}
    <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #eee" }}>
      <div style={{ color: "#2ecc71", fontSize: "11px", fontWeight: "bold" }}>
        {totals?.pCount || 0} ADVANCES
      </div>
      <div style={{ fontSize: "18px", fontWeight: "700" }}>
        ₹{(totals?.advances || 0).toLocaleString('en-IN')}
      </div>
    </div>

    {/* 3. Safe Dues Box */}
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ color: "#e74c3c", fontSize: "11px", fontWeight: "bold" }}>
        {totals?.cCount || 0} DUES
      </div>
      <div style={{ fontSize: "18px", fontWeight: "700" }}>
        ₹{(totals?.dues || 0).toLocaleString('en-IN')}
      </div>
    </div>
  </div>
</div>

     <div style={{ padding: "0 16px", display: "flex", flexDirection: "column" }}>
  <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "20px", textAlign: "center" }}>
    — Recent Transactions —
  </h3>

  {filteredData.length > 0 ? (
    filteredData.map((tx) => {
      // Keep your existing logic for balance/amount and direction
      const val = Number(tx.balance || tx.amount) || 0;
      const isAdvance = val < 0; 

      // 🟢 MODIFICATION: Robust date parsing to prevent "Invalid Date"
      const rawDate = tx.date || tx.updatedAt || tx.createdAt;
      const formattedDate = rawDate 
        ? new Date(rawDate).toLocaleDateString("en-GB") 
        : "No Date";

      return (
        <div 
          key={tx._id} 
          style={isAdvance ? leftBubble : rightBubble}
        >
          {/* 🟢 Name Entry */}
          <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>
            {tx.name || "Unknown"}
          </div>

          {/* 🟢 Amount with Direction */}
          <div style={{ fontSize: "20px", fontWeight: "900" }}>
            {isAdvance ? "↙" : "↗"} ₹{Math.abs(val).toLocaleString('en-IN')}
          </div>

        <div style={{ fontSize: "10px", marginTop: "6px", opacity: 0.8 }}>
      {(() => {
        // 1. Check every possible field name for the date
        const rawDate = tx.date || tx.createdAt || tx.updatedAt || tx.entryDate;
        
        // 2. If no date exists at all, show "Recent"
        if (!rawDate) return "Recent Entry";

        // 3. Convert to a real date object and format it
        const d = new Date(rawDate);
        return isNaN(d.getTime()) 
          ? "Recent" 
          : d.toLocaleDateString("en-GB"); // Results in DD/MM/YYYY
      })()}
    </div>
        </div>
      );
    })
  ) : (
    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
      No transactions found for this period.
    </div>
  )}
</div>
    </div>
  );
}

// --- Styles stay exactly the same ---
const headerStyle = { padding: "16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.03)", };
const tabContainerStyle = { display: "flex", margin: "16px", background: "#e9ecef", borderRadius: "12px", padding: "4px",position: "sticky", 
  top: "60px", 
  zIndex: 90 };
const tabStyle = { flex: 1, padding: "8px", border: "none", borderRadius: "10px", background: "transparent", color: "#666", cursor: "pointer", transition: "0.3s" };
const activeTabStyle = { ...tabStyle, background: "#fff", color: "#1a73e8", fontWeight: "bold", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" };
const cardStyle = { margin: "0 16px 24px 16px", padding: "20px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)",position: "sticky", 
  top: "70px", // Adjust based on your header height
  zIndex: 5 };
const leftBubble = { alignSelf: "flex-start", background: "#e8f5e9", color: "#2e7d32", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", marginBottom: "12px", maxWidth: "80%", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #c8e6c9" };
const rightBubble = { alignSelf: "flex-end", background: "#ffebee", color: "#c62828", padding: "12px 16px", borderRadius: "18px 18px 4px 18px", marginBottom: "12px", maxWidth: "80%", textAlign: "right", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #ffcdd2" };