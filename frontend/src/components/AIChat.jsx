import React, { useState, useRef, useEffect } from "react";
import { MdChat, MdClose, MdSend, MdSmartToy } from "react-icons/md";

// 🟢 Sub-component for the Typewriter Effect
const TypewriterText = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); // Reset text when new response comes
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    { role: "ai", text: "Hi! I'm your Ledger Assistant. Ask me anything about your balances or transactions." }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    setChatLog((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: message, 
          userId: localStorage.getItem("userId") 
        })
      });
      const data = await res.json();
      setChatLog((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      setChatLog((prev) => [...prev, { role: "ai", text: "Connection error. Please check your backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 2000 }}>
      {isOpen ? (
        <div style={chatWindowStyle}>
          <div style={chatHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MdSmartToy size={20} />
              <span style={{ fontWeight: "600" }}>AI Assistant</span>
            </div>
            <MdClose onClick={() => setIsOpen(false)} style={{ cursor: "pointer" }} />
          </div>

          <div style={messageAreaStyle} ref={scrollRef}>
            {chatLog.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", margin: "12px 0" }}>
                <div style={msg.role === "user" ? userMsgStyle : aiMsgStyle}>
                  {/* 🟢 Apply typewriter only to the LATEST AI message */}
                  {msg.role === "ai" && i === chatLog.length - 1 ? (
                    <TypewriterText text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>Calculating...</div>}
          </div>

          <div style={inputAreaStyle}>
            <input 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me something..." 
              style={inputStyle} 
            />
            <MdSend onClick={handleSend} color={message ? "#1a73e8" : "#ccc"} style={{ cursor: "pointer" }} size={24} />
          </div>
        </div>
      ) : (
        <div onClick={() => setIsOpen(true)} style={fabStyle}>
          <MdChat size={28} />
        </div>
      )}
    </div>
  );
}

// (Keep the same Styles from the previous message)
const chatWindowStyle = { width: "320px", height: "450px", background: "#fff", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" };
const chatHeaderStyle = { background: "#1a73e8", color: "#fff", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const messageAreaStyle = { flex: 1, overflowY: "auto", padding: "16px", background: "#f8f9fa" };
const userMsgStyle = { background: "#1a73e8", color: "#fff", padding: "10px 14px", borderRadius: "15px 15px 0 15px", display: "inline-block", maxWidth: "80%", fontSize: "14px" };
const aiMsgStyle = { background: "#fff", color: "#333", padding: "10px 14px", borderRadius: "15px 15px 15px 0", display: "inline-block", maxWidth: "80%", fontSize: "14px", border: "1px solid #eee" };
const inputAreaStyle = { display: "flex", padding: "12px", borderTop: "1px solid #eee", alignItems: "center", gap: "8px" };
const inputStyle = { flex: 1, border: "none", outline: "none", fontSize: "14px" };
const fabStyle = { width: "60px", height: "60px", background: "#1a73e8", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", transition: "0.3s" };