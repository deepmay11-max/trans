import React, { createContext, useContext, useState, useEffect } from "react";
import { normalizeLanguageCode, isRTLLanguage } from "../utils/languageUtils";
import i18n from "../i18n/i18n";
import dayjs from 'dayjs';

// Import dayjs locale objects
import hiLocale from 'dayjs/locale/hi';
import guLocale from 'dayjs/locale/gu';
import mrLocale from 'dayjs/locale/mr';
import taLocale from 'dayjs/locale/ta';
import teLocale from 'dayjs/locale/te';
import knLocale from 'dayjs/locale/kn';
import bnLocale from 'dayjs/locale/bn';
import mlLocale from 'dayjs/locale/ml';
import paLocale from 'dayjs/locale/pa-in';

const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app_lang") || "en";
  });
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    const langCode = normalizeLanguageCode(language);
    
    // Set text direction
    const dir = isRTLLanguage(language) ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = langCode;
    
    // Load and set Dayjs locale
    const setupDayjs = () => {
      try {
        const locales = {
          hi: hiLocale,
          gu: guLocale,
          mr: mrLocale,
          ta: taLocale,
          te: teLocale,
          kn: knLocale,
          bn: bnLocale,
          ml: mlLocale,
          pa: paLocale
        };

        if (language === 'en') {
          dayjs.locale('en');
        } else if (locales[language]) {
          // Explicitly register the locale object to avoid import/export conflicts
          const name = language === 'pa' ? 'pa-in' : language;
          dayjs.locale(name, locales[language]);
        }
      } catch (e) {
        console.warn("Dayjs locale load failed", e);
        dayjs.locale('en');
      }
    };

    setupDayjs();

    // Sync with i18n
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const changeLanguage = async (newLang) => {
    setIsChangingLanguage(true);
    try {
      setLanguage(newLang);
      localStorage.setItem("app_lang", newLang);
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const value = {
    language,
    languages: {
      en: { label: "English" },
      hi: { label: "Hindi" },
      gu: { label: "Gujarati" },
      mr: { label: "Marathi" },
      pa: { label: "Punjabi" },
      ta: { label: "Tamil" },
      te: { label: "Telugu" },
      kn: { label: "Kannada" },
      ml: { label: "Malayalam" },
      bn: { label: "Bengali" }
    },
    changeLanguage,
    isChangingLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
