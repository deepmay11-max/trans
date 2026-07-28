const axios = require("axios");

/**
 * SMSIndiaHub Service
 * Documentation: https://www.smsindiahub.in/sms-api/
 */

async function sendSms(phone, message, options = {}) {
  const apiKey = process.env.SMSINDIAHUB_API_KEY;
  const senderId = options.senderId || process.env.SMSINDIAHUB_SENDER_ID || "SMSHUB";

  if (!apiKey) {
    console.log("------------------------------------------");
    console.log(`[MOCK SMS] To: ${phone}`);
    console.log(`[MOCK SMS] Msg: ${message}`);
    console.log("------------------------------------------");
    return { success: true, message: "Mock SMS sent" };
  }

  try {
    const msisdn = phone.length === 10 ? `91${phone}` : phone;
    let url = `http://cloud.smsindiahub.in/vendorsms/pushsms.aspx?APIKey=${apiKey}&msisdn=${msisdn}&sid=${senderId}&msg=${encodeURIComponent(message)}&fl=0&gwid=2`;
    
    if (options.peid) url += `&peid=${options.peid}&EntityID=${options.peid}`;
    if (options.templateId) url += `&templateid=${options.templateId}&TemplateID=${options.templateId}`;
    
    console.log("[SMS SERVICE] Sending to:", url);
    
    const response = await axios.get(url);
    console.log("[SMS SERVICE] Result:", response.data);
    
    return { 
      success: true, 
      response: response.data,
      debugUrl: url 
    };
  } catch (error) {
    console.error("[SMS SERVICE] Error:", error.message);
    return { success: false, error: error.message };
  }
}

async function sendOtpSms(phone, otp) {
  // Skip actual SMS for specific numbers
  const testPhones = ["7458947838", "6260491554", "7777777777"];
  if (testPhones.includes(phone)) {
    console.log(`[SMS SERVICE] Skipping actual SMS for special number: ${phone}`);
    return { success: true, message: "Special number, SMS skipped" };
  }

  const message = `Welcome to the trans powered by Appzeto.Your OTP for registration is ${otp}.BGADEC`;
  return sendSms(phone, message, {
    senderId: "BGADEC",
    peid: "1001164203633432409",
    templateId: "1007282516644508833"
  });
}

module.exports = { sendSms, sendOtpSms };
