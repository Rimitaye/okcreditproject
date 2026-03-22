require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require("./models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 🟢 Added

// Import Models for AI Context
const Customer = require('./models/Customer'); 
const Transaction = require('./models/Transaction');

const app = express();

// 🟢 Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`📡 Incoming Request: ${req.method} ${req.url}`);
  next();
});

// 🔗 Routes
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/sync', require('./routes/sync'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/transactions', require('./routes/transactions'));

// 🤖 AI CHAT ROUTE
app.post("/api/ai/chat", async (req, res) => {
  const { prompt, userId } = req.body;

  try {
    // 1. Fetch Context
    const customers = await Customer.find({ userId });
    const transactions = await Transaction.find({ userId }).limit(5).sort({ date: -1 });

    const context = `
      You are an OkCredit Assistant. 
      Business Data: 
      - Customers: ${customers.map(c => `${c.name} (Balance: ₹${c.balance})`).join(", ")}
      - Recent Activity: ${transactions.map(t => `${t.type} of ₹${t.amount}`).join("; ")}
    `;

    // 2. Call the NEW model
    // Using gemini-2.5-flash for the best balance of speed and cost
    const result = await model.generateContent(`${context}\n\nUser Question: ${prompt}`);
    
    // 3. Handle the response (await the response object for safety)
    const response = await result.response;
    const aiResponse = response.text();

    res.json({ reply: aiResponse });

  } catch (error) {
    console.error("❌ AI Error:", error);
    // If it's still a 404, the API key might be restricted to a specific version
    res.status(500).json({ reply: "I'm having trouble connecting to my brain. Please check the backend console." });
  }
});

// 🟢 Update User Profile Route
app.put("/api/users/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // This contains name, phone, businessName, etc.

    // Find the user by ID and update with new data
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true } // This returns the updated document instead of the old one
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile Updated for:", updatedUser.name);
    res.status(200).json({ status: "success", user: updatedUser });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ message: "Server error during update" });
  }
});

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));