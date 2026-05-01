const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authRequired } = require("../middleware/auth.middleware");

router.get("/", authRequired, notificationController.getNotifications);
router.patch("/read/:id", authRequired, notificationController.markAsRead);
router.delete("/:id", authRequired, notificationController.deleteNotification);

module.exports = router;
