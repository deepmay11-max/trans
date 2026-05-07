const Referral = require("../models/Referral");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const SystemSetting = require("../models/SystemSetting");

// Helper to generate a unique referral code
async function generateUniqueCode(user) {
  const base = user.name ? user.name.substring(0, 4).toUpperCase() : "TRANS";
  const phoneSuffix = user.phone ? user.phone.substring(user.phone.length - 4) : "0000";
  
  let code = `${base}${phoneSuffix}`;
  let exists = await User.findOne({ referralCode: code });
  
  // If exists, append random chars
  if (exists) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return code;
}

async function getReferralStats(req, res, next) {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate code if not present
    if (!user.referralCode) {
      user.referralCode = await generateUniqueCode(user);
      await user.save();
    }

    const referrals = await Referral.find({ referrer: userId })
      .populate("referee", "name businessName phone createdAt")
      .sort({ createdAt: -1 });

    const totalEarned = referrals
      .filter(r => ["rewarded", "subscription_active"].includes(r.status))
      .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

    const milestoneSetting = await SystemSetting.findOne({ key: "referral_milestone" });
    const rewardSetting = await SystemSetting.findOne({ key: "referral_reward_amount" });
    const taglineSetting = await SystemSetting.findOne({ key: "referral_tagline" });

    return res.json({
      success: true,
      referralCode: user.referralCode,
      referrals,
      totalEarned,
      walletBalance: user.walletBalance || 0,
      milestone: milestoneSetting && milestoneSetting.value ? parseInt(milestoneSetting.value) : 1,
      rewardAmount: rewardSetting && rewardSetting.value ? parseFloat(rewardSetting.value) : 500,
      tagline: taglineSetting && taglineSetting.value ? taglineSetting.value : ""
    });
  } catch (e) {
    next(e);
  }
}

async function applyReferralCode(req, res, next) {
  try {
    const { referralCode } = req.body;
    const userId = req.user.id;

    if (!referralCode) {
      return res.status(400).json({ success: false, message: "Referral code required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.referredBy) {
      return res.status(400).json({ success: false, message: "Referral code already applied" });
    }

    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) {
      return res.status(404).json({ success: false, message: "Invalid referral code" });
    }

    if (String(referrer._id) === String(userId)) {
      return res.status(400).json({ success: false, message: "You cannot refer yourself" });
    }

    // Update user
    user.referredBy = referrer._id;
    await user.save();

    // Create Referral record
    await Referral.create({
      referrer: referrer._id,
      referee: userId,
      status: "signed_up",
    });

    return res.json({ success: true, message: "Referral code applied successfully" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getReferralStats,
  applyReferralCode,
};
