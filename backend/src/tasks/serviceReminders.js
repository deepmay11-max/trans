const cron = require("node-cron");
const GarageVehicle = require("../models/GarageVehicle");
const User = require("../../models/User");
const { sendToUser } = require("../services/notification.service");
const dayjs = require("dayjs");

/**
 * Scheduled Task: Daily Service Reminders
 * Runs every day at 10:00 AM
 */
function setupServiceReminderTask() {
  cron.schedule("0 10 * * *", async () => {
    console.log("[Task] Running Daily Service Reminders...");
    try {
      const today = dayjs().startOf("day");
      const tomorrow = today.add(1, "day").endOf("day");

      // Find vehicles due today or tomorrow
      const vehiclesDue = await GarageVehicle.find({
        nextServiceDate: {
          $gte: today.toDate(),
          $lte: tomorrow.toDate(),
        },
      }).populate("owner");

      console.log(`[Task] Found ${vehiclesDue.length} vehicles due for service.`);

      for (const vehicle of vehiclesDue) {
        const garageOwner = vehicle.owner;
        if (garageOwner) {
          await sendToUser(garageOwner, {
            title: "Service Reminder",
            body: `Vehicle ${vehicle.vehicleNumber} (${vehicle.customerName}) is due for service on ${dayjs(vehicle.nextServiceDate).format("DD-MM-YYYY")}.`,
            data: {
              type: "service_reminder",
              vehicleId: vehicle._id.toString(),
            },
          });
        }
      }
    } catch (error) {
      console.error("[Task] Service Reminder Error:", error);
    }
  });
}

module.exports = { setupServiceReminderTask };
