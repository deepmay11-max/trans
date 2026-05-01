const express = require("express");
const router = express.Router();
const referralController = require("../controllers/referral.controller");
const { authRequired } = require("../middleware/auth.middleware");

router.use(authRequired);

router.get("/stats", referralController.getReferralStats);
router.post("/apply", referralController.applyReferralCode);

module.exports = router;
