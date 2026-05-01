import React, { createContext, useContext, useState, useEffect } from "react";
import { normalizeLanguageCode, isRTLLanguage } from "../utils/languageUtils";
import i18n from "../i18n/i18n"; // Keep in sync for now

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
    // Set text direction for RTL support
    const dir = isRTLLanguage(language) ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = normalizeLanguageCode(language);
    
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
      // Small delay to simulate processing if needed
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const value = {
    language,
    languages: {
      en: { label: "English" },
      hi: { label: "Hindi" },
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
