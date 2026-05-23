"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import enJson from "../locales/en.json";

type Dictionary = typeof enJson;

interface TranslationContextType {
  language: string;
  loading: boolean;
  t: (key: string) => string;
  changeLanguage: (lang: string) => Promise<void>;
  supportedLanguages: { code: string; name: string; nativeName: string; flag: string }[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Major target languages with high-fidelity support
const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
];

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>("en");
  const [dictionary, setDictionary] = useState<any>(enJson);
  const [loading, setLoading] = useState<boolean>(false);

  // Load language from localStorage or auto-detect browser language
  useEffect(() => {
    const savedLang = localStorage.getItem("preferred_language");
    
    if (savedLang) {
      if (savedLang !== "en") {
        fetchTranslation(savedLang);
      } else {
        setLanguage("en");
        setDictionary(enJson);
      }
    } else {
      // Auto-detect browser locale
      const browserLang = navigator.language?.substring(0, 2).toLowerCase() || "en";
      // We check if the browser language is different from English and fetch translation automatically
      if (browserLang !== "en") {
        fetchTranslation(browserLang);
      }
    }
  }, []);

  const fetchTranslation = async (lang: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/translate?lang=${lang}`);
      if (!response.ok) {
        throw new Error("Failed to fetch translation");
      }
      const data = await response.json();
      setDictionary(data);
      setLanguage(lang);
      localStorage.setItem("preferred_language", lang);
    } catch (err) {
      console.error(`Error loading language ${lang}:`, err);
      // Fallback: use English
      if (lang === "en") {
        setDictionary(enJson);
        setLanguage("en");
      }
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (lang: string) => {
    if (lang === "en") {
      setDictionary(enJson);
      setLanguage("en");
      localStorage.setItem("preferred_language", "en");
      return;
    }
    await fetchTranslation(lang);
  };

  // Helper to resolve dot notation nested keys
  const t = (key: string): string => {
    const parts = key.split(".");
    let current: any = dictionary;
    
    for (const part of parts) {
      if (current == null || typeof current !== "object") {
        current = null;
        break;
      }
      current = current[part];
    }

    if (typeof current === "string") {
      return current;
    }

    // Fallback to English dictionary if the key is missing in translated dictionary
    let englishFallback: any = enJson;
    for (const part of parts) {
      if (englishFallback == null || typeof englishFallback !== "object") {
        englishFallback = null;
        break;
      }
      englishFallback = englishFallback[part];
    }

    if (typeof englishFallback === "string") {
      return englishFallback;
    }

    return key;
  };

  return (
    <TranslationContext.Provider
      value={{
        language,
        loading,
        t,
        changeLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
