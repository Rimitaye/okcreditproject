import React from "react";

export default function MoreSheet({ open, onClose }) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 999
        }}
      />

      {/* Bottom Sheet */}
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
          zIndex: 1000
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: "#ccc",
            borderRadius: 4,
            margin: "0 auto 16px"
          }}
        />

        <div style={{ padding: 12 }}>Settings</div>
        <div style={{ padding: 12 }}>Language</div>
        <div style={{ padding: 12 }}>Help</div>
        <div style={{ padding: 12 }}>About</div>
      </div>
    </>
  );
}
