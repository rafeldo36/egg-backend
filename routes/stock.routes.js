const router = require("express").Router();
const controller = require("../controllers/stock.controller");

router.post("/produce", controller.addProduction);
router.get("/today", controller.getTodayStock);
router.get("/history", controller.getStockHistory);

module.exports = router;
