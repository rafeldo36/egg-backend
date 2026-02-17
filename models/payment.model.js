const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  amount: Number,
  paymentDate: { type: Date, default: Date.now },
  note: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
