const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require("../config/trans-4d075-firebase-adminsdk-fbsvc-ed131d6813.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send push notification to a list of tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {Object} payload - Notification payload { title, body, data }
 */
async function sendPushNotification(tokens, payload) {
  console.log(`[NotificationService] Attempting to send to ${tokens.length} tokens`);
  console.log(`[NotificationService] Payload:`, JSON.stringify(payload, null, 2));

  if (!tokens || tokens.length === 0) {
    console.warn("[NotificationService] No tokens provided, skipping.");
    return;
  }

  try {
    const frontendUrls = (process.env.FRONTEND_URL || 'https://transbilling.in').split(',').map(u => u.trim());
    const primaryUrl = frontendUrls.find(u => !u.includes('localhost')) || frontendUrls[0];

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.image || undefined,
      },
      webpush: {
        notification: {
          icon: `${primaryUrl}/trans-logo.png`,
          badge: `${primaryUrl}/trans-logo.png`,
        },
        fcm_options: {
          link: primaryUrl
        }
      },
      data: {
        ...payload.data,
        link: payload.data?.link || primaryUrl
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent: ${response.successCount} messages`);
    
    // Optionally handle invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      console.log("Failed tokens:", failedTokens);
    }
    
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

/**
 * Send notification to a specific User
 * @param {Object} user - User document from DB
 * @param {Object} payload - Notification payload
 */
async function sendToUser(user, payload) {
  if (!user.fcmTokens || user.fcmTokens.length === 0) return;
  const tokens = user.fcmTokens.map(t => t.token);
  const uniqueTokens = [...new Set(tokens)];
  return sendPushNotification(uniqueTokens, payload);
}

/**
 * Send notification to all Admins
 * @param {Object} payload - Notification payload
 */
async function notifyAdmins(payload) {
  try {
    const User = require("../../models/User");
    const admins = await User.find({ role: "admin" });
    console.log(`[NotificationService] Notifying ${admins.length} admins about: ${payload.title}`);
    for (const admin of admins) {
      await sendToUser(admin, payload);
    }
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
}

module.exports = {
  sendPushNotification,
  sendToUser,
  notifyAdmins,
};
