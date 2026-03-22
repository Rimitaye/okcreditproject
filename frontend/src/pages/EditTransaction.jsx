import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdArrowBack, MdSave } from "react-icons/md";

export  function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("DEBIT"); // Default to 'Gave'

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/transactions/detail/${id}`);
        setAmount(res.data.amount);
        setType(res.data.type);
      } catch (err) {
        console.error("Error fetching transaction", err);
      }
    };
    fetchTransaction();
  }, [id]);

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/transactions/${id}`, {
        amount: Number(amount),
        type: type,
      });
      navigate(-1); // Go back to details page
    } catch (err) {
      alert("Failed to update transaction");
    }
  };
  const isGave = type === "DEBIT" || type === "gave";
  const themeColor = isGave ? "#d63031" : "#2cba64";

return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ background: "#fff", padding: "18px 15px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        <button onClick={() => navigate(-1)} style={{ border: "none", background: "#f0f0f0", borderRadius: "50%", padding: "8px", display: "flex" }}>
          <MdArrowBack size={22} color="#333" />
        </button>
        <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>Edit Amount</h3>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* DYNAMIC COLORED CARD */}
        <div style={{ 
          background: "#fff", 
          padding: "40px 20px", 
          borderRadius: "16px", 
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", 
          textAlign: 'center',
          borderTop: `5px solid ${themeColor}` // 🟢 Visual cue at the top of the card
        }}>
          <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "15px", fontWeight: '600', textTransform: "uppercase" }}>
            {isGave ? "Editing 'You Gave' Amount" : "Editing 'You Got' Amount"}
          </label>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {/* 🟢 Symbol matches the type color */}
            <span style={{ fontSize: '28px', fontWeight: '700', color: themeColor }}>₹</span> 
            
            <input 
              type="number" 
              value={amount} 
              autoFocus
              onFocus={(e) => e.target.select()}
              onChange={(e) => setAmount(e.target.value)}
              style={{ 
                width: "160px", 
                fontSize: "36px", 
                fontWeight: "700", 
                border: "none", 
                borderBottom: `3px solid ${themeColor}`, // 🟢 Underline matches the type color
                outline: "none", 
                padding: "5px 0",
                color: themeColor, // 🟢 Text color matches the type color
                textAlign: 'center',
                backgroundColor: "transparent"
              }}
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button 
          onClick={handleSave}
          style={{ 
            width: "100%", 
            marginTop: "35px", 
            padding: "18px", 
            borderRadius: "12px", 
            border: "none", 
            background: "rgb(238, 246, 241)", // 🟢 Professional Green
            color: "#7ee783", 
            fontWeight: "700", 
            fontSize: "16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "12px",
            boxShadow: '0 8px 20px rgba(133, 137, 135, 0.07)',
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <MdSave size={22} /> SAVE CHANGES
        </button>

        <p style={{ textAlign: "center", color: "#999", fontSize: "12px", marginTop: "20px" }}>
          Changes will reflect in the total balance immediately.
        </p>
      </div>
    </div>
  );
}
export default EditTransaction;