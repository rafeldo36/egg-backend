const Supply = require("../models/supply.model");
const Customer = require("../models/customer.model");
const Stock = require("../models/stock.model");
const { deductStock } = require("./stock.controller");


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
      customer: customerId,
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


    // ✅ UPDATE STOCK HERE
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    await Stock.findOneAndUpdate(
      { date: startOfDay },
      { $inc: { suppliedStock: trays } },
      { upsert: true, returnDocument: 'after' }
    );

    res.json(supply);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
