"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { ArrowRight, Settings, Phone, Mail, ExternalLink, Send, TrendingUp, Cpu, Globe, Users, Terminal, Radio } from "lucide-react";
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
              Ali CNC™ <span className="gradient-text">Tools Suite</span>
            </h1>
            <p className="hero-description" style={{ margin: "0 auto 1.5rem", maxWidth: "600px" }}>
              Advanced CAD/CAM, vector processing, and CNC optimization utilities designed to streamline your workshop workflow.
            </p>
            
            {/* Client-Side API Key Config */}
            <div style={{ maxWidth: "500px", margin: "0 auto", padding: "1rem", background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="password"
                placeholder="Enter Gemini API Key (Stored locally in browser)"
                defaultValue={typeof window !== "undefined" ? localStorage.getItem("alicnc_gemini_api_key") || "" : ""}
                onChange={(e) => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("alicnc_gemini_api_key", e.target.value);
                  }
                }}
                style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.5rem 0.8rem", color: "white", fontSize: "0.9rem", outline: "none" }}
              />
              <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600" }}>Local Mode</span>
            </div>
          </div>

          {/* Tools Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: "2rem",
            justifyContent: "center"
          }}>

            {/* Oracle AI Trading Analyst Tool Card */}
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
                <TrendingUp size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                Oracle Trading AI Analyst
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Consult technical indicators, fear/greed sentiment, whale activity, and global geopolitical news aggregated via the Gemini-arbitrated AI Judge.
              </p>
              
              <Link href="/tools/oracle" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* AI Router Tool Card */}
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
                <Cpu size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                Multi-Model AI Router
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Evaluate prompt difficulty and dynamically route requests to the cost-optimal LLM while tracking latency and API usage.
              </p>
              
              <Link href="/tools/router" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* ETL Scraper Tool Card */}
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
                background: "rgba(16, 185, 129, 0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "#10b981"
              }}>
                <Globe size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                ETL Scraper & Crawler
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Concurrently scrape website URLs, run content extraction pipelines, and output structured JSON and downloadable CSV formats.
              </p>
              
              <Link href="/tools/scraper" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* Collaborative Workspace Card */}
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
                background: "rgba(245, 158, 11, 0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "#f59e0b"
              }}>
                <Users size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                Collaborative Sketchboard
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Real-time sketch canvas synchronizing pencil strokes and dynamic user cursor coordinates via active WebSockets.
              </p>
              
              <Link href="/tools/workspace" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* Webhook Payment Sync Engine Card */}
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
                background: "rgba(239, 68, 68, 0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "#ef4444"
              }}>
                <Terminal size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                Webhook Ingestion Simulator
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Simulate Stripe transaction events. Test database idempotency sync locks and manual retry triggers in the Dead-Letter Queue (DLQ).
              </p>
              
              <Link href="/tools/webhook" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* Geopolitical Intel Feed Card */}
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
                <Radio size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                Geopolitical Intel Aggregator
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Pull live global news from Google News, Reuters, Truth Social feeds, and active politician posts, summarized via the Gemini API.
              </p>
              
              <Link href="/tools/news" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* EchoDesk Card */}
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
                background: "rgba(16, 185, 129, 0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "#10b981"
              }}>
                <Phone size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                EchoDesk AI Dispatcher
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Automate inbound client phone calls 24/7. Run interactive speech-to-text, text-to-speech conversations, and sync tickets to CRM.
              </p>
              
              <Link href="/tools/echodesk" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
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
                  <a href="mailto:ali@alicnc.pk" className="btn-outline full-width">
                    ali@alicnc.pk
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
              <Image src="/logo_final.svg" alt="Ali CNC™ Logo" width={146} height={80} loading="lazy" style={{ margin: '0 auto', opacity: 0.8, objectFit: 'contain', height: 'auto' }} />
            </div>
            <h2 className="footer-title">{t("footer.title")}</h2>
            <p>{t("footer.description")}</p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <a href="#contact" className="btn-primary">{t("footer.contact_btn")}</a>
              <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.8rem 1.5rem' }}>{t("footer.cadcrowd_btn")}</a>
              <a href="https://www.crunchbase.com/organization/ali-cnc-pakistan" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.8rem 1.5rem' }}>{t("footer.crunchbase_btn")}</a>
            </div>
          </div>
          <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
            <div style={{ marginTop: '0.2rem' }}>
              <a href="https://www.dmca.com/Protection/Status.aspx?ID=ca2521e1-cff3-4a80-b54a-044a66682fdd" 
                 title="DMCA.com Protection Status" 
                 className="dmca-badge" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{ display: 'inline-block' }}>
                <img src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=ca2521e1-cff3-4a80-b54a-044a66682fdd" 
                     alt="DMCA.com Protection Status" 
                     width={120}
                     height={24}
                     style={{ objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
