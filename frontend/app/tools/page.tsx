"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { Video, ArrowRight, Settings, Phone, Mail, ExternalLink, Send } from "lucide-react";
import { useTranslation } from "../../components/TranslationContext";
import { AnimatedSection, AnimatedCard } from "../../components/AnimatedSection";
import Image from "next/image";

export default function ToolsDashboard() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      
      <main style={{ minHeight: "100vh", paddingTop: "8rem", background: "var(--bg-primary)" }}>
        {/* Tools Section */}
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 6rem 1.5rem" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h1 className="section-title" style={{ marginBottom: "1rem" }}>
              Ali CNC <span className="gradient-text">Tools Suite</span>
            </h1>
            <p className="hero-description" style={{ margin: "0 auto", maxWidth: "600px" }}>
              Advanced CAD/CAM, vector processing, and CNC optimization utilities designed to streamline your workshop workflow.
            </p>
          </div>

          {/* Tools Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: "2rem",
            justifyContent: "center"
          }}>
            {/* SVGV Tool Card */}
            <div className="glass-panel" style={{ 
              padding: "2.5rem", 
              borderRadius: "16px", 
              display: "flex", 
              flexDirection: "column",
              height: "100%",
              transition: "transform 0.3s ease, border-color 0.3s ease",
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.08)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "var(--accent-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            }}
            >
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "10px", 
                background: "rgba(235, 94, 40, 0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "var(--accent-color)"
              }}>
                <Video size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                SVGV Player & Compressor
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Vectorize standard MP4 videos into high-precision CNC G-code paths. Play back, customize simulation density, and manage vectorized previews.
              </p>
              
              <Link href="/tools/svgv" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* Placeholder Card (Coming Soon) */}
            <div className="glass-panel" style={{ 
              padding: "2.5rem", 
              borderRadius: "16px", 
              display: "flex", 
              flexDirection: "column",
              height: "100%",
              opacity: 0.6,
              border: "1px solid rgba(255, 255, 255, 0.05)",
              background: "rgba(255, 255, 255, 0.01)"
            }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "10px", 
                background: "rgba(255, 255, 255, 0.05)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "var(--text-secondary)"
              }}>
                <Settings size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-secondary)" }}>
                G-Code Toolpath Visualizer
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Analyze, simulate, and check 3D CNC toolpaths directly in your browser. Calculate execution run times and detect mechanical interferences.
              </p>
              
              <button disabled className="btn-outline" style={{ 
                width: "100%", 
                cursor: "not-allowed",
                borderColor: "rgba(255,255,255,0.1)"
              }}>
                Coming Soon
              </button>
            </div>

          </div>
        </div>

        {/* Contact Section */}
        <AnimatedSection className="section" id="contact">
          <h2 className="section-title">
            {t("contact.title_part1")} <span className="gradient-text">{t("contact.title_part2")}</span>
          </h2>
          <p className="hero-description" style={{ textAlign: "center", marginBottom: "4rem" }}>
            {t("contact.description")}
          </p>

          <div className="contact-grid">
            {/* Direct Contact Methods */}
            <div className="contact-methods">
              <AnimatedCard className="glass-panel contact-method-card" delay={0.1}>
                <div className="method-icon-wrapper whatsapp">
                  <Phone size={24} />
                </div>
                <div className="method-info">
                  <h3>{t("contact.whatsapp_title")}</h3>
                  <p>{t("contact.whatsapp_desc")}</p>
                  <a href="https://wa.me/923440708494?text=Hi%20,%20I%20am%20coming%20from%20your%20website%20,%20Can%20i%20get%20more%20info%20about%20your%20business%20?" target="_blank" rel="noreferrer" className="btn-primary full-width">
                    {t("contact.whatsapp_action")}
                  </a>
                  <p className="contact-microcopy" style={{ fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.7, marginTop: '0.75rem', lineHeight: '1.4' }}>
                    {t("contact.whatsapp_microcopy")}
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="glass-panel contact-method-card" delay={0.2}>
                <div className="method-icon-wrapper email">
                  <Mail size={24} />
                </div>
                <div className="method-info">
                  <h3>{t("contact.email_title")}</h3>
                  <p>{t("contact.email_desc")}</p>
                  <a href="mailto:thealidevmail@gmail.com" className="btn-outline full-width">
                    thealidevmail@gmail.com
                  </a>
                </div>
              </AnimatedCard>

              <AnimatedCard className="glass-panel contact-method-card" delay={0.3}>
                <div className="method-icon-wrapper cadcrowd">
                  <ExternalLink size={24} />
                </div>
                <div className="method-info">
                  <h3>{t("contact.cadcrowd_title")}</h3>
                  <p>{t("contact.cadcrowd_desc")}</p>
                  <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-outline full-width">
                    {t("contact.cadcrowd_action")}
                  </a>
                </div>
              </AnimatedCard>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <AnimatedCard className="glass-panel form-card" delay={0.3}>
                <h2 className="form-title">{t("contact.form_title")}</h2>
                <form action="https://formspree.io/f/mrejorww" method="POST" className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name">{t("contact.form_name")}</label>
                    <input type="text" id="name" name="name" placeholder={t("contact.form_name_placeholder")} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{t("contact.form_email")}</label>
                    <input type="email" id="email" name="email" placeholder={t("contact.form_email_placeholder")} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">{t("contact.form_subject")}</label>
                    <input type="text" id="subject" name="subject" placeholder={t("contact.form_subject_placeholder")} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">{t("contact.form_message")}</label>
                    <textarea id="message" name="message" rows={5} placeholder={t("contact.form_message_placeholder")} required></textarea>
                  </div>
                  <button type="submit" className="btn-primary submit-btn">
                    <Send size={18} style={{ marginRight: '8px' }} />
                    {t("contact.form_submit")}
                  </button>
                </form>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedSection>

        {/* Footer */}
        <footer id="footer" className="footer">
          <div className="footer-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <Image src="/logo_final.svg" alt="Ali CNC Logo" width={146} height={80} loading="lazy" style={{ margin: '0 auto', opacity: 0.8, objectFit: 'contain', height: 'auto' }} />
            </div>
            <h2 className="footer-title">{t("footer.title")}</h2>
            <p>{t("footer.description")}</p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <a href="#contact" className="btn-primary">{t("footer.contact_btn")}</a>
              <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.8rem 1.5rem' }}>{t("footer.cadcrowd_btn")}</a>
              <a href="https://www.crunchbase.com/organization/ali-cnc-pakistan" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.8rem 1.5rem' }}>{t("footer.crunchbase_btn")}</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
          </div>
        </footer>
      </main>
    </>
  );
}
