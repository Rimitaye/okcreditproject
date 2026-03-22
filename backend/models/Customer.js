const mongoose = require('mongoose');

// This is the Blueprint (The Model)
const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    userId: { type: String, required: true },
    type: { type: String, default: 'customer' },
    balance: { type: Number, default: 0 },
    address: { type: String, default: "" },
    dueDate: { type: String, default: null }
    
},
{ 
    // 🟢 CRITICAL: This allows the virtual "transactions" to show up in JSON
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});
CustomerSchema.virtual('transactions', {
  ref: 'Transaction',           // The name of your Transaction model
  localField: '_id',            // The ID of the customer
  foreignField: 'customerId'     // The field in the Transaction model that stores the customer ID
});

// This EXPORTS the Model so .find() and .save() work
module.exports = mongoose.model('Customer', CustomerSchema);