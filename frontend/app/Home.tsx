"use client";

import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import { AnimatedSection, AnimatedCard } from "../components/AnimatedSection";
import { PenTool, Cpu, Layers, HardHat, Award, ExternalLink, Mail, Phone, Send, ShieldCheck, Zap, Sparkles, CheckCircle2, Compass, Check } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "../components/TranslationContext";
import CncYieldCalculator from "../components/CncYieldCalculator";

export default function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    // Silent background visitor traffic analytics tracking for global users
    fetch("/api/proxy?endpoint=/api/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname })
    }).catch((err) => console.error("Silent analytics tracking failed:", err));
  }, []);

  return (
    <>
      <Navbar />
      
      <main>

        {/* Hero Section */}
        <AnimatedSection className="hero-section" id="home">
          <Image src="/hero_bg.png" alt="High-Precision CNC Workshop Background" fill priority className="hero-bg-image" style={{ objectFit: 'cover', opacity: 0.08 }} />
          <div className="hero-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <Image src="/logo_final.svg" alt="Ali CNC™ Logo" width={220} height={120} priority style={{ margin: '0 auto', objectFit: 'contain', height: 'auto' }} />
            </div>

            {/* Live Status Pill */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'rgba(235, 94, 40, 0.12)',
                border: '1px solid rgba(235, 94, 40, 0.35)',
                color: 'var(--accent-color)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }}></span>
                {t("hero.welcome")}
              </div>
            </div>

            <h1 className="hero-title">
              {t("hero.title_part1")} <span className="gradient-text">{t("hero.title_part2")}</span> <br />
              {t("hero.title_part3")}
            </h1>

            <p className="hero-description">
              {t("hero.description")}
            </p>

            {/* Hero Quick Proof Metric Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
              margin: '1.75rem auto',
              maxWidth: '850px'
            }}>
              {[
                { icon: <Zap size={14} />, label: "24-48h Rapid Delivery" },
                { icon: <ShieldCheck size={14} />, label: "±0.001mm Tolerance Guarantee" },
                { icon: <Compass size={14} />, label: "100% Spindle-Crash Tested" },
                { icon: <Check size={14} />, label: "Zero-Waste Nesting" }
              ].map((pill, idx) => (
                <div key={idx} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>
                  <span style={{ color: 'var(--accent-color)' }}>{pill.icon}</span>
                  <span>{pill.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/#contact" className="btn-primary">{t("hero.action")}</a>
              <a href="/tools" className="btn-outline" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
                Explore Digital Tools <ExternalLink size={16} style={{ marginLeft: '6px' }} />
              </a>
            </div>

            {/* Compatibility Strip */}
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                Directly Programmed For Leading CAD/CAM & Controller Ecosystems
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {["Vectric Aspire", "AutoCAD", "Onshape", "Fusion 360", "Mach3 / Mach4", "GRBL", "Syntec", "Fanuc", "RichAuto DSP", "LinuxCNC"].map((eco, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {eco}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection className="section" id="services">
          <h2 className="section-title">{t("services.title_part1")} <span className="gradient-text">{t("services.title_part2")}</span></h2>
          <div className="grid-3">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <Layers className="service-icon" size={40} />
              <h3>{t("services.cad_title")}</h3>
              <p>{t("services.cad_desc")}</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <Cpu className="service-icon" size={40} />
              <h3>{t("services.cnc_title")}</h3>
              <p>{t("services.cnc_desc")}</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <HardHat className="service-icon" size={40} />
              <h3>{t("services.dfm_title")}</h3>
              <p>{t("services.dfm_desc")}</p>
            </AnimatedCard>
          </div>

          {/* Interactive G-Code Yield & Material Calculator */}
          <CncYieldCalculator />
        </AnimatedSection>

        {/* Digital Tools Workspace Mention Section */}
        <AnimatedSection className="section" id="workspace-tools">
          <div style={{ background: "rgba(9, 13, 22, 0.3)", borderTop: "1px solid rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.02)", padding: "4rem 1.5rem", borderRadius: "16px" }}>
            <h2 className="section-title">
              Advanced <span className="gradient-text">CAD/CAM & AI Utilities</span>
            </h2>
            <p className="hero-description" style={{ textAlign: "center", marginBottom: "4rem" }}>
              In addition to expert digital blueprints, we provide workshop operators with interactive browser-native utilities to simulate, audit, and automate CNC jobs locally.
            </p>

            <div className="grid-3">
              <AnimatedCard className="glass-panel service-card" delay={0.1}>
                <h3>EchoDesk AI Voice Dispatcher</h3>
                <p>Simulate 24/7 inbound shop phone calls using local browser speech-to-text, text-to-speech, and automatic CRM ticket booking.</p>
              </AnimatedCard>
              <AnimatedCard className="glass-panel service-card" delay={0.2}>
                <h3>Oracle AI Quant Engine</h3>
                <p>Monitor cryptocurrency spot price action and compute key indicators (RSI, EMA, VWAP) via backend AI quantitative audits.</p>
              </AnimatedCard>
              <AnimatedCard className="glass-panel service-card" delay={0.3}>
                <h3>Multi-Model AI Router</h3>
                <p>Instantly evaluate design prompts and token costs to route calculations to optimal LLM execution paths locally.</p>
              </AnimatedCard>
            </div>

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <a href="/tools" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Access Digital Tools Suite <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </AnimatedSection>

        {/* Why Choose Us Section */}
        <AnimatedSection className="section" id="why-choose-us">
          <h2 className="section-title">{t("why_choose.title_part1")} <span className="gradient-text">{t("why_choose.title_part2")}</span></h2>
          <div className="grid-3">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <PenTool className="service-icon" size={40} />
              <h3>{t("why_choose.precision_title")}</h3>
              <p>{t("why_choose.precision_desc")}</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <h3>{t("why_choose.efficiency_title")}</h3>
              <p>{t("why_choose.efficiency_desc")}</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <h3>{t("why_choose.expertise_title")}</h3>
              <p>{t("why_choose.expertise_desc")}</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* FAQ Section */}
        <AnimatedSection className="section" id="faq">
          <h2 className="section-title">{t("faq.title_part1")} <span className="gradient-text">{t("faq.title_part2")}</span></h2>
          <div className="grid-2">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <h3>{t("faq.q1_title")}</h3>
              <p>{t("faq.q1_desc")}</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <h3>{t("faq.q2_title")}</h3>
              <p>{t("faq.q2_desc")}</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <h3>{t("faq.q3_title")}</h3>
              <p>{t("faq.q3_desc")}</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.4}>
              <h3>{t("faq.q4_title")}</h3>
              <p>{t("faq.q4_desc")}</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Experience & Education Section */}
        <AnimatedSection className="section" id="experience">
          <h2 className="section-title">{t("experience.title_part1")} <span className="gradient-text">{t("experience.title_part2")}</span></h2>
          <div className="experience-container">
            <div className="timeline">
              <AnimatedCard className="timeline-item glass-panel" delay={0.05}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>{t("experience.role0_title")}</h4>
                  <h5>{t("experience.role0_subtitle")}</h5>
                  <p className="timeline-date">{t("experience.role0_date")}</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>{t("experience.role0_desc")}</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.1}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>{t("experience.role1_title")}</h4>
                  <h5>{t("experience.role1_subtitle")}</h5>
                  <p className="timeline-date">{t("experience.role1_date")}</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>{t("experience.role1_desc")}</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.2}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>{t("experience.role2_title")}</h4>
                  <h5>{t("experience.role2_subtitle")}</h5>
                  <p className="timeline-date">{t("experience.role2_date")}</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.3}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>{t("experience.role3_title")}</h4>
                  <h5>{t("experience.role3_subtitle")}</h5>
                  <p className="timeline-date">{t("experience.role3_date")}</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.4}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>{t("experience.role4_title")}</h4>
                  <h5>{t("experience.role4_subtitle")}</h5>
                  <p className="timeline-date">{t("experience.role4_date")}</p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedSection>

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
