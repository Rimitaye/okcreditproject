import React, { useEffect, useState,useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  MdCalendarToday, 
  MdSearch, 
  MdMoreVert, 
  MdMessage, 
  MdNotificationsActive 
} from "react-icons/md";
import { FaWhatsapp, FaFilePdf } from "react-icons/fa";


export default function CustomerDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const scrollRef = useRef(null);
const dateInputRef = useRef(null);
  useEffect(() => {
    fetchData();
  }, [id]);
  useEffect(() => {
    if (scrollRef.current && transactions.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactions]);

 const fetchData = async () => {
    try {
      const custRes = await axios.get(`https://okcreditproject.onrender.com/api/customers/${id}`);
      setCustomer(custRes.data);

      // 🟢 THE "STAY" LOGIC: Pull the date from the data you just showed me
      if (custRes.data && custRes.data.dueDate) {
        setDueDate(custRes.data.dueDate);
      } else {
        setDueDate(null); // Clear if no date exists
      }

      const transRes = await axios.get(`https://okcreditproject.onrender.com/api/transactions/${id}`);
      setTransactions(transRes.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };
  const handleAddTransaction = (type) => {
    const queryType = type === "got" ? "CREDIT" : "DEBIT";
    navigate(`/ledger/${id}/add?type=${queryType}`);
  };

  if (!customer) return <p style={{ padding: 20 }}>Loading...</p>;
  // This calculates the total balance every time the 'transactions' list changes
const totalBalance = transactions.reduce((acc, t) => {
  const amount = Number(t.amount);
  // If 'gave' (DEBIT), add to balance; if 'got' (CREDIT), subtract from balance
  return t.type === 'DEBIT' || t.type === 'gave' ? acc + amount : acc - amount;
}, 0);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 100 }}>
      
      {/* 🟢 FIXED TOP SECTION: This stays at the top while you scroll */}
      {/* 🟢 FIXED TOP SECTION */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 1000, 
        background: "#fff", 
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)" 
      }}>
        {/* --- TOP NAV (Updated for Profile Link) --- */}
        <div style={{ padding: "10px 15px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Back Button */}
            <button onClick={() => navigate(-1)} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer" }}>←</button>
            
            {/* Name + View Profile Group */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "bold", fontSize: 18, lineHeight: "1.2" }}>{customer.name}</span>
              
              {/* 🟢 CLICKABLE PROFILE LINK */}
              <span 
                onClick={() => navigate(`/customer/${id}/profile`)}
                style={{ 
                  fontSize: "11px", 
                  color: "#76ce77df", 
                  fontWeight: "700", 
                  cursor: "pointer", 
                  marginTop: "2px",
                  letterSpacing: "0.5px"
                }}
              >
                VIEW PROFILE ›
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, color: "#555" }}>
            <MdSearch size={24} />
            <MdMoreVert size={24} />
          </div>
        </div>
      </div>
        
        

    

      
      {/* 1. SCROLLABLE BUBBLES AREA */}
  
<div style={{ padding: "15px 15px 220px 15px" }}>
  {(() => {
    let runningBalance = 0; // Start at zero

    // 1. Sort by date so the math follows the timeline
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
    );

    return sortedTransactions.map((t) => {
      const isGave = t.type === "DEBIT" || t.type === "gave";
      
      // 2. 🟢 THE MATH LOGIC:
      // If 'Gave', we add to the debt. If 'Got', we subtract.
      if (isGave) {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }

      return (
        <div 
          key={t._id} 
          onClick={() => navigate(`/transaction/${t._id}`)}
          style={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: isGave ? "flex-end" : "flex-start", 
            marginBottom: 20 
          }}
        >
          {/* THE BUBBLE */}
          <div style={{ 
            padding: "12px 16px", 
            borderRadius: "15px",
            background: isGave ? "#fff0f0" : "#f0fff4",
            border: `1px solid ${isGave ? "#ffcccc" : "#ccffdd"}`,
            maxWidth: "75%",
            position: "relative"
          }}>
            <div style={{ 
              fontWeight: "bold", 
              fontSize: 18, 
              color: isGave ? "#d63031" : "#27ae60" 
            }}>
              ₹{t.amount}
            </div>
            
            {t.description && <div style={{ fontSize: 13, color: "#555" }}>{t.description}</div>}
            
            <div style={{ fontSize: 10, color: "#999", marginTop: 4, textAlign: "right" }}>
              {new Date(t.date || t.createdAt).toLocaleDateString("en-IN")}
            </div>
          </div>

          {/* 3. 🟢 THE CUMULATIVE BALANCE LABEL */}
          <div style={{ 
            fontSize: "11px", 
            color: "#888", 
            marginTop: "4px",
            fontWeight: "500"
          }}>
            Balance: ₹{Math.abs(runningBalance)} {runningBalance >= 0 ? "Due" : "Advance"}
          </div>
        </div>
      );
    });
  })()}
  <div ref={scrollRef} style={{ height: "1px" }} />
</div>
 
      
      {/* 2. FIXED BOTTOM SECTION (Balance + Icons + Buttons) */}
      <div style={{ 
        position: "fixed", 
        bottom: 0, 
        width: "100%", 
        background: "#fff", 
        borderTop: "1px solid #eee",
        zIndex: 100,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)"
        
      }}>
        
        {/* Balance Row */}
        <div style={{ 
          padding: "10px 20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <span style={{ fontSize: 17, fontWeight: "600", color: "#000000" }}>
  {totalBalance >= 0 ? "Balance Due" : "Advance Balance"}
</span>
<span style={{ 
  fontSize: 22, 
  fontWeight: "bold", 
  color: totalBalance >= 0 ? "#e74c3c" : "#2ecc71" 
}}>
  ₹{Math.abs(totalBalance)}
</span>
        </div>

        {/* Icons Row */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "5px 20px 10px",position: "relative" }}>
          
        
        {/* 🟢 FREEZE-PROOF CALENDAR */}
{/* 🟢 SAFE CALENDAR SECTION */}
<div 
  onClick={() => dateInputRef.current.showPicker()} 
  style={{ textAlign: "center", cursor: "pointer", width: "70px", position: "relative" }}
>
  <div style={{ background: "#e3f2fd", padding: 8, borderRadius: "50%", color: "#1976d2", marginBottom: 2, display: "flex", justifyContent: "center" }}>
    <MdCalendarToday size={20} />
  </div>
 <span style={{ fontSize: "10px", fontWeight: "700", color: dueDate ? "#d63031" : "#333" }}>
  {!dueDate ? "Calendar" : `Due on ${new Date(dueDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}`}
</span>

  <input 
    ref={dateInputRef} // 🟢 Connects the Ref
    type="date" 
    value={dueDate || ""} 
    onChange={(e) => {
      const val = e.target.value;
      if (!val) return;
      setDueDate(val);
      axios.put(`https://okcreditproject.onrender.com/api/customers/${id}`, { dueDate: val });
    }} 
    style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} 
  />
</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#f5f5f5", padding: 8, borderRadius: "50%", color: "#555", marginBottom: 2 }}>
              <MdMessage size={20} />
            </div>
            <span style={{ fontSize: 12, fontWeight: "600", color: "#333" }}>SMS</span>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#e8f5e9", padding: 8, borderRadius: "50%", color: "#25D366", marginBottom: 2 }}>
              <FaWhatsapp size={20} />
            </div>
            <span style={{ fontSize: 12, fontWeight: "600",color: "#333" }}>WhatsApp</span>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div style={{ display: "flex", background: "#fff", padding: "10px", gap: "10px" }}>
          {/* YOU GOT Button -> Should be Green and go to Credit form */}
          <button 
            onClick={() => navigate(`/ledger/${id}/add?type=CREDIT`)} 
            style={{ flex: 1, padding: 15, background: "#2ecc71", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold" }}
          >
            YOU GOT ₹
          </button>

          {/* YOU GAVE Button -> Should be Red/Orange and go to Debit form */}
          <button 
            onClick={() => navigate(`/ledger/${id}/add?type=DEBIT`)} 
            style={{ flex: 1, padding: 15, background: "#e74c3c", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold" }}
          >
            YOU GAVE ₹
          </button>
        </div>
      </div>
    </div>
  );
}