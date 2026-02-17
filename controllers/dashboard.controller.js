const Supply = require("../models/supply.model");

exports.getDashboardStats = async (req, res) => {
  try {

    const result = await Supply.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$profit" }
        }
      }
    ]);

    res.json(result[0] || { totalSales: 0, totalProfit: 0 });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const data = await Supply.find({
      date: { $gte: start, $lte: end }
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
