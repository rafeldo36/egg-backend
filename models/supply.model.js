const mongoose = require("mongoose");

const supplySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  trays: Number,
  ratePerTray: Number,
  purchaseRatePerTray: Number,
  totalAmount: Number,
  profit: Number,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Supply", supplySchema);
