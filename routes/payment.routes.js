const router = require("express").Router();
const controller = require("../controllers/payment.controller");

router.post("/", controller.addPayment);
router.get("/", controller.getPayments);
router.delete("/:id", controller.deletePayment);

module.exports = router;
