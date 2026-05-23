"use client";

import Navbar from "../components/Navbar";
import { AnimatedSection, AnimatedCard } from "../components/AnimatedSection";
import { PenTool, Cpu, Layers, HardHat, Award, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "../components/TranslationContext";

export default function Home() {
  const { t } = useTranslation();

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

        {/* Contact/Footer */}
        <footer id="contact" className="footer">
          <div className="footer-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <Image src="/logo_final.png" alt="Ali CNC Logo" width={146} height={80} loading="lazy" style={{ margin: '0 auto', opacity: 0.8, objectFit: 'contain', height: 'auto' }} />
            </div>
            <h2 className="footer-title">{t("footer.title")}</h2>
            <p>{t("footer.description")}</p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <a href="/contact" className="btn-primary">{t("footer.contact_btn")}</a>
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
