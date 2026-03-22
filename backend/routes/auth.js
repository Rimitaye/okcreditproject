const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER ROUTE (Already working for you)
router.post('/register', async (req, res) => {
  console.log("📥 Register Request:", req.body);
  try {
    const { name, phone, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, phone, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ status: "success", message: "User created" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

// 2. LOGIN ROUTE (ADD THIS NOW)
router.post('/login', async (req, res) => {
  console.log("📥 Login Request:", req.body); // This will show in your terminal
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Compare encrypted password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: "error", message: "Wrong password" });
    }
    // We create the 'token' variable here so it can be used below
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, // Make sure this matches your .env file
      { expiresIn: '7d' } 
    );

    // Success!
    res.json({ 
     status: "success",
     token: token,
  userId: user._id,
  userName: user.name
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

module.exports = router;