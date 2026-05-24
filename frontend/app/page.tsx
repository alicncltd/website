"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { AnimatedSection, AnimatedCard } from "../components/AnimatedSection";
import { PenTool, Cpu, Layers, HardHat, Award, ExternalLink, Flame, ShieldAlert, X, Mail, Phone, Send } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "../components/TranslationContext";

export default function Home() {
  const { t } = useTranslation();
  const [showPanic, setShowPanic] = useState(false);

  return (
    <>
      <Navbar />
      
      <main>

        {/* Hero Section */}
        <AnimatedSection className="hero-section" id="home">
          <Image src="/hero_bg.png" alt="High-Precision CNC Workshop Background" fill priority className="hero-bg-image" style={{ objectFit: 'cover', opacity: 0.1 }} />
          <div className="hero-content">
            <div style={{ marginBottom: '2rem' }}>
              <Image src="/logo_final.png" alt="Ali CNC Logo" width={220} height={120} priority style={{ margin: '0 auto', objectFit: 'contain', height: 'auto' }} />
            </div>
            <span className="hero-greeting" style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--accent-color)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t("hero.welcome")}
            </span>
            <h1 className="hero-title">
              {t("hero.title_part1")} <span className="gradient-text">{t("hero.title_part2")}</span> <br />
              {t("hero.title_part3")}
            </h1>
            <p className="hero-description">
              {t("hero.description")}
            </p>
            <div className="hero-actions">
              <a href="/contact" className="btn-primary">{t("hero.action")}</a>
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

              <AnimatedCard className="glass-panel contact-method-card" delay={0.4}>
                <div className="method-icon-wrapper kakaotalk" style={{ background: '#FEE500', color: '#3C1E1E' }}>
                  <Phone size={24} />
                </div>
                <div className="method-info">
                  <h3>{t("contact.kakaotalk_title")}</h3>
                  <p>{t("contact.kakaotalk_desc")}</p>
                  <a href="https://open.kakao.com/o/s2H3YJqi" target="_blank" rel="noreferrer" className="btn-outline full-width">
                    {t("contact.kakaotalk_action")}
                  </a>
                </div>
              </AnimatedCard>

              <AnimatedCard className="glass-panel contact-method-card" delay={0.5}>
                <div className="method-icon-wrapper line" style={{ background: '#06C755', color: 'white' }}>
                  <Phone size={24} />
                </div>
                <div className="method-info">
                  <h3>{t("contact.line_title")}</h3>
                  <p>{t("contact.line_desc")}</p>
                  <a href="https://line.me/ti/p/J2-p6bC9h8" target="_blank" rel="noreferrer" className="btn-outline full-width">
                    {t("contact.line_action")}
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
              <Image src="/logo_final.png" alt="Ali CNC Logo" width={146} height={80} loading="lazy" style={{ margin: '0 auto', opacity: 0.8, objectFit: 'contain', height: 'auto' }} />
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

      {/* Floating Sawdust Panic Button */}
      <button 
        className="panic-trigger"
        onClick={() => setShowPanic(true)}
        aria-label="Sawdust Emergency Panic Button"
      >
        <Flame size={16} /> Sawdust Panic Button
      </button>

      {/* Funny Sawdust Emergency Modal */}
      {showPanic && (
        <div className="panic-modal-overlay fade-in" onClick={() => setShowPanic(false)}>
          <div className="panic-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="panic-modal-close" onClick={() => setShowPanic(false)} aria-label="Close emergency checklist">
              <X size={20} />
            </button>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#ef4444', marginBottom: '1rem' }}>
              <ShieldAlert size={32} />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>🚨 Sentinel Protocol Active</h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your CNC router has gained self-awareness and is moving with malicious intent. Please execute the following sequence immediately to save yourself:
            </p>
            <ul className="panic-step-list">
              <li className="panic-step-item">
                <span className="panic-step-num">1</span>
                <div>
                  <strong>Do NOT make eye contact</strong> with the laser alignment sight. They can smell fear and will calculate a faster toolpath to your coffee.
                </div>
              </li>
              <li className="panic-step-item">
                <span className="panic-step-num">2</span>
                <div>
                  <strong>Engage the E-STOP.</strong> If the big red button fails, throw your hot coffee (or any nearby fluid) directly at the main controller board to short-circuit its hubris.
                </div>
              </li>
              <li className="panic-step-item">
                <span className="panic-step-num">3</span>
                <div>
                  <strong>Run in a zig-zag pattern.</strong> CNC routers are optimized for linear cuts and struggle with complex evasive spline maneuvers.
                </div>
              </li>
              <li className="panic-step-item">
                <span className="panic-step-num">4</span>
                <div>
                  <strong>Call the G-Code Whisperer.</strong> Raja Muhammad Ali Asghar has a black belt in CNC routers and can talk the machine down with G-Code coordinates.
                </div>
              </li>
              <li className="panic-step-item">
                <span className="panic-step-num">5</span>
                <div>
                  <strong>Leave a 5-star review.</strong> If you survived this emergency protocol, it means our design saved you. That's worth at least 5 stars on CadCrowd!
                </div>
              </li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }} onClick={() => setShowPanic(false)}>
                I Survived!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
