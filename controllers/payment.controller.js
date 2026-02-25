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

exports.getPayments = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.paymentDate = {};
      if (from) filter.paymentDate.$gte = new Date(from);
      if (to) filter.paymentDate.$lte = new Date(to);
    }

    const payments = await Payment.find(filter).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const customer = await Customer.findById(payment.customerId);
    if (customer) {
      customer.currentBalance = customer.currentBalance + payment.amount;
      await customer.save();
    }

    await payment.deleteOne();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
