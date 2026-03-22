import React from "react";
import { useNavigate } from "react-router-dom";
import { MdCalendarToday } from "react-icons/md";

export default function CustomerRow({ customer }) {
  const navigate = useNavigate();

  // 1. Core Variables
  const balance = customer.balance || 0;
  const hasDueDate = !!customer.dueDate;
  
  // 2. Focus on MongoDB ID for Cloud Logic
  const targetId = customer._id || customer.id;
  return (
    <div
      onClick={() => navigate(`/ledger/${targetId}`)} 
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 12px",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
        background: "#fff"
      }}
    >
      {/* LEFT SIDE (Avatar + Name & Date) */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        
        {/* 🟢 Rounded Avatar */}
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "#e8f0fe",
          color: "#1a73e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "bold",
          textTransform: "uppercase"
        }}>
          {customer.name ? customer.name.charAt(0) : "C"}
        </div>

        <div>
          <div style={{ fontWeight: "600", fontSize: 16, color: "#333" }}>
            {customer.name}
          </div>

          {hasDueDate ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#2e7d32",
                marginTop: 4
              }}
            >
              <MdCalendarToday size={14} />
              Collect on{" "}
              {new Date(customer.dueDate).toLocaleDateString("en-GB")}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
              Account added
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE (Amount & Due Label) */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            // 🔴 Red if Ledger Balance > 0, 🟢 Green if < 0
            color: balance > 0 ? "#e74c3c" : "#2ecc71" 
          }}
        >
          ₹ {Math.abs(balance)}
        </div>

        <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
          {/* 🟢 Added Specific Request: Show "Advance Balance" if balance is negative */}
          {balance < 0 ? "Advance Balance" : "Balance Due"}
        </div>
      </div>
    </div>
  );
}