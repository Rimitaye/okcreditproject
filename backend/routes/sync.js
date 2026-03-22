const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

router.post('/pull', async (req, res) => {
    try {
        const { userId } = req.body;
        
        console.log(`🔍 SEARCHING: Looking for customers with userId: ${userId}`);

        // 🟢 Use explicit key-value matching
        const customers = await Customer.find({ userId: userId });

        console.log(`✅ FOUND: ${customers.length} customers in database.`);

        res.status(200).json({
            status: "success",
            customers: customers || []
        });
    } catch (err) {
        console.error("❌ Sync Error:", err.message);
        res.status(500).json({ status: "error", message: err.message });
    }
});

module.exports = router;