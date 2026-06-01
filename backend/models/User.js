const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    alternatePhone: { type: String, default: null },
    role: { type: String, enum: ["admin", "transport", "garage"], default: null },
    name: { type: String, default: null },
    businessName: { type: String, default: null },
    setupComplete: { type: Boolean, default: false },
    email: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
    panNo: { type: String, default: null },
    gstin: { type: String, default: null },
    aadharNo: { type: String, default: null },
    bankDetails: {
      accountName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      ifsc: { type: String, default: null },
      bankName: { type: String, default: null },
      upiId: { type: String, default: null },
      qrUrl: { type: String, default: null },
    },
    signatureUrl: { type: String, default: null },
    logoUrl: { type: String, default: null },
    slogan: { type: String, default: null },
    wishingName: { type: String, default: null },
    brandColor: { type: String, default: '#000000' },
    wishingColor: { type: String, default: '#444444' },
    documents: {
      aadharUrl: { type: String, default: null },
      panUrl: { type: String, default: null },
      photoUrl: { type: String, default: null },
      rcUrl: { type: String, default: null },
      insuranceUrl: { type: String, default: null },
      addressProofUrl: { type: String, default: null },
      gstCertificateUrl: { type: String, default: null },
    },
    isGstApplicable: { type: Boolean, default: false },
    
    // Wallet and Referral System
    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Subscription information
    subscriptionActive: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date, default: null },
    allowedVehicles: { type: Number, default: 0 }, // 0 means not restricted or free trial limit
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SoftwarePlan", default: null },
    
    // Account deletion status
    isDeleted: { type: Boolean, default: false },
    
    // Password-based authentication (optional)
    passwordHash: { type: String, default: null },
    passwordSalt: { type: String, default: null },
    passwordIterations: { type: Number, default: null },
    // Push Notifications
    fcmTokens: [
      {
        token: { type: String },
        platform: { type: String, enum: ["web", "app"] },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

