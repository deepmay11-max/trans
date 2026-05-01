import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translateBatch } from "../services/translationService";

export function usePageTranslation(staticTexts = [], options = { sourceLang: "en" }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!staticTexts || staticTexts.length === 0) return;

    async function fetchTranslations() {
      setIsTranslating(true);
      try {
        const results = await translateBatch(staticTexts, language, options.sourceLang);
        const map = {};
        staticTexts.forEach((text, i) => {
          map[text] = results[i] || text;
        });
        setTranslations(map);
      } catch (e) {
        console.error("Page translation failed", e);
      } finally {
        setIsTranslating(false);
      }
    }

    fetchTranslations();
  }, [language, JSON.stringify(staticTexts)]);

  const getTranslatedText = (text) => {
    if (language === (options.sourceLang || "en")) return text;
    return translations[text] || text;
  };

  return {
    getTranslatedText,
    isTranslating,
  };
}
