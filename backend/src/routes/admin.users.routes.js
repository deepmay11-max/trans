const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth.middleware");
const adminUsersController = require("../controllers/admin.users.controller");

const router = express.Router();

router.get("/", authRequired, requireRole("admin"), adminUsersController.list);
router.post("/", authRequired, requireRole("admin"), adminUsersController.create);
router.patch("/:id", authRequired, requireRole("admin"), adminUsersController.update);
router.delete("/:id", authRequired, requireRole("admin"), adminUsersController.remove);
router.get("/:id/history", authRequired, requireRole("admin"), adminUsersController.getUserHistory);

router.post("/:id/wallet", authRequired, requireRole("admin"), adminUsersController.updateWallet);
router.get("/:id/wallet", authRequired, requireRole("admin"), adminUsersController.getWalletTransactions);

module.exports = router;

