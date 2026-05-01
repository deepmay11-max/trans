const Referral = require("../models/Referral");
const SystemSetting = require("../models/SystemSetting");

async function listReferrals(req, res, next) {
  try {
    const referrals = await Referral.find()
      .populate("referrer", "name businessName phone bankDetails")
      .populate("referee", "name businessName phone")
      .sort({ createdAt: -1 });

    return res.json({ success: true, referrals });
  } catch (e) {
    next(e);
  }
}

async function updateReferralStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const referral = await Referral.findById(id);
    if (!referral) return res.status(404).json({ success: false, message: "Referral not found" });

    referral.status = status;
    await referral.save();

    return res.json({ success: true, message: "Status updated", referral });
  } catch (e) {
    next(e);
  }
}

async function getSettings(req, res, next) {
  try {
    const limitSetting = await SystemSetting.findOne({ key: "referral_max_users" });
    const rewardSetting = await SystemSetting.findOne({ key: "referral_reward_amount" });
    const milestoneSetting = await SystemSetting.findOne({ key: "referral_milestone" });

    return res.json({
      success: true,
      settings: {
        maxUsers: limitSetting && limitSetting.value ? parseInt(limitSetting.value) : 10,
        rewardAmount: rewardSetting && rewardSetting.value ? parseFloat(rewardSetting.value) : 500,
        milestone: milestoneSetting && milestoneSetting.value ? parseInt(milestoneSetting.value) : 1
      }
    });
  } catch (e) {
    next(e);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { maxUsers, rewardAmount, milestone } = req.body;

    if (maxUsers !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: "referral_max_users" },
        { value: maxUsers },
        { upsert: true }
      );
    }
    
    if (rewardAmount !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: "referral_reward_amount" },
        { value: rewardAmount },
        { upsert: true }
      );
    }

    if (milestone !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: "referral_milestone" },
        { value: milestone },
        { upsert: true }
      );
    }

    return res.json({ success: true, message: "Referral settings updated successfully" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listReferrals,
  updateReferralStatus,
  getSettings,
  updateSettings,
};
