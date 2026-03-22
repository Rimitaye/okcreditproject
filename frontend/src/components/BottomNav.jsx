import { MdHome, MdList, MdExpandLess } from "react-icons/md";
import React, { useState } from "react";
import MoreSheet from "./MoreSheet.jsx";

export default function BottomNav({ active = "home" }) {
  const [openMore, setOpenMore] = useState(false);

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: "#fff",
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 1000
        }}
      >
        {/* Home */}
        <div
          style={{
            textAlign: "center",
            color: active === "home" ? "#2ecc71" : "#555",
            fontWeight: active === "home" ? 600 : 400
          }}
        >
          <MdHome size={22} />
          <div style={{ fontSize: 12 }}>Home</div>
        </div>

        {/* My Plan */}
        <div
          style={{
            textAlign: "center",
            color: active === "plan" ? "#2ecc71" : "#555",
            fontWeight: active === "plan" ? 600 : 400
          }}
        >
          <MdList size={22} />
          <div style={{ fontSize: 12 }}>My Plan</div>
        </div>

        {/* More */}
        <div
          onClick={() => setOpenMore(true)}
          style={{
            textAlign: "center",
            color: "#555",
            cursor: "pointer"
          }}
        >
          <MdExpandLess size={22} />
          <div style={{ fontSize: 12 }}>More</div>
        </div>
      </div>

      <MoreSheet open={openMore} onClose={() => setOpenMore(false)} />
    </>
  );
}
