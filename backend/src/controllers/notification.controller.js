const User = require("../../models/User");

/**
 * POST /api/system/save-fcm-token
 */
async function saveFcmToken(req, res, next) {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    if (!["web", "app"].includes(platform)) {
      return res.status(400).json({ success: false, message: "Invalid platform. Use 'web' or 'app'." });
    }

    // Use $addToSet with the whole object to avoid duplicates of the exact same token+platform
    const updated = await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: { token, platform } },
    }, { new: true });

    console.log(`[NotificationController] Token saved for user ${userId}. Total tokens: ${updated.fcmTokens.length}`);

    return res.json({ success: true, message: "FCM token saved successfully" });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/system/remove-fcm-token
 */
async function removeFcmToken(req, res, next) {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: { token } },
    });

    return res.json({ success: true, message: "FCM token removed successfully" });
  } catch (e) {
    next(e);
  }
}

async function sendTestNotification(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const notificationService = require("../services/notification.service");

    await notificationService.sendToUser(user, {
      title: "Test Notification",
      body: "If you see this, push notifications are working!",
      data: { type: "test" },
    });

    return res.json({ success: true, message: "Test notification sent" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  saveFcmToken,
  removeFcmToken,
  sendTestNotification,
};
