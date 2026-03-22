const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    userId: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['gave', 'got'], // 👈 Check if your frontend is sending these exact words
        required: true 
    },
    description: { 
        type: String, 
        default: "" 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);