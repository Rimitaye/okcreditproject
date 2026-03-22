import React, { useState, useEffect } from "react";
import { MdCloudDone, MdCloudOff, MdSync } from "react-icons/md";

export default function SyncStatus({ isSyncing }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(localStorage.getItem("last_sync_time"));

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    // Refresh last sync time every few seconds if a sync just happened
    const interval = setInterval(() => {
      setLastSync(localStorage.getItem("last_sync_time"));
    }, 3000);

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px",
      borderRadius: 20,
      fontSize: 12,
      background: isOnline ? "#e8f5e9" : "#ffebee",
      color: isOnline ? "#2e7d32" : "#c62828",
      width: "fit-content",
      margin: "0 auto 10px auto"
    }}>
      {isSyncing ? (
        <MdSync className="spin" size={16} />
      ) : isOnline ? (
        <MdCloudDone size={16} />
      ) : (
        <MdCloudOff size={16} />
      )}
      
      <span>
        {isSyncing ? "Syncing..." : isOnline ? 
          (lastSync ? `Last synced: ${new Date(lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "Online (Not synced)") 
          : "Offline - Working Locally"}
      </span>

      <style>{`
        .spin { animation: rotation 2s infinite linear; }
        @keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(359deg); } }
      `}</style>
    </div>
  );
}