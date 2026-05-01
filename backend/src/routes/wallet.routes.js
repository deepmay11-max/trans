const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");
const { authRequired } = require("../middleware/auth.middleware");

router.use(authRequired);

router.get("/", walletController.getWallet);

module.exports = router;
