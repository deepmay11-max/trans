const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const garagePhone = "6260491554";
    const existingGarage = await User.findOne({ phone: garagePhone });

    const garageData = {
      phone: garagePhone,
      role: "garage",
      name: "Dummy Garage Owner",
      businessName: "Dummy Garage Services",
      setupComplete: true,
      address: "456, Garage Street",
      city: "Rajkot",
      pincode: "360001",
    };

    if (existingGarage) {
      await User.updateOne({ phone: garagePhone }, { $set: garageData });
      console.log("Updated existing dummy garage user.");
    } else {
      await User.create(garageData);
      console.log("Created new dummy garage user.");
    }

    const transportPhone = "7777777777";
    const existingTransport = await User.findOne({ phone: transportPhone });
    
    const transportData = {
      phone: transportPhone,
      role: "transport",
      name: "Dummy Transport Owner",
      businessName: "Dummy Transport Services",
      setupComplete: true,
      address: "123, Transport Nagar",
      city: "Rajkot",
      pincode: "360001",
    };

    if (existingTransport) {
      await User.updateOne({ phone: transportPhone }, { $set: transportData });
      console.log("Updated existing dummy transport user.");
    } else {
      await User.create(transportData);
      console.log("Created new dummy transport user.");
    }

    console.log("Seeding complete!");
    console.log("-> Use phone 6260491554 with OTP 123456 to login as Garage.");
    console.log("-> Use phone 7777777777 with OTP 123456 to login as Transport.");
    process.exit(0);
  } catch (e) {
    console.error("Seeding failed:", e.message);
    process.exit(1);
  }
}

seed();
