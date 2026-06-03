const mongoose = require("mongoose");

const TransportBillSchema = new mongoose.Schema(
  {
    owner:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    party:  { type: mongoose.Schema.Types.ObjectId, ref: "Party", index: true }, // optional — user may type billed-to manually

    billNumber: { type: String, index: true }, // Auto-generated on finalise

    // Linked trips (optional — for account-based billing)
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],

    // Manual line items (date | from | to | chalanNo | amount)
    items: [
      {
        date:        { type: Date },
        tempoNo:     { type: String },
        companyFrom: { type: String, trim: true },
        companyTo:   { type: String, trim: true },
        chalanNo:    { type: String, trim: true },
        haltDays:    { type: Number, default: 0 },
        haltAmount:  { type: Number, default: 0 },
        extraAmount: { type: Number, default: 0 },
        returnAmount:{ type: Number, default: 0 },
        gstPercent:  { type: Number, default: 0 },
        gstAmount:   { type: Number, default: 0 },
        amount:      { type: Number, default: 0 },
        tripIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
      },
    ],

    // Customer / billed-to snapshot (filled from Party or overridden)
    billedToName:    { type: String },
    billedToPhone:   { type: String },
    billedToEmail:   { type: String, lowercase: true },
    billedToAddress: { type: String },
    billedToCity:    { type: String },
    billedToState:   { type: String },
    billedToPincode: { type: String },
    billedToGstin:   { type: String, uppercase: true },
    billedToPan:     { type: String, uppercase: true },

    // Extra charges
    loadingCharge:   { type: Number, default: 0 },
    unloadingCharge: { type: Number, default: 0 },
    detentionCharge: { type: Number, default: 0 },
    haltCharge:      { type: Number, default: 0 }, // Global halt charge if needed
    otherCharge:     { type: Number, default: 0 },
    extraCharges:    { type: Number, default: 0 },

    // Tax
    gstPercent: { type: Number, default: 0 },
    gstType:    { type: String, enum: ["CGST+SGST", "IGST"], default: "CGST+SGST" },
    gstAmount:  { type: Number, default: 0 },

    // Totals
    subTotal:   { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Payment installments
    payments: [
      {
        amount:  { type: Number, required: true },
        date:    { type: Date, default: Date.now },
        mode:    { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Online"], default: "Cash" },
        notes:   { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    paidAmount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "unpaid", "partial", "paid", "cancelled"],
      default: "draft",
    },
    paymentMode: { type: String, enum: ["topay", "paid", "tbb"], default: "topay" },

    billingDate: { type: Date, default: Date.now },
    dueDate:     { type: Date, default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 },

    notes: { type: String, default: "Grateful for Moving What Matters to You!" },
    isDownloaded: { type: Boolean, default: false },
    downloadedAt: { type: Date },
    businessSnapshot: {
      businessName: { type: String },
      logoUrl:      { type: String },
      signatureUrl: { type: String },
      phone:        { type: String },
      alternatePhone:{ type: String },
      address:      { type: String },
      city:         { type: String },
      state:        { type: String },
      pincode:      { type: String },
      gstin:        { type: String },
      panNo:        { type: String },
      slogan:       { type: String },
      brandColor:   { type: String },
      wishingName:  { type: String },
      wishingColor: { type: String },
      repairDetailsLabel: { type: String },
    },
  },
  { timestamps: true }
);

TransportBillSchema.index({ owner: 1, status: 1 });
TransportBillSchema.index({ owner: 1, billingDate: -1 });

module.exports = mongoose.model("TransportBill", TransportBillSchema);
