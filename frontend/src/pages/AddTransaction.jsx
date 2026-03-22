import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import axios from "axios"; // Ensure axios is installed
import { db } from "../db/dexie.js"; 
import { SyncService } from "../services/SyncService.js";

export default function AddTransaction() {
  const navigate = useNavigate();
  const { id } = useParams(); // Customer ID
  console.log("Checking ID from URL:", id);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // CREDIT (Got) or DEBIT (Gave)

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const userId = localStorage.getItem("userId");
  console.log("Current UserID being sent:", userId);

  async function handleSave() {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

  // 1. Prepare data (Mapping UI types to DB types)
    const dbType = (type === "CREDIT") ? "got" : "gave";
    const newTx = {
      customerId: id,
      userId: userId,
      amount: Number(amount),
      type: dbType,
      description: note || "",
      date: new Date().toISOString(),
      synced: 0 // 🔴 0 = Offline/Pending
    };

    try {
      // 2. Save to Dexie immediately (Works even if internet is dead)
      await db.transactions.add(newTx);

      // 3. Trigger background sync to MongoDB (Non-blocking)
      SyncService.pushTransactions(userId);

      // 4. Close page instantly
      navigate(-1);
    } catch (err) {
      console.error("Local Save Error:", err);
      alert("Failed to save transaction locally.");
    }
  }
  return (
    <div style={{ padding: 16, background: "#fff", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", marginRight: 12 }}>
          <MdArrowBack size={24} color="#333" />
        </button>
        <h2 style={{ margin: 0 }}>{type === "CREDIT" ? "Payment Received" : "Credit Given"}</h2>
      </div>

      {/* AMOUNT INPUT */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, color: "#666" }}>Amount</label>
        <input
          type="number"
          placeholder="₹ 0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{
            width: "100%", padding: "12px 0", fontSize: 32, fontWeight: "bold",
            border: "none", borderBottom: "2px solid #eee", outline: "none", color: type === "CREDIT" ? "#2ecc71" : "#e67e22"
          }}
        />
      </div>

      {/* NOTE INPUT */}
      <div style={{ marginBottom: 30 }}>
        <label style={{ fontSize: 14, color: "#666" }}>Note / Description</label>
        <input
          placeholder="Enter details (e.g. Bill No, Item name)"
          value={note}
          onChange={e => setNote(e.target.value)}
          style={{ width: "100%", padding: "12px 0", fontSize: 16, border: "none", borderBottom: "1px solid #eee", outline: "none" }}
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        disabled={!amount}
        style={{
          width: "100%", padding: 16, borderRadius: 8, border: "none", fontSize: 18, fontWeight: "bold",
          background: type === "CREDIT" ? "#2ecc71" : "#e67e22", color: "#fff", cursor: amount ? "pointer" : "not-allowed",
          opacity: amount ? 1 : 0.6
        }}
      >
        SAVE
      </button>
    </div>
  );
}