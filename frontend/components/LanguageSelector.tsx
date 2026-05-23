"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "./TranslationContext";
import { Globe, Check, Search, Loader2 } from "lucide-react";
import "./LanguageSelector.css";

// Extended list of languages for "More Languages..." search
const EXTRA_LANGUAGES = [
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
];

export default function LanguageSelector() {
  const { language, loading, changeLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSearch(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = async (code: string) => {
    setIsOpen(false);
    setShowSearch(false);
    setSearchQuery("");
    await changeLanguage(code);
  };

  const currentLangObj = 
    supportedLanguages.find(l => l.code === language) || 
    EXTRA_LANGUAGES.find(l => l.code === language) ||
    { code: language, name: language.toUpperCase(), nativeName: language.toUpperCase(), flag: "🌐" };

  // Filter extra languages based on search query
  const filteredLanguages = EXTRA_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="language-selector-container" ref={dropdownRef}>
      <button 
        className={`language-trigger glass-panel ${loading ? "loading-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="animate-spin text-accent" size={16} />
        ) : (
          <span className="lang-flag">{currentLangObj.flag}</span>
        )}
        <span className="lang-label">{currentLangObj.nativeName}</span>
      </button>

      {isOpen && (
        <div className="language-dropdown glass-panel fade-in">
          {!showSearch ? (
            <>
              <div className="dropdown-section-title">Primary Languages</div>
              <ul className="language-list">
                {supportedLanguages.map((lang) => (
                  <li key={lang.code}>
                    <button
                      className={`language-item ${language === lang.code ? "active" : ""}`}
                      onClick={() => handleLanguageSelect(lang.code)}
                    >
                      <span className="lang-flag">{lang.flag}</span>
                      <span className="lang-name-container">
                        <span className="lang-native">{lang.nativeName}</span>
                        <span className="lang-english">{lang.name}</span>
                      </span>
                      {language === lang.code && <Check size={16} className="active-check" />}
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="more-languages-btn"
                onClick={() => setShowSearch(true)}
              >
                <Search size={14} style={{ marginRight: '8px' }} />
                More Languages...
              </button>
            </>
          ) : (
            <div className="search-section">
              <div className="search-header">
                <button className="back-btn" onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                  &larr; Back
                </button>
                <div className="dropdown-section-title" style={{ margin: 0 }}>Search Countries</div>
              </div>
              
              <div className="search-input-wrapper">
                <Search size={14} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="lang-search-input"
                />
              </div>

              <ul className="language-list scrollable">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => (
                    <li key={lang.code}>
                      <button
                        className={`language-item ${language === lang.code ? "active" : ""}`}
                        onClick={() => handleLanguageSelect(lang.code)}
                      >
                        <span className="lang-flag">{lang.flag}</span>
                        <span className="lang-name-container">
                          <span className="lang-native">{lang.nativeName}</span>
                          <span className="lang-english">{lang.name}</span>
                        </span>
                        {language === lang.code && <Check size={16} className="active-check" />}
                      </button>
                    </li>
                  ))
                ) : (
                  <div className="no-results">No languages found</div>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
