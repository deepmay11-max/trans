const Notification = require("../models/Notification");
const User = require("../models/User");
const notificationService = require("../services/notification.service");

async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });

    return res.json({ success: true, notifications, unreadCount });
  } catch (e) {
    next(e);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany(
        { recipient: req.user.id, read: false },
        { $set: { read: true } }
      );
    } else {
      await Notification.findOneAndUpdate(
        { _id: id, recipient: req.user.id },
        { $set: { read: true } }
      );
    }
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, recipient: req.user.id });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

async function saveFcmToken(req, res, next) {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    // Pull this token from ALL users to ensure it only belongs to the current user
    await User.updateMany(
      { "fcmTokens.token": token },
      { $pull: { fcmTokens: { token } } }
    );

    await User.findByIdAndUpdate(req.user.id, {
      $push: { fcmTokens: { token, platform: platform || "web" } }
    });

    return res.json({ success: true, message: "Token saved" });
  } catch (e) {
    next(e);
  }
}

async function removeFcmToken(req, res, next) {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { fcmTokens: { token } }
    });
    return res.json({ success: true, message: "Token removed" });
  } catch (e) {
    next(e);
  }
}

async function sendTestNotification(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await notificationService.sendToUser(user, {
      title: "Test Notification",
      body: "This is a test notification from TransBilling system.",
      type: "info"
    });

    return res.json({ success: true, message: "Test notification sent" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
  saveFcmToken,
  removeFcmToken,
  sendTestNotification
};
