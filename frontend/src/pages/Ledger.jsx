import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  MdArrowBack,
  MdHelpOutline,
  MdSouth,
  MdNorth,
  MdCalendarToday,
  MdSms,
  MdWhatsapp,
  MdNoteAdd,
  MdEdit,
  MdImage,
  MdPhotoCamera,
  MdDelete
} from "react-icons/md";

import { getTransactionsByCustomer } from "../db/transactions.db.js";
import { calculateBalance } from "../db/ledger.service.js";
import { getCustomerById, setCustomerDueDate } from "../db/customers.db.js";
import { updateCustomerBalance } from "../db/customers.db.js";


export default function Ledger() {
  const [showBillOptions, setShowBillOptions] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
const [amountInput, setAmountInput] = useState("");

  const [editingNote, setEditingNote] = useState(false);
const [noteText, setNoteText] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    async function loadLedger() {
      const txns = await getTransactionsByCustomer(id);
      const visibleTxns = txns.filter(t => !t.deleted);

      const sorted = visibleTxns.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const cust = await getCustomerById(id);

      const newBalance = calculateBalance(sorted);

setTransactions(sorted);
setBalance(newBalance);
setCustomer(cust);

// 🔑 SAVE BALANCE FOR DASHBOARD USE
await updateCustomerBalance(id, newBalance);

    }

    loadLedger();
  }, [id]);

  async function handleDueDateChange(date) {
    if (!date) return;
    await setCustomerDueDate(id, date);
    const updated = await getCustomerById(id);
    setCustomer(updated);
  }

  const dueDateText = customer?.dueDate
    ? `Due on ${new Date(customer.dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })}`
    : "Set Due Date";

  return (
    <div style={{ paddingBottom: 220 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: 16,
          borderBottom: "1px solid #eee"
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", marginRight: 12 }}
        >
          <MdArrowBack size={22} />
        </button>

        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {customer?.name || "Customer"}
          </div>
          <div style={{ fontSize: 12, color: "#2ecc71" }}>
            View Profile
          </div>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <MdHelpOutline size={20} />
        </div>
      </div>

      {/* WHATSAPP STYLE TRANSACTIONS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 12,
          gap: 8
        }}
      >
        {transactions.map(txn => {
          const isReceived = txn.type === "CREDIT";
          const time = new Date(txn.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div
              key={txn.id}
              onClick={() => setSelectedTxn(txn)}
              style={{
                alignSelf: isReceived ? "flex-start" : "flex-end",
                background: isReceived ? "#ffffff" : "#dcf8c6",
                borderRadius: 12,
                padding: "8px 12px",
                maxWidth: "70%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                cursor: "pointer"
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: isReceived ? "#2e7d32" : "#d32f2f"
                }}
              >
                {isReceived ? "+" : "-"} ₹{txn.amount}
              </div>
              {txn.note && (
  <div
    style={{
      fontSize: 13,
      color: "#000",
      marginTop: 4,
      lineHeight: 1.3
    }}
  >
    {txn.note}
  </div>
)}


              <div
                style={{
                  fontSize: 11,
                  color: "#777",
                  textAlign: "right",
                  marginTop: 2
                }}
              >
                {time}
              </div>
            </div>
          );
        })}
      </div>

      {/* BACKDROP */}
      {selectedTxn && (
        <div
          onClick={() => setSelectedTxn(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1000
          }}
        />
      )}

      {/* TRANSACTION DETAILS BOTTOM SHEET */}
      {selectedTxn && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            paddingBottom: 160,
            zIndex: 1001
          }}
        >
          {/* AMOUNT + EDIT */}
          <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 22,
    fontWeight: 700
  }}
>
  {editingAmount ? (
    <input
      type="number"
      value={amountInput}
      onChange={e => setAmountInput(e.target.value)}
      style={{
        width: 120,
        fontSize: 20,
        textAlign: "center",
        padding: 6,
        borderRadius: 6,
        border: "1px solid #ccc"
      }}
    />
  ) : (
    <span>₹ {selectedTxn.amount}</span>
  )}

  {!editingAmount && (
    <MdEdit
      size={18}
      color="#2ecc71"
      style={{ cursor: "pointer" }}
      onClick={() => {
        setEditingAmount(true);
        setAmountInput(selectedTxn.amount);
      }}
    />
  )}
</div>


{editingAmount && (
  <button
    onClick={async () => {
      const { updateTransactionAmount } = await import(
        "../db/transactions.db.js"
      );

      await updateTransactionAmount(selectedTxn.id, amountInput);

      const updated = transactions.map(t =>
        t.id === selectedTxn.id
          ? { ...t, amount: Number(amountInput) }
          : t
      );

      setTransactions(updated);
      setBalance(calculateBalance(updated));
      setSelectedTxn({
        ...selectedTxn,
        amount: Number(amountInput)
      });

      setEditingAmount(false);
    }}
    style={{
      marginTop: 10,
      width: "100%",
      padding: 10,
      background: "#f4fbf5",
      color: "#010101",
      border: "none",
      borderRadius: 8,
      fontWeight: 600
    }}
  >
    Save Amount
  </button>
)}


          {/* DATE */}
          <div
  style={{
    textAlign: "center",
    fontSize: 15,      // 👈 more readable on mobile
    color: "#000",     // 👈 pure black
    fontWeight: 500,   // 👈 better visibility
    marginTop: 8
  }}
>

            Added on{" "}
            {new Date(selectedTxn.createdAt).toLocaleString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true
})}

          </div>

          {/* ADD NOTE */}
          <div
  onClick={() => {
    setEditingNote(true);
    setNoteText(selectedTxn.note || "");
  }}
  style={{
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    background: "#f4faf6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
    textAlign: "center",
  }}
>
{editingNote && (
  <div style={{ marginTop: 12 }}>
    <textarea
      value={noteText}
      onChange={e => setNoteText(e.target.value)}
      placeholder="Write note…"
      style={{
        width: "100%",
        minHeight: 80,
        padding: 10,
        fontSize: 14,
        borderRadius: 8,
        border: "1px solid #ccc"
      }}
    />

    <button
      onClick={async () => {
        const { updateTransactionNote } = await import(
          "../db/transactions.db.js"
        );

        await updateTransactionNote(selectedTxn.id, noteText);

        const updated = transactions.map(t =>
          t.id === selectedTxn.id ? { ...t, note: noteText } : t
        );

        setTransactions(updated);
        setSelectedTxn({ ...selectedTxn, note: noteText });
        setEditingNote(false);
      }}
      style={{
        marginTop: 8,
        width: "100%",
        padding: 10,
        background: "#2ecc71",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: 600
      }}
    >
      Save Note
    </button>
  </div>
)}

            <MdNoteAdd size={20} color="#2ecc71" />
            <span style={{ color: "#000", fontSize: 14 }}>
  {selectedTxn.note ? "Edit Note" : "Add Note"}
</span>
{selectedTxn.note && !editingNote && (
  <div
    style={{
      marginTop: 8,
      fontSize: 13,
      color: "#000",
      paddingLeft: 44
    }}
  >
    {selectedTxn.note}
  </div>
)}

          </div>


          {/* ADD BILL */}
<div
  onClick={() => setShowBillOptions(!showBillOptions)}
  style={{
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    background: "#f4faf6",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    justifyContent: "center"
  }}
>
 <MdImage size={20} color="#2ecc71" />
  <span style={{ color: "#000", fontSize: 14 }}>
    Add Bills
  </span>
</div>
{showBillOptions && (
  <div
    style={{
      marginTop: 10,
      display: "flex",
      gap: 12,
      justifyContent: "center"
    }}
  >
    {/* CAMERA */}
    <label
  style={{
    padding: "10px 14px",
    borderRadius: 8,
    background: "#e8f5e9",
    color: "#2e7d32",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6
  }}
>
  <MdPhotoCamera size={18} color="#2ecc71" />
  <span style={{ color: "#000" }}>Camera</span>

  <input
    type="file"
    accept="image/*"
    capture="environment"
    style={{ display: "none" }}
    onChange={e => {
      console.log("Camera image:", e.target.files[0]);
      setShowBillOptions(false);
    }}
  />
</label>


    {/* GALLERY */}
   <label
  style={{
    padding: "10px 14px",
    borderRadius: 8,
    background: "#e8f5e9",
    color: "#2e7d32",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6
  }}
>
  <MdImage size={18} color="#2ecc71" />
  <span style={{ color: "#000" }}>Gallery</span>

  <input
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={e => {
      console.log("Gallery image:", e.target.files[0]);
      setShowBillOptions(false);
    }}
  />
</label>
  </div>
)}



          {/* DELETE */}
          <div
  onClick={async () => {
    const { softDeleteTransaction } = await import(
      "../db/transactions.db.js"
    );
    await softDeleteTransaction(selectedTxn.id);

    const updated = transactions.filter(
      t => t.id !== selectedTxn.id
    );

    setTransactions(updated);
    setBalance(calculateBalance(updated));
    setSelectedTxn(null);
  }}
  style={{
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    background: "#f4fbf5",
    color: "#d32f2f",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  }}
>
  <MdDelete size={20} />
  <span>Delete</span>
</div>

        </div>
      )}

      {/* BALANCE + ACTION ROW */}
      <div
  style={{
    position: "fixed",
    bottom: 72,
    left: 0,
    right: 0,
    background: "#fff",
    borderTop: "1px solid #ddd",
    pointerEvents: selectedTxn ? "none" : "auto" // ✅ ADD
  }}
>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 14
          }}
        >
          <div>Balance Due</div>
          <div style={{ fontWeight: 600 }}>
            ₹ {Math.abs(balance)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: 10,
            borderTop: "1px solid #eee"
          }}
        >
          <div
            onClick={() => dateInputRef.current?.showPicker()}
            style={{ display: "flex", gap: 6 }}
          >
            <MdCalendarToday /> {dueDateText}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <MdSms /> SMS
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <MdWhatsapp /> WhatsApp
          </div>
        </div>
      </div>

      <input
        ref={dateInputRef}
        type="date"
        style={{ display: "none" }}
        onChange={e => handleDueDateChange(e.target.value)}
      />

      {/* RECEIVED / GIVEN */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          gap: 12,
          padding: 12,
          background: "#fff",
          borderTop: "1px solid #ddd"
        }}
      >
        <button
          onClick={() => navigate(`/ledger/${id}/add?type=CREDIT`)}
          style={{
            flex: 1,
            padding: 14,
            background: "#e8f5e9",
            color: "#2e7d32",
            border: "none",
            borderRadius: 8,
            fontWeight: 600
          }}
        >
          <MdSouth /> RECEIVED
        </button>

        <button
          onClick={() => navigate(`/ledger/${id}/add?type=DEBIT`)}
          style={{
            flex: 1,
            padding: 14,
            background: "#fff3e0",
            color: "#ef6c00",
            border: "none",
            borderRadius: 8,
            fontWeight: 600
          }}
        >
          <MdNorth /> GIVEN
        </button>
      </div>
    </div>
  );
}
