import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../services/translationService";

export default function TranslatedText({ children, sourceLang = "en" }) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    if (!children || typeof children !== "string") {
      setTranslated(children);
      return;
    }

    async function fetchTranslation() {
      const result = await translateText(children, language, sourceLang);
      setTranslated(result);
    }

    fetchTranslation();
  }, [children, language, sourceLang]);

  return <>{translated}</>;
}
