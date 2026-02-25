const router = require("express").Router();
const controller = require("../controllers/dashboard.controller");

router.get("/", controller.getDashboardStats);
router.get("/overview", controller.getDashboardOverview);

module.exports = router;
