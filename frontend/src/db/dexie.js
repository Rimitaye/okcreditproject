import Dexie from 'dexie';

export const db = new Dexie('OkCreditClone');

// We add 'synced' so we know what needs to go to MongoDB later
db.version(1).stores({
  customers: '++id, _id, name, phone, type',
  transactions: '++id, customerId, amount, type, date, synced' 
});