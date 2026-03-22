const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, phone, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ status: "success", message: "User Registered" });
  } catch (err) {
    res.status(400).json({ status: "error", message: "Phone already exists" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ status: "success", user_id: user._id, user_name: user.name });
  } else {
    res.status(401).json({ status: "error", message: "Invalid Credentials" });
  }
});

module.exports = router;