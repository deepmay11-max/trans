require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { translateText, translateBatch, translateObject } = require("../src/services/translationService");


async function run() {
  console.log("Testing Single Translation...");
  const hi = await translateText("Hello world", "hi", "en");
  console.log(`'Hello world' -> '${hi}'`);

  console.log("\nTesting Batch Translation...");
  const batchRes = await translateBatch(["Dashboard", "Profile", "Settings"], "hi", "en");
  console.log(`['Dashboard', 'Profile', 'Settings'] ->`, batchRes);

  console.log("\nTesting Object Translation...");
  const objRes = await translateObject({ name: "Ramesh", role: "Driver" }, "hi", "en", ["role"]);
  console.log(`{ name: 'Ramesh', role: 'Driver' } ->`, objRes);

  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
