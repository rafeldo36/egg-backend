const router = require("express").Router();
const controller = require("../controllers/payment.controller");

router.post("/", controller.addPayment);

module.exports = router;
