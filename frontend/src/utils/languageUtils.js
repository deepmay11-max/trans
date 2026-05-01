const RTL_LANGUAGES = ["ar", "he", "ur", "fa"];

export function normalizeLanguageCode(code) {
  if (!code) return "en";
  // Convert en_US or en-US to en
  const base = code.split(/[-_]/)[0].toLowerCase();
  return base;
}

export function isRTLLanguage(code) {
  const normalized = normalizeLanguageCode(code);
  return RTL_LANGUAGES.includes(normalized);
}

export const SUPPORTED_LANGUAGES = {
  en: { label: "English", nativeName: "English" },
  hi: { label: "Hindi", nativeName: "हिन्दी" },
};
