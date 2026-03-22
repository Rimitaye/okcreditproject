const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
router.get("/", auth, async (req, res) => {
  try {
    // This 'populates' the transactions array inside each customer
    const customers = await Customer.find({ userId: req.userId }).populate('transactions');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1. ADD THIS: Route to get the LIST of all customers
router.get('/', async (req, res) => {
    try {
        // We remove the userId filter here so ALL your Compass data shows up
        const customers = await Customer.find({}); 
        res.json(customers);
    } catch (err) {
        console.error("❌ Fetch List Error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// 2. YOUR EXISTING: Get ONE customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).send("Customer not found");
        res.json(customer);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3. YOUR EXISTING: Add customer
router.post('/add', async (req, res) => {
    try {
        const { name, phone, userId, type } = req.body;
        const newCustomer = new Customer({
            name,
            phone: phone || "",
            userId,
            type: type || 'customer'
        });
        const savedCustomer = await newCustomer.save();
        res.status(201).json({ status: "success", customer: savedCustomer });
    } catch (err) {
        console.error("❌ Add Customer Error:", err.message);
        res.status(500).json({ status: "error", message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { dueDate } = req.body; 
        
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id, 
            { $set: { dueDate: dueDate } }, // 🟢 Use $set for a guaranteed update
            { new: true, runValidators: true } 
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        console.log("💾 Saved to Mongo:", updatedCustomer);
        res.json(updatedCustomer);
    } catch (err) {
        console.error("❌ DB Update Error:", err.message);
        res.status(500).json({ message: err.message });
    }
});
// 🟢 DELETE CUSTOMER ROUTE
router.delete("/:id", async (req, res) => { 
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put('/profile/:id', async (req, res) => {
    console.log("📥 PROFILE UPDATE DATA:", req.body); 
    try {
        const { name, phone, address } = req.body;
        const updated = await Customer.findByIdAndUpdate(
            req.params.id,
            { $set: { name, phone, address } },
            { returnDocument: 'after', runValidators: true }
        );
        console.log("💾 PROFILE SAVED:", updated.name);
        res.json(updated);
    } catch (err) { res.status(500).json(err.message); }
});
module.exports = router;