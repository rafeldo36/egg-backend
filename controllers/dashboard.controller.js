const Supply = require("../models/supply.model");

const aggregateRange = async (start, end) => {
  const match = {};

  if (start || end) {
    match.date = {};
    if (start) match.date.$gte = start;
    if (end) match.date.$lte = end;
  }

  const result = await Supply.aggregate([
    { $match: Object.keys(match).length ? match : {} },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalAmount" },
        totalProfit: { $sum: "$profit" }
      }
    }
  ]);

  return result[0] || { totalSales: 0, totalProfit: 0 };
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totals = await aggregateRange();
    res.json(totals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const [today, month, year] = await Promise.all([
      aggregateRange(startOfToday, endOfToday),
      aggregateRange(startOfMonth, endOfMonth),
      aggregateRange(startOfYear, endOfYear)
    ]);

    res.json({ today, month, year });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const data = await Supply.find({
      date: { $gte: start, $lte: end }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
