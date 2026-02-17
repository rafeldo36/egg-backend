const router = require("express").Router();
const controller = require("../controllers/supply.controller");

router.post("/", controller.addSupply);

module.exports = router;
