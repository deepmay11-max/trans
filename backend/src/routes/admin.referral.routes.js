const express = require("express");
const router = express.Router();
const adminReferralController = require("../controllers/admin.referral.controller");
const { authRequired, requireRole } = require("../middleware/auth.middleware");

router.use(authRequired, requireRole("admin"));

router.get("/", adminReferralController.listReferrals);
router.get("/settings", adminReferralController.getSettings);
router.post("/settings", adminReferralController.updateSettings);
router.patch("/:id/status", adminReferralController.updateReferralStatus);

module.exports = router;
