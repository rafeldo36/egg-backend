const Supply = require("../models/supply.model");
const Customer = require("../models/customer.model");
const { deductStock, reverseSupply } = require("./stock.controller");
const messaging = require("../services/messaging.service");



exports.addSupply = async (req, res) => {
  try {
    const { customerId, trays, ratePerTray, purchaseRatePerTray } = req.body;

    const totalAmount = trays * ratePerTray;
    const profit = (ratePerTray - purchaseRatePerTray) * trays;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const newBalance = customer.currentBalance + totalAmount;

    if (newBalance > customer.creditLimit) {
      return res.status(400).json({ message: "Credit limit exceeded!" });
    }

    // ✅ Create supply record
    const supply = await Supply.create({
      customerId,
      trays,
      ratePerTray,
      purchaseRatePerTray,
      totalAmount,
      profit
    });

    // ✅ Update customer balance
    customer.currentBalance = newBalance;
    await customer.save();
    await deductStock(trays);

    // ✅ Send notification to customer
    if (customer.phone) {
      messaging.sendSupplyNotification(
        customer,
        trays,
        totalAmount,
        newBalance
      ).catch(err => {
        console.error("⚠️  Failed to send supply notification:", err.message);
        // Don't fail the supply creation if notification fails
      });
    }

    res.json(supply);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupplies = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const supplies = await Supply.find(filter).sort({ date: -1 });
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSupply = async (req, res) => {
  try {
    const { id } = req.params;
    const supply = await Supply.findById(id);

    if (!supply) {
      return res.status(404).json({ message: "Supply not found" });
    }

    const customer = await Customer.findById(supply.customerId);
    if (customer) {
      customer.currentBalance = customer.currentBalance - supply.totalAmount;
      await customer.save();
    }

    await reverseSupply(supply.trays);
    await supply.deleteOne();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
