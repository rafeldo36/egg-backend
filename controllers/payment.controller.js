const Payment = require("../models/payment.model");
const Customer = require("../models/customer.model");

exports.addPayment = async (req, res) => {
  const { customerId, amount } = req.body;

  const payment = await Payment.create(req.body);

  // Reduce balance
  await Customer.findByIdAndUpdate(customerId, {
    $inc: { currentBalance: -amount }
  });

  res.json(payment);
};
