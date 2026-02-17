const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  type: { type: String, enum: ["retailer", "hotel"] },
  creditLimit: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
