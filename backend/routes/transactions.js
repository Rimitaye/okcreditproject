const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

router.post('/add', async (req, res) => {
    try {
        let { customerId, userId, amount, type, description } = req.body;

        // 🟢 THE TRANSLATOR (Prevents the 500 Error)
        if (type === "CREDIT") type = "got";   
        if (type === "DEBIT") type = "gave";   

        // 1. Create and Save the Transaction
        const newTx = new Transaction({ 
            customerId, 
            userId, 
            amount: Number(amount), 
            type, // Now this is 'got' or 'gave'
            description 
        });
        await newTx.save();

        // 2. Calculate the balance change
        const adjustment = (type === 'gave') ? amount : -amount;

        // 3. Update the Customer Balance
        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: customerId }, 
            { $inc: { balance: adjustment } },
            { new: true } 
        );

        if (!updatedCustomer) {
            return res.status(404).json({ status: "error", message: "Customer not found" });
        }

        res.status(201).json({ status: "success", balance: updatedCustomer.balance });

    } catch (err) {
        // Look at your TERMINAL to see this message
        console.error("🔥 DATABASE ERROR:", err.message); 
        res.status(500).json({ status: "error", message: err.message });
    }
});
        
// Route to get all transactions for a specific customer

const mongoose = require('mongoose');
// backend/routes/transactions.js
// backend/routes/transactions.js
// GET all transactions for a specific customer
router.get("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    // 🟢 Fix: Ensure we find ALL transactions for this customer ID
    // Remove any "date: Date.now()" or similar filters here
    const transactions = await Transaction.find({ customerId: customerId })
      .sort({ date: -1 }); // -1 shows newest transactions first

    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET a single transaction by ID
router.get("/detail/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// DELETE a single transaction
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add this to your backend routes file
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, image } = req.body; // Extract what you're sending

    // Find the transaction and update it
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, image },
      { new: true } // returns the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;