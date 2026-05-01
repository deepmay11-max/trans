const OTP_TTL_SECONDS = 5 * 60;

// In-memory OTP store: good for dev/single instance.
// For production, replace with Redis or DB table.
const store = new Map(); // phone -> { otp, expiresAtMs }

function generateOtp(phone) {
  // Special case for specific numbers
  const testPhones = ["6260491554", "9913763319"];
  if (testPhones.includes(phone)) {
    return "123456";
  }
  // Random 6 digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function issueOtp(phone) {
  const otp = generateOtp(phone);
  const expiresAtMs = Date.now() + OTP_TTL_SECONDS * 1000;
  store.set(phone, { otp, expiresAtMs });
  return { otp, ttlSeconds: OTP_TTL_SECONDS };
}

function verifyOtp(phone, otp) {
  // Special case for specific numbers
  const testPhones = ["6260491554", "9913763319"];
  if (testPhones.includes(phone) && otp === "123456") {
    return true;
  }

  const rec = store.get(phone);
  if (!rec) return false;
  if (Date.now() > rec.expiresAtMs) {
    store.delete(phone);
    return false;
  }
  const ok = rec.otp === otp;
  if (ok) store.delete(phone);
  return ok;
}

module.exports = { issueOtp, verifyOtp };

