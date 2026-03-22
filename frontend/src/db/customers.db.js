import { db } from "./dexie.js"; // Use the Dexie instance we created

/**
 * Get all customers (not deleted)
 */
export async function getCustomers() {
  // Using Dexie is much cleaner and keeps your filter logic
  const data = await db.parties
    .where("type").equals("customer")
    .toArray();
    
  return data.filter(c => !c.deleted);
}

/**
 * Add customer offline
 */
export async function addCustomerOffline(customer) {
  const record = {
    uuid: crypto.randomUUID(), // Changed from 'id' to 'uuid' for MySQL matching
    name: customer.name,
    phone: customer.phone || "",
    dueDate: null,
    type: "customer",
    balance: 0,                // Ensure balance starts at 0
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: 0                  // Changed from syncStatus: PENDING to synced: 0
  };

  await db.parties.add(record);
  return record;
}

/**
 * Get single customer by UUID
 */
export async function getCustomerById(customerId) {
  // We search by 'uuid' now to stay consistent across devices
  return await db.parties.where("uuid").equals(customerId).first() || null;
}

/**
 * Set / update customer due date
 */
export async function setCustomerDueDate(customerId, dueDate) {
  await db.parties.where("uuid").equals(customerId).modify({
    dueDate: dueDate,
    updatedAt: new Date().toISOString(),
    synced: 0
  });
}

/**
 * Update balance
 */
export async function updateCustomerBalance(customerId, balance) {
  await db.parties.where("uuid").equals(customerId).modify({
    balance: balance,
    updatedAt: new Date().toISOString(),
    synced: 0
  });
}