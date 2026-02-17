const Stock = require("../models/stock.model");

const todayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// ✅ Add Production
exports.addProduction = async (req, res) => {
  try {
    const { quantity } = req.body;
    const date = todayDate();

    let stock = await Stock.findOne({ date });

    if (!stock) {
      stock = new Stock({ date, produced: quantity });
    } else {
      stock.produced += quantity;
    }

    await stock.save();

    res.json({ message: "Production added", stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Deduct Stock (called automatically from supply)
exports.deductStock = async (quantity) => {
  const date = todayDate();

  let stock = await Stock.findOne({ date });

  if (!stock) throw new Error("No production found for today");

  if (stock.produced - stock.supplied < quantity) {
    throw new Error("Not enough stock available");
  }

  stock.supplied += quantity;
  await stock.save();
};

// ✅ Get Today Stock
exports.getTodayStock = async (req, res) => {
  try {
    const date = todayDate();
    const stock = await Stock.findOne({ date });

    if (!stock) {
      return res.json({
        produced: 0,
        supplied: 0,
        remaining: 0
      });
    }

    res.json({
      produced: stock.produced,
      supplied: stock.supplied,
      remaining: stock.produced - stock.supplied
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Stock History
exports.getStockHistory = async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ date: -1 });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
