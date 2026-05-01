const { translate, languageCodeMap } = require("../config/googleCloud");

// In-memory cache
// Key format: {sourceLang}_{targetLang}_{base64(text)}
const cache = new Map();

// Cache cleanup interval (every 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiry) {
      cache.delete(key);
    }
  }
}, 1000 * 60 * 60);

function getCacheKey(text, sourceLang, targetLang) {
  const cleanText = String(text).trim();
  const b64 = Buffer.from(cleanText).toString("base64");
  return `${sourceLang}_${targetLang}_${b64}`;
}

async function translateWithRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return translateWithRetry(fn, retries - 1, delay * 2);
  }
}

async function translateText(text, targetLang, sourceLang = "en") {
  if (!text || String(text).trim() === "") return text;
  
  const target = languageCodeMap[targetLang] || targetLang;
  const source = languageCodeMap[sourceLang] || sourceLang;
  
  if (target === source) return text;

  const cacheKey = getCacheKey(text, source, target);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.translation;
  }

  try {
    const fn = async () => {
      const [translation] = await translate.translate(text, { from: source, to: target });
      return translation;
    };

    const translation = await translateWithRetry(fn);

    if (translation && translation.trim() !== text.trim()) {
      cache.set(cacheKey, {
        translation,
        expiry: Date.now() + 24 * 60 * 60 * 1000,
      });
    }

    return translation || text;
  } catch (error) {
    console.error(`Translation failed for "${text}":`, error.message);
    return text;
  }
}

async function translateBatch(texts, targetLang, sourceLang = "en") {
  if (!Array.isArray(texts) || texts.length === 0) return texts;

  const target = languageCodeMap[targetLang] || targetLang;
  const source = languageCodeMap[sourceLang] || sourceLang;

  if (target === source) return texts;

  const results = new Array(texts.length);
  const missingIndices = [];
  const missingTexts = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || String(text).trim() === "") {
      results[i] = text;
      continue;
    }

    const cacheKey = getCacheKey(text, source, target);
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      results[i] = cached.translation;
    } else {
      missingIndices.push(i);
      missingTexts.push(text);
    }
  }

  if (missingTexts.length > 0) {
    try {
      const fn = async () => {
        const [translations] = await translate.translate(missingTexts, { from: source, to: target });
        return Array.isArray(translations) ? translations : [translations];
      };

      const translations = await translateWithRetry(fn);

      for (let i = 0; i < missingTexts.length; i++) {
        const original = missingTexts[i];
        const translation = translations[i];
        const index = missingIndices[i];

        results[index] = translation || original;

        if (translation && translation.trim() !== original.trim()) {
          const cacheKey = getCacheKey(original, source, target);
          cache.set(cacheKey, {
            translation,
            expiry: Date.now() + 24 * 60 * 60 * 1000,
          });
        }
      }
    } catch (error) {
      console.error(`Batch translation failed:`, error.message);
      for (let i = 0; i < missingTexts.length; i++) {
        results[missingIndices[i]] = missingTexts[i];
      }
    }
  }

  return results;
}

async function translateObject(obj, targetLang, sourceLang = "en", keysToTranslate = []) {
  if (!obj || typeof obj !== "object") return obj;

  const target = languageCodeMap[targetLang] || targetLang;
  const source = languageCodeMap[sourceLang] || sourceLang;

  if (target === source) return obj;

  const clonedObj = Array.isArray(obj) ? [...obj] : { ...obj };
  const textsToTranslate = [];
  const mapPaths = [];

  const traverse = (current, path = "") => {
    if (!current) return;

    if (Array.isArray(current)) {
      for (let i = 0; i < current.length; i++) {
        traverse(current[i], `${path}[${i}]`);
      }
    } else if (typeof current === "object") {
      for (const key in current) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (keysToTranslate.length > 0 && !keysToTranslate.includes(key)) {
          traverse(current[key], currentPath);
          continue;
        }

        if (typeof current[key] === "string" && current[key].trim() !== "") {
          textsToTranslate.push(current[key]);
          mapPaths.push({ obj: current, key });
        } else {
          traverse(current[key], currentPath);
        }
      }
    }
  };

  traverse(clonedObj);

  if (textsToTranslate.length > 0) {
    const translations = await translateBatch(textsToTranslate, target, source);
    for (let i = 0; i < mapPaths.length; i++) {
      const { obj: targetObj, key } = mapPaths[i];
      targetObj[key] = translations[i];
    }
  }

  return clonedObj;
}

module.exports = {
  translateText,
  translateBatch,
  translateObject,
};
