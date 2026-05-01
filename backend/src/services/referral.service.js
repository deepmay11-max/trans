const User = require("../models/User");
const Referral = require("../models/Referral");
const WalletTransaction = require("../models/WalletTransaction");
const SystemSetting = require("../models/SystemSetting");

async function processReferralReward(refereeId) {
  try {
    const referee = await User.findById(refereeId);
    if (!referee || !referee.referredBy) return;

    // Check if already rewarded
    const referral = await Referral.findOne({
      referrer: referee.referredBy,
      referee: refereeId,
    });

    if (!referral || referral.status === "rewarded") return;

    // Check if referrer has exceeded max limits
    const limitSetting = await SystemSetting.findOne({ key: "referral_max_users" });
    const maxUsers = limitSetting && limitSetting.value ? parseInt(limitSetting.value) : 10;
    
    const pastReferrals = await Referral.countDocuments({
      referrer: referee.referredBy,
      status: { $in: ["subscription_active", "rewarded"] }
    });

    if (pastReferrals >= maxUsers) {
      console.log(`[ReferralService] Referrer ${referee.referredBy} reached max limits of ${maxUsers} users`);
      return;
    }

    // Update current referral to 'pending_milestone' initially
    referral.status = "pending_milestone";
    await referral.save();

    // Check if referrer has reached the milestone for rewards
    const milestoneSetting = await SystemSetting.findOne({ key: "referral_milestone" });
    const milestone = milestoneSetting && milestoneSetting.value ? parseInt(milestoneSetting.value) : 1;

    const pendingReferrals = await Referral.find({
      referrer: referee.referredBy,
      status: "pending_milestone"
    });

    if (pendingReferrals.length >= milestone) {
      // Milestone reached! Mark all pending as 'subscription_active' (payout due)
      const rewardSetting = await SystemSetting.findOne({ key: "referral_reward_amount" });
      const REWARD_AMOUNT = rewardSetting && rewardSetting.value ? parseFloat(rewardSetting.value) : 500;

      for (const ref of pendingReferrals) {
        ref.status = "subscription_active";
        ref.rewardAmount = REWARD_AMOUNT;
        await ref.save();
      }
      console.log(`[ReferralService] Referrer ${referee.referredBy} reached milestone of ${milestone}. ${pendingReferrals.length} referrals unlocked.`);
    } else {
      console.log(`[ReferralService] Referrer ${referee.referredBy} has ${pendingReferrals.length}/${milestone} referrals towards milestone.`);
    }
  } catch (error) {
    console.error("Error processing referral reward:", error);
  }
}

module.exports = {
  processReferralReward,
};
