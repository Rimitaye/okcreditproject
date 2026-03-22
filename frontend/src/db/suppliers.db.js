// src/db/suppliers.db.js
import { db } from "./dexie.js"; 

/**
 * Saves a supplier to the local IndexedDB immediately.
 * Perfect for offline-first PWAs.
 */
export async function addSupplierOffline(supplier) {
  try {
    const record = {
      ...supplier,
      id: supplier.id || crypto.randomUUID(),
      type: 'supplier', // Ensure it's marked as supplier
      syncStatus: 'pending',
      deleted: 0,
      updatedAt: new Date().toISOString()
    };
    
    await db.customers.put(record); // We use the 'customers' table for both types
    return record;
  } catch (error) {
    console.error("Dexie Supplier Save Error:", error);
    throw error;
  }
}

/**
 * Retrieves all locally saved suppliers.
 */
export async function getSuppliers() {
  return await db.customers
    .where("type").equals("supplier")
    .and(item => item.deleted === 0)
    .toArray();
}