"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import enJson from "../locales/en.json";
import koJson from "../locales/ko.json";
import trJson from "../locales/tr.json";
import jaJson from "../locales/ja.json";

interface TranslationContextType {
  language: string;
  loading: boolean;
  t: (key: string) => string;
  changeLanguage: (lang: string) => Promise<void>;
  supportedLanguages: { code: string; name: string; nativeName: string; flag: string }[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Detect language from URL route segment
  let language = "en";
  if (pathname) {
    const segments = pathname.split("/");
    const firstSegment = segments[1] || "";
    if (["en", "ko", "tr", "ja"].includes(firstSegment)) {
      language = firstSegment;
    }
  }

  const loading = false;
  const supportedLanguages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
    { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" }
  ];

  const changeLanguage = async (lang: string) => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      const firstSegment = segments[1] || "";
      
      let targetPath = currentPath;
      if (["en", "ko", "tr", "ja"].includes(firstSegment)) {
        segments[1] = lang;
        targetPath = segments.join("/");
      } else {
        targetPath = `/${lang}${currentPath === "/" ? "" : currentPath}`;
      }
      window.location.href = targetPath;
    }
  };

  // Helper to resolve dot notation nested keys in JSON dictionaries
  const t = (key: string): string => {
    const parts = key.split(".");
    
    // Choose active translation file
    let current: any = enJson;
    if (language === "ko") current = koJson;
    else if (language === "tr") current = trJson;
    else if (language === "ja") current = jaJson;
    
    for (const part of parts) {
      if (current == null || typeof current !== "object") {
        current = null;
        break;
      }
      current = current[part];
    }

    // Fallback to English translation if key is missing in target dictionary
    if (typeof current !== "string" && language !== "en") {
      let fallback: any = enJson;
      for (const part of parts) {
        if (fallback == null || typeof fallback !== "object") {
          fallback = null;
          break;
        }
        fallback = fallback[part];
      }
      if (typeof fallback === "string") return fallback;
    }

    if (typeof current === "string") {
      return current;
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
        supportedLanguages,
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
