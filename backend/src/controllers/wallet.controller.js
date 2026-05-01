const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");

async function getWallet(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("walletBalance");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const transactions = await WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      walletBalance: user.walletBalance || 0,
      transactions,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getWallet,
};
