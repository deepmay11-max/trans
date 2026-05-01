const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true }, // Positive for credit, Negative for debit
    type: { 
      type: String, 
      enum: ["referral_reward", "subscription_payment", "withdrawal", "manual_admin"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      default: "completed" 
    },
    description: { type: String, default: null },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

WalletTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
