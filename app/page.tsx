import Navbar from "../components/Navbar";
import { AnimatedSection, AnimatedCard } from "../components/AnimatedSection";
import { PenTool, Cpu, Layers, HardHat, Award, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main>
        {/* WhatsApp Floating Button */}
        <a href="https://wa.me/923440708494" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contact on WhatsApp">
          <svg viewBox="0 0 32 32" width="35" height="35" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.002 2.016c-7.72 0-13.984 6.264-13.984 13.984 0 2.456.632 4.84 1.832 6.952L2.01 29.984l7.184-1.888c2.048 1.104 4.344 1.688 6.808 1.688 7.72 0 13.984-6.264 13.984-13.984S23.722 2.016 16.002 2.016zm0 25.608c-2.128 0-4.208-.568-6.024-1.648l-.432-.256-4.48 1.176 1.192-4.368-.28-.448A11.582 11.582 0 0 1 4.418 16c0-6.392 5.2-11.592 11.592-11.592S27.602 9.608 27.602 16c0 6.392-5.2 11.592-11.6 11.592zm6.368-8.712c-.352-.176-2.072-1.024-2.392-1.144-.32-.12-.552-.176-.784.176-.232.352-.904 1.144-1.104 1.376-.208.232-.416.264-.768.088a9.493 9.493 0 0 1-2.792-1.72 10.457 10.457 0 0 1-1.928-2.4c-.208-.352-.024-.544.152-.72.16-.16.352-.408.528-.616.176-.208.232-.352.352-.584.12-.232.064-.44-.024-.616-.088-.176-.784-1.896-1.072-2.592-.288-.68-.576-.584-.784-.592h-.672c-.232 0-.608.088-.928.44-.32.352-1.224 1.192-1.224 2.904 0 1.712 1.256 3.368 1.432 3.6.176.232 2.456 3.744 5.944 5.248.832.36 1.48.576 1.984.736.832.264 1.592.224 2.192.136.672-.096 2.072-.848 2.36-1.664.288-.816.288-1.52.208-1.664-.08-.152-.312-.24-.664-.416z" />
          </svg>
        </a>

        {/* Hero Section */}
        <AnimatedSection className="hero-section" id="home">
          <img src="/hero_bg.png" alt="" className="hero-bg-image" />
          <div className="hero-content">
            <h2 className="hero-greeting">Hi, I&apos;m Muhammad Ali</h2>
            <h1 className="hero-title">
              High-Precision <span className="gradient-text">3D Modeling</span> & <br />
              CNC Fabrication Specialist
            </h1>
            <p className="hero-description">
              Based in Rawalpindi, Pakistan. Expert in CAD Design, Design for Manufacturing, and CNC Programming. Turning complex ideas into flawless physical products.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn-primary">View My Work</a>
              <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-outline">
                Hire Me on CAD Crowd
              </a>
            </div>
          </div>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection className="section" id="services">
          <h2 className="section-title">My <span className="gradient-text">Expertise</span></h2>
          <div className="grid-3">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <Layers className="service-icon" size={40} />
              <h3>3D Modeling & CAD Design</h3>
              <p>Technical 3D modeling and CNC-ready product design using cutting-edge tools like Onshape and Vectric.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <Cpu className="service-icon" size={40} />
              <h3>CNC Programming</h3>
              <p>Expert programming for precise CNC fabrication, ensuring your designs are perfectly manufactured.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <HardHat className="service-icon" size={40} />
              <h3>Design for Manufacturing</h3>
              <p>Optimizing designs early in the process to reduce costs, improve quality, and speed up production.</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Projects Section */}
        <AnimatedSection className="section" id="projects">
          <h2 className="section-title">Featured <span className="gradient-text">Projects</span></h2>
          <div className="grid-2">
            <AnimatedCard className="glass-panel project-card" delay={0.1}>
              <div className="project-image-wrapper">
                <Image src="/projects_bg.png" alt="Project Network" layout="fill" objectFit="cover" style={{ opacity: 0.5 }} />
                <div className="project-image-placeholder" style={{ position: 'relative', background: 'transparent' }}>
                  <span>Center-Weighted Shaker Whisk</span>
                </div>
              </div>
              <div className="project-content">
                <h3>Photorealistic Cutaway Render</h3>
                <p>Detailed photorealistic cutaway render of a center-weighted shaker whisk, showcasing intricate internal components and manufacturing readiness.</p>
                <a href="https://www.cadcrowd.com/entries/3751-212733-photorealistic-cutaway-render-of-center-weighted" target="_blank" rel="noreferrer" className="project-link">
                  View Entry <ExternalLink size={16} />
                </a>
              </div>
            </AnimatedCard>
            <AnimatedCard className="glass-panel project-card" delay={0.2}>
              <div className="project-image-wrapper">
                <Image src="/services_bg.png" alt="Project Blueprint" layout="fill" objectFit="cover" style={{ opacity: 0.5 }} />
                <div className="project-image-placeholder alt" style={{ position: 'relative', background: 'transparent' }}>
                  <span>Halora Object System</span>
                </div>
              </div>
              <div className="project-content">
                <h3>Modular Premium Object System</h3>
                <p>Design of a modular, premium signature object system for Halora, integrating aesthetics with highly functional mechanical constraints.</p>
                <a href="https://www.cadcrowd.com/entries/3724-212733-design-a-modular-premium-signature-object-system" target="_blank" rel="noreferrer" className="project-link">
                  View Entry <ExternalLink size={16} />
                </a>
              </div>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Experience & Education Section */}
        <AnimatedSection className="section" id="experience">
          <h2 className="section-title">Experience & <span className="gradient-text">Certifications</span></h2>
          <div className="experience-container">
            <div className="timeline">
              <AnimatedCard className="timeline-item glass-panel" delay={0.1}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>Umer CNC Intern</h4>
                  <h5>Umer CNC</h5>
                  <p className="timeline-date">Sep 2025 – Present</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.2}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>CAD - TITAN-3M & 2M Certificates</h4>
                  <h5>TITANS of CNC: Academy</h5>
                  <p className="timeline-date">Apr 2026 – Present</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.3}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>Freelancer Registration</h4>
                  <h5>Pakistan Software Export Board (PSEB)</h5>
                  <p className="timeline-date">Apr 2026 – Present</p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedSection>

        {/* Contact/Footer */}
        <footer id="contact" className="footer">
          <div className="footer-content">
            <h2 className="footer-title">Let&apos;s Build Something Amazing</h2>
            <p>Ready to turn your ideas into high-precision reality? Get in touch today.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-primary">
                Contact Me on CAD Crowd
              </a>
              <a href="https://wa.me/923440708494" target="_blank" rel="noreferrer" className="btn-outline">
                WhatsApp Me
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Ali CNC Pakistan. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
