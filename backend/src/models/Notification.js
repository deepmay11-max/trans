const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "alert", "security", "success"],
      default: "info",
    },
    data: { type: Object, default: {} },
    read: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
