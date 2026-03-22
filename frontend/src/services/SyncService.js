import { db } from "../db/dexie.js";

const API_BASE = "http://localhost:5000/api/sync";

export const SyncService = {
  // 🟢 1. PUSH CUSTOMERS (Existing)
  async pushToCloud(userId) {
    if (!navigator.onLine) return;
    try {
      const pendingCustomers = await db.customers.where("syncStatus").equals("pending").toArray();
      if (pendingCustomers.length === 0) return;

      for (const customer of pendingCustomers) {
        const response = await fetch("http://localhost:5000/api/customers/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...customer, userId })
        });
        if (response.ok) {
          await db.customers.update(customer.id, { syncStatus: "synced" });
        }
      }
    } catch (err) {
      console.error("Customer Push Error:", err);
    }
  },

  // 🔵 2. NEW: PUSH TRANSACTIONS (Offline-First)
  async pushTransactions(userId) {
    if (!navigator.onLine) return;
    try {
      // Look for transactions that haven't been sent to MongoDB yet
      const pendingTxs = await db.transactions.where("synced").equals(0).toArray();
      
      for (const tx of pendingTxs) {
        const response = await fetch("http://localhost:5000/api/transactions/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...tx, userId })
        });

        if (response.ok) {
          // Update local status so it's marked as synced
          await db.transactions.update(tx.id, { synced: 1 });
        }
      }
    } catch (err) {
      console.error("Transaction Push Error:", err);
    }
  },

  // 🟢 3. PULL DATA (Existing)
  async pullFromCloud(userId) {
    try {
      const response = await fetch(`${API_BASE}/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json(); 
      return data.customers || []; 
    } catch (err) {
      console.error("Sync Pull Error:", err);
      return []; 
    }
  }

  
};