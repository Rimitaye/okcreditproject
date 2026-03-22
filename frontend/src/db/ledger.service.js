// frontend/src/db/ledger.service.js

export function calculateBalance(transactions) {
  let balance = 0;

  for (const txn of transactions) {
    if (txn.type === "CREDIT") {
      balance += Number(txn.amount);
    } else if (txn.type === "DEBIT") {
      balance -= Number(txn.amount);
    }
  }

  return balance;
}
