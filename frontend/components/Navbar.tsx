"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslation } from "./TranslationContext";
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
    <>
      <div className="top-contact-bar">
        <div className="top-contact-content">
          <a href="https://wa.me/923440708494?text=Hi%20,%20I%20am%20coming%20from%20your%20website%20,%20Can%20i%20get%20more%20info%20about%20your%20business%20?" target="_blank" rel="noreferrer" className="top-contact-link">
            <Phone size={13} style={{ marginRight: '6px' }} />
            <span>+92 344 0708494</span>
          </a>
          <a href="mailto:thealidevmail@gmail.com" className="top-contact-link">
            <Mail size={13} style={{ marginRight: '6px' }} />
            <span>thealidevmail@gmail.com</span>
          </a>
        </div>
      </div>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-content">
        <Link href="/" className="logo">
          {/* Using the vectorized logo */}
          <div className="logo-img-wrapper">
            <Image src="/logo_final.svg" alt="Ali CNC Logo" width={80} height={44} priority className="logo-img" style={{ width: 'auto', height: '100%' }} />
          </div>
          <span className="logo-text">Ali<span className="gradient-text">CNC</span></span>
        </Link>
        
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="/#services" onClick={() => setMenuOpen(false)}>{t("nav.services")}</a>
          <a href="/#why-choose-us" onClick={() => setMenuOpen(false)}>{t("nav.process")}</a>
          <a href="/#experience" onClick={() => setMenuOpen(false)}>{t("nav.experience")}</a>
          <a href="/#faq" onClick={() => setMenuOpen(false)}>{t("nav.faq")}</a>
          
          <div className="nav-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {mounted && (
              <button 
                className="theme-toggle" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            {/* Globe Switcher Link to Dedicated Korean Page */}
            <a href="/ko" className="lang-link" style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Globe size={16} />
              <span>한국어 (KO)</span>
            </a>
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
  </>
  );
}

