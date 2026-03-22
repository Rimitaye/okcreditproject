
import { db } from "./dexie.js";
/* ===============================
   GET TRANSACTIONS BY CUSTOMER
================================ */
export async function getTransactionsByCustomer(customerId) {
  const db = await openDB();
  const tx = db.transaction("transactions", "readonly");
  const store = tx.objectStore("transactions");
  const index = store.index("customerId");

  return new Promise((resolve, reject) => {
    const req = index.getAll(customerId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/* ===============================
   ADD TRANSACTION (OFFLINE)
================================ */
export async function addTransactionOffline(transaction) {
  const db = await openDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");

  const record = {
    id: crypto.randomUUID(),
    ...transaction,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    syncStatus: "PENDING"
  };

  store.add(record);
  return record;
}

/* ===============================
   UPDATE TRANSACTION NOTE
================================ */
export async function updateTransactionNote(transactionId, note) {
  const db = await openDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");

  return new Promise((resolve, reject) => {
    const req = store.get(transactionId);

    req.onsuccess = () => {
      const txn = req.result;
      if (!txn) return reject("Transaction not found");

      txn.note = note;
      txn.updatedAt = new Date().toISOString();
      store.put(txn);
      resolve(txn);
    };

    req.onerror = () => reject(req.error);
  });
}

/* ===============================
   UPDATE TRANSACTION AMOUNT ✅ (FIX)
================================ */
export async function updateTransactionAmount(transactionId, amount) {
  const db = await openDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");

  return new Promise((resolve, reject) => {
    const req = store.get(transactionId);

    req.onsuccess = () => {
      const txn = req.result;
      if (!txn) return reject("Transaction not found");

      txn.amount = Number(amount);
      txn.updatedAt = new Date().toISOString();
      store.put(txn);
      resolve(txn);
    };

    req.onerror = () => reject(req.error);
  });
}

/* ===============================
   SOFT DELETE TRANSACTION
================================ */
export async function softDeleteTransaction(transactionId) {
  const db = await openDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");

  return new Promise((resolve, reject) => {
    const req = store.get(transactionId);

    req.onsuccess = () => {
      const txn = req.result;
      if (!txn) return reject("Transaction not found");

      txn.deleted = true;
      txn.updatedAt = new Date().toISOString();
      store.put(txn);
      resolve(true);
    };

    req.onerror = () => reject(req.error);
  });
}
