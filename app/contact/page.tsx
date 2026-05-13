"use client";

import Navbar from "../../components/Navbar";
import { AnimatedSection, AnimatedCard } from "../../components/AnimatedSection";
import { Mail, ExternalLink, Send, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      
      <main className="contact-page">
        <AnimatedSection className="section" id="contact-hero" delay={0.1}>
          <div className="contact-container">
            <h1 className="hero-title"><span className="gradient-text">Get in Touch</span></h1>
            <p className="hero-description">
              Have a project in mind? Whether it's a high-precision 3D model or a full CNC production run, I'm ready to help you bring it to life.
            </p>

            <div className="contact-grid">
              {/* Visual Contact Buttons */}
              <div className="contact-methods">
                <AnimatedCard className="glass-panel contact-method-card" delay={0.2}>
                  <div className="method-icon-wrapper whatsapp">
                    <Phone size={24} />
                  </div>
                  <div className="method-info">
                    <h3>WhatsApp</h3>
                    <p>Instant messaging for quick queries</p>
                    <a href="https://wa.me/923440708494?text=Hi%20,%20I%20am%20coming%20from%20your%20website%20,%20Can%20i%20get%20more%20info%20about%20your%20business%20?" target="_blank" rel="noreferrer" className="btn-primary full-width">
                      Message on WhatsApp
                    </a>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="glass-panel contact-method-card" delay={0.3}>
                  <div className="method-icon-wrapper email">
                    <Mail size={24} />
                  </div>
                  <div className="method-info">
                    <h3>Email</h3>
                    <p>Send a detailed project proposal</p>
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
                    <h3>CadCrowd</h3>
                    <p>Official portfolio & hire me platform</p>
                    <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-outline full-width">
                      Visit Profile
                    </a>
                  </div>
                </AnimatedCard>
              </div>

              {/* Contact Form */}
              <div className="contact-form-container">
                <AnimatedCard className="glass-panel form-card" delay={0.5}>
                  <h2 className="form-title">Send a Message</h2>
                  <form action="https://formspree.io/f/mrejorww" method="POST" className="contact-form">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input type="text" id="name" name="name" placeholder="Your Name" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" name="email" placeholder="your@email.com" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input type="text" id="subject" name="subject" placeholder="Project Interest" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea id="message" name="message" rows={5} placeholder="Tell me about your project..." required></textarea>
                    </div>
                    <button type="submit" className="btn-primary submit-btn">
                      <Send size={18} style={{ marginRight: '8px' }} />
                      Send Message
                    </button>
                  </form>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <style jsx>{`
        .contact-page {
          padding-top: 100px;
          min-height: 100vh;
        }
        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-top: 4rem;
          text-align: left;
        }
        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .contact-method-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          align-items: center;
        }
        .method-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .whatsapp { background: #25d366; }
        .email { background: var(--accent-color); }
        .cadcrowd { background: #3a7bd5; }
        
        .method-info { flex: 1; }
        .method-info h3 { margin-bottom: 0.25rem; font-size: 1.25rem; }
        .method-info p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; }
        
        .full-width { width: 100%; }
        
        .form-card {
          padding: 2.5rem;
        }
        .form-title { font-size: 1.75rem; margin-bottom: 2rem; text-align: center; }
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
        }
        .form-group label { font-weight: 500; font-size: 0.9rem; color: var(--text-secondary); }
        .form-group input, .form-group textarea {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: inherit;
          transition: var(--transition-smooth);
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: var(--accent-color);
          background: rgba(255, 255, 255, 0.1);
        }
        .submit-btn {
          margin-top: 1rem;
          font-size: 1.1rem;
          padding: 14px;
          border: none;
        }
        
        @media (max-width: 968px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
