"use client";

import Navbar from "../../components/Navbar";
import { AnimatedSection, AnimatedCard } from "../../components/AnimatedSection";
import { Mail, ExternalLink, Send, Phone } from "lucide-react";
import { useTranslation } from "../../components/TranslationContext";
import "./contact.css";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      
      <main className="contact-page">
        <AnimatedSection className="section" id="contact-hero" delay={0.1}>
          <div className="contact-container">
            <h1 className="hero-title">
              {t("contact.title_part1")} <span className="gradient-text">{t("contact.title_part2")}</span>
            </h1>
            <p className="hero-description">
              {t("contact.description")}
            </p>

            <div className="contact-grid">
              {/* Direct Contact Methods */}
              <div className="contact-methods">
                <AnimatedCard className="glass-panel contact-method-card" delay={0.2}>
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

                <AnimatedCard className="glass-panel contact-method-card" delay={0.3}>
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

                <AnimatedCard className="glass-panel contact-method-card" delay={0.4}>
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

                <AnimatedCard className="glass-panel contact-method-card" delay={0.5}>
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

                <AnimatedCard className="glass-panel contact-method-card" delay={0.6}>
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
                <AnimatedCard className="glass-panel form-card" delay={0.5}>
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
          </div>
        </AnimatedSection>
      </main>
    </>
  );
}
