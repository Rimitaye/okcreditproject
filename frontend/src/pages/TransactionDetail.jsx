import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdDelete, MdEdit, MdArrowBack, MdEvent, MdDescription, MdPhotoLibrary, MdCheck,MdCameraAlt,MdCalendarToday } from "react-icons/md";

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/transactions/detail/${id}`);
        setTransaction(res.data);
        setNote(res.data.description || "");
      } catch (err) {
        console.error("Error fetching transaction", err);
      }
    };
    fetchTransaction();
  }, [id]);
  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTransaction({ ...transaction, image: reader.result });
      axios.put(`http://localhost:5000/api/transactions/${id}`, { image: reader.result });
      setShowOptions(false); // Hide the options after picking
    };
    reader.readAsDataURL(file);
  }
};

  const handleUpdateNote = async () => {
    try {
      await axios.put(`http://localhost:5000/api/transactions/${id}`, { description: note });
      setIsEditingNote(false);
      // Optional: show a success toast
    } catch (err) {
      alert("Failed to update note");
    }
  };

  if (!transaction) return <div style={{ padding: 20 }}>Loading...</div>;
  const isGave = transaction.type === "DEBIT" || transaction.type === "gave";

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ background: "#fff", padding: "15px", display: "flex", alignItems: "center", gap: "15px", borderBottom: "1px solid #eee" }}>
        <button onClick={() => navigate(-1)} style={{ border: "none", background: "none" }}><MdArrowBack size={24} /></button>
        <h3 style={{ margin: 0 }}>Transaction Details</h3>
      </div>

      {/* AMOUNT SECTION WITH EDIT ICON NEARBY */}
      <div style={{ margin: "20px", background: "#fff", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <h1 style={{ margin: 0, color: isGave ? "#d63031" : "#27ae60", fontSize: "40px" }}>
            ₹{transaction.amount}
          </h1>
          <button 
            onClick={() => navigate(`/transaction/edit/${id}`)}
            style={{ border: "none", background: "#f0f0f0", padding: "8px", borderRadius: "50%", display: "flex", cursor: "pointer" }}
          >
            <MdEdit size={20} color="#666" />
          </button>
        </div>
        <p style={{ color: "#666", fontWeight: "bold", marginTop: "5px" }}>{isGave ? "YOU GAVE" : "YOU GOT"}</p>
      </div>

      {/* EDITABLE NOTES SECTION */}
      <div style={{ margin: "20px", background: "#fff", borderRadius: "12px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#888" }}>
            <MdDescription size={20} /> <span style={{ fontSize: "14px" }}>Notes & Description</span>
          </div>
          {!isEditingNote ? (
            <button onClick={() => setIsEditingNote(true)} style={{ border: "none", background: "none", color: "#27ae60", fontWeight: "bold" }}>EDIT</button>
          ) : (
            <button onClick={handleUpdateNote} style={{ border: "none", background: "none", color: "#27ae60", fontWeight: "bold" }}>SAVE</button>
          )}
        </div>

        {isEditingNote ? (
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontFamily: "inherit" }}
            rows="3"
          />
        ) : (
          <p style={{ margin: 0, fontWeight: "500", color: note ? "#333" : "#bbb" }}>{note || "Add a note..."}</p>
        )}
      </div>
      {/* --- BILLS SECTION --- */}
<div style={{ margin: "15px", background: "#fff", borderRadius: "12px", padding: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#333", marginBottom: "15px" }}>
    <MdPhotoLibrary size={20} /> 
    <span style={{ fontSize: "14px", fontWeight: "600" }}>Bills & Attachments</span>
  </div>

  {transaction?.image ? (
    <div style={{ position: "relative", width: "120px" }}>
      <img 
        src={transaction.image} 
        alt="Bill" 
        onClick={() => setShowZoom(true)}
        style={{ width: "100%", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer" }} 
      />
      <button 
        onClick={() => setTransaction({...transaction, image: null})}
        style={{ position: "absolute", top: -8, right: -8, background: "#d63031", color: "#fff", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer" }}
      >
        ×
      </button>
    </div>
  ) : (
    <div>
      {!showOptions ? (
        // INITIAL BUTTON
        <button 
          onClick={() => setShowOptions(true)}
          style={{ width: "100%", padding: "15px", border: "1px dashed #ceeddf", borderRadius: "10px", color: "#73dcad", background: "none", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          <MdPhotoLibrary size={22} /> Add Bill Snap
        </button>
      ) : (
        // CAMERA & GALLERY OPTIONS
        <div style={{ display: "flex", gap: "10px" }}>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "15px", background: "#f0f7ff", borderRadius: "10px", cursor: "pointer", color: "#73dcad", border: "1px solid #ceeddf" }}>
            <MdCameraAlt size={24} />
            <span style={{ fontSize: "12px", fontWeight: "bold", marginTop: "5px" }}>Camera</span>
            <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleImageUpload(e)} />
          </label>
          
          <label style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "15px", background: "#f0f7ff", borderRadius: "10px", cursor: "pointer", color: "#73dcad", border: "1px solid #ceeddf" }}>
            <MdPhotoLibrary size={24} />
            <span style={{ fontSize: "12px", fontWeight: "bold", marginTop: "5px" }}>Gallery</span>
            <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e)} />
          </label>
        </div>
      )}
    </div>
  )}
</div>
{/* --- 5. TRANSACTION DATE SECTION --- */}
      <div style={{ 
        margin: "15px", 
        background: "#fff", 
        borderRadius: "12px", 
        padding: "15px", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <MdCalendarToday size={20} color="#888" />
        <div>
          <div style={{ fontSize: "12px", color: "#888" }}>Transaction Date</div>
          <div style={{ fontSize: "15px", fontWeight: "500", color: "#333" }}>
            {new Date(transaction.date || transaction.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        </div>
      </div>

      {/* --- 6. DELETE BUTTON --- */}
      <div style={{ padding: "10px 15px 40px 15px" }}>
        <button 
          onClick={async () => {
            if(window.confirm("Are you sure you want to delete this transaction?")) {
              try {
                await axios.delete(`http://localhost:5000/api/transactions/${id}`);
                navigate(-1); // Goes back to the ledger automatically
              } catch (err) {
                alert("Could not delete. Try again.");
              }
            }
          }}
          style={{ 
            width: "100%", 
            padding: "15px", 
            borderRadius: "10px", 
            border: "1px solid #f7eded", 
            background: "#fff", 
            color: "#d91b02", 
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer"
          }}
        >
          <MdDelete size={20} /> DELETE
        </button>
      </div>
    </div>
    
    
  );
  
}