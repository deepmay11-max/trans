const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema(
  {
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { 
      type: String, 
      enum: ["signed_up", "subscription_active", "rewarded"], 
      default: "signed_up" 
    },
    rewardAmount: { type: Number, default: 0 },
    notes: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", ReferralSchema);
