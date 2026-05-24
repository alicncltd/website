"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslation } from "./TranslationContext";
import LanguageSelector from "./LanguageSelector";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-content">
        <Link href="/" className="logo">
          {/* Using the vectorized logo */}
          <div className="logo-img-wrapper">
            <Image src="/logo_final.png" alt="Ali CNC Logo" width={80} height={44} priority className="logo-img" style={{ width: 'auto', height: '100%' }} />
          </div>
          <span className="logo-text">Ali<span className="gradient-text">CNC</span></span>
        </Link>
        
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="/#services" onClick={() => setMenuOpen(false)}>{t("nav.services")}</a>
          <a href="/#why-choose-us" onClick={() => setMenuOpen(false)}>{t("nav.process")}</a>
          <a href="/#projects" onClick={() => setMenuOpen(false)}>{t("nav.projects")}</a>
          <a href="/#experience" onClick={() => setMenuOpen(false)}>{t("nav.experience")}</a>
          <a href="/#faq" onClick={() => setMenuOpen(false)}>{t("nav.faq")}</a>
          
          <div className="nav-actions">
            {mounted && (
              <button 
                className="theme-toggle" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            
            <LanguageSelector />
          </div>

          <a href="/#contact" className="btn-primary nav-btn" onClick={() => setMenuOpen(false)}>
            {t("nav.contact")}
          </a>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}

