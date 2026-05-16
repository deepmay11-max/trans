const express = require("express");
const router = express.Router();
const billController = require("../controllers/bill.controller");
const { authRequired } = require("../middleware/auth.middleware");

// Public routes (No auth)
router.get("/public/:id", billController.getPublicBill);

// Secure all billing routes
router.use(authRequired);

router.get("/drafts", billController.getDrafts);
router.get("/", billController.listBills);
router.post("/", billController.createBill);
router.get("/:id", billController.getBillDetail);
router.patch("/:id", billController.updateBill);
router.patch("/:id/download", billController.markAsDownloaded);
router.delete("/:id", billController.deleteBill);

module.exports = router;
