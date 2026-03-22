import React from "react";
import { useNavigate } from "react-router-dom";
import { MdCalendarToday } from "react-icons/md";

export default function SupplierRow({ supplier }) {
  const navigate = useNavigate();

  // 1. Core Variables
  const balance = supplier.balance || 0;
  const hasDueDate = !!supplier.dueDate;
  
  // 2. Focus on MongoDB ID for Cloud Logic
  const targetId = supplier._id || supplier.id;

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
      {/* LEFT SIDE (Avatar + Supplier Info) */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        
        {/* 🟢 Rounded Avatar */}
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "#e6fffa", // Supplier theme (greenish)
          color: "#2ecc71",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "bold",
          textTransform: "uppercase"
        }}>
          {supplier.name ? supplier.name.charAt(0) : "S"}
        </div>

        <div>
          <div style={{ fontWeight: "600", fontSize: 16, color: "#333" }}>
            {supplier.name}
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
              Pay on{" "}
              {new Date(supplier.dueDate).toLocaleDateString("en-GB")}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
              Supplier added
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE (Mirroring the Ledger Balance Due) */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: balance > 0 ? "#e74c3c" : "#2ecc71" 
          }}
        >
          ₹ {Math.abs(balance)}
        </div>

        <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
          Balance Due
        </div>
      </div>
    </div>
  );
}