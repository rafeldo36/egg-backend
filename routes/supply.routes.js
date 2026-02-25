const router = require("express").Router();
const controller = require("../controllers/supply.controller");

router.post("/", controller.addSupply);
router.get("/", controller.getSupplies);
router.delete("/:id", controller.deleteSupply);

module.exports = router;
