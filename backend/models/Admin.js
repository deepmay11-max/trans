const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },

    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    passwordIterations: { type: Number, required: true },

    name: { type: String, default: "Super Admin" },
    phone: { type: String, default: "" },

    role: { type: String, enum: ["admin"], default: "admin" },

    // Optional OTP login (fixed / default OTP for controlled environments)
    defaultOtp: { type: String, default: null },

    disabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);

