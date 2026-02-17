const router = require("express").Router();
const controller = require("../controllers/customer.controller");

router.post("/", controller.createCustomer);
router.get("/", controller.getCustomers);

module.exports = router;
