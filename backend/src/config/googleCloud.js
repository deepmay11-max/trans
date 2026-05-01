const { Translate } = require("@google-cloud/translate").v2;
const dotenv = require("dotenv");

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const apiKey = process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GOOGLE_CLOUD_TRANSLATE_API_KEY is not defined in environment variables. Translation will fail.");
}

const translate = new Translate({ key: apiKey });

// Map frontend language codes to Google Translate API codes if different
const languageCodeMap = {
  en: "en",
  hi: "hi",
};

const RTL_LANGUAGES = ["ar", "he", "ur", "fa"];

module.exports = {
  translate,
  languageCodeMap,
  RTL_LANGUAGES,
};
