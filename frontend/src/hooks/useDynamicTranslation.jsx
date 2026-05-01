import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText, translateBatch, translateObject } from "../services/translationService";

export function useDynamicTranslation(options = { sourceLang: "en" }) {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async (text) => {
    setIsTranslating(true);
    try {
      return await translateText(text, language, options.sourceLang);
    } finally {
      setIsTranslating(false);
    }
  };

  const batch = async (texts) => {
    setIsTranslating(true);
    try {
      return await translateBatch(texts, language, options.sourceLang);
    } finally {
      setIsTranslating(false);
    }
  };

  const obj = async (targetObj, keysToTranslate = []) => {
    setIsTranslating(true);
    try {
      return await translateObject(targetObj, language, options.sourceLang, keysToTranslate);
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    translateBatch: batch,
    translateObject: obj,
    isTranslating,
  };
}
