const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Bill = require("./src/models/Bill");
const Party = require("./src/models/Party");

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding garage cards...");

    const garagePhone = "8888888888";
    const garageUser = await User.findOne({ phone: garagePhone });

    if (!garageUser) {
      console.log("Garage user not found!");
      process.exit(1);
    }

    // Delete existing dummy bills and parties to avoid duplicates
    await Bill.deleteMany({ owner: garageUser._id });
    await Party.deleteMany({ owner: garageUser._id });

    // Create a dummy party
    const party1 = await Party.create({
      owner: garageUser._id,
      name: "Rahul Sharma",
      phone: "9876543210",
      partyType: "garage",
    });

    const party2 = await Party.create({
      owner: garageUser._id,
      name: "Amit Patel",
      phone: "9123456780",
      partyType: "garage",
    });

    const party3 = await Party.create({
      owner: garageUser._id,
      name: "Sneha Desai",
      phone: "9988776655",
      partyType: "garage",
    });

    const dummyBills = [
      {
        owner: garageUser._id,
        party: party1._id,
        billType: "garage",
        customerName: "Rahul Sharma",
        customerPhone: "9876543210",
        vehicleNo: "GJ03AB1234",
        vehicleModel: "Hyundai Creta",
        kmsDriven: 45000,
        billingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
        items: [
          { name: "Engine Oil Change", quantity: 1, rate: 1800, amount: 1800 },
          { name: "Oil Filter", quantity: 1, rate: 350, amount: 350 },
          { name: "Labor Charges", quantity: 1, rate: 500, amount: 500 }
        ],
        subTotal: 2650,
        discount: 150,
        grandTotal: 2500,
        advance: 2500,
        status: "paid",
        notes: "General service completed."
      },
      {
        owner: garageUser._id,
        party: party2._id,
        billType: "garage",
        customerName: "Amit Patel",
        customerPhone: "9123456780",
        vehicleNo: "GJ01XY9876",
        vehicleModel: "Maruti Swift",
        kmsDriven: 62000,
        billingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        items: [
          { name: "Brake Pad Replacement", quantity: 1, rate: 2200, amount: 2200 },
          { name: "Wheel Alignment", quantity: 1, rate: 400, amount: 400 }
        ],
        subTotal: 2600,
        discount: 0,
        grandTotal: 2600,
        advance: 1000,
        status: "partial",
        notes: "Brakes replaced, alignment done."
      },
      {
        owner: garageUser._id,
        party: party3._id,
        billType: "garage",
        customerName: "Sneha Desai",
        customerPhone: "9988776655",
        vehicleNo: "GJ05PQ4567",
        vehicleModel: "Honda City",
        kmsDriven: 12000,
        billingDate: new Date(),
        nextServiceDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        items: [
          { name: "AC Gas Topup", quantity: 1, rate: 1200, amount: 1200 },
          { name: "Washing & Cleaning", quantity: 1, rate: 300, amount: 300 }
        ],
        subTotal: 1500,
        discount: 0,
        grandTotal: 1500,
        advance: 1500,
        status: "paid",
        notes: "Customer reported less cooling."
      }
    ];

    await Bill.insertMany(dummyBills);
    console.log(`Successfully seeded ${dummyBills.length} dummy job cards for Garage!`);

    process.exit(0);
  } catch (e) {
    console.error("Seeding failed:", e.message);
    process.exit(1);
  }
}

seed();
