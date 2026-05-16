import Navbar from "../components/Navbar";
import { AnimatedSection, AnimatedCard } from "../components/AnimatedSection";
import { PenTool, Cpu, Layers, HardHat, Award, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Home() {
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
            <span className="hero-greeting" style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--accent-color)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Welcome to Ali CNC Pakistan</span>
            <h1 className="hero-title">
              High-Precision <span className="gradient-text">3D Modeling</span> &amp; <br />
              CNC Fabrication Firm
            </h1>
            <p className="hero-description">
              Bridges the gap between digital CAD modeling and physical industrial fabrication. Founded by Raja Muhammad Ali Asghar, Ali CNC Pakistan specializes in 2D/2.5D vector creation, 3D relief modeling, and high-precision CNC manufacturing.
            </p>
            <div className="hero-actions">
              <a href="/contact" className="btn-primary">Start a Project</a>
            </div>
          </div>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection className="section" id="services">
          <h2 className="section-title">Our <span className="gradient-text">Expertise</span></h2>
          <div className="grid-3">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <Layers className="service-icon" size={40} />
              <h3>3D Modeling &amp; CAD Design</h3>
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

        {/* Why Choose Us Section */}
        <AnimatedSection className="section" id="why-choose-us">
          <h2 className="section-title">Why <span className="gradient-text">Ali CNC?</span></h2>
          <div className="grid-3">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <PenTool className="service-icon" size={40} />
              <h3>Precision First</h3>
              <p>Every toolpath is double-checked for accuracy. We specialize in high-detail relief carving where every fraction of a millimeter counts.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <h3>Material Efficiency</h3>
              <p>Our G-Code optimization ensures minimal material waste, saving you costs on expensive hardwoods and industrial materials.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <h3>Hands-on Expertise</h3>
              <p>Led by CEO Raja Muhammad Ali Asghar, who personally operates the machinery to ensure designs translate perfectly to the physical world.</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* FAQ Section */}
        <AnimatedSection className="section" id="faq">
          <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <div className="grid-2">
            <AnimatedCard className="glass-panel service-card" delay={0.1}>
              <h3>What file formats do you provide?</h3>
              <p>We provide CNC-ready files in various formats including .CRV, .DXF, .SVG, .STEP, and optimized G-Code tailored to your specific machine controller.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.2}>
              <h3>What is your typical turnaround time?</h3>
              <p>Turnaround time varies by project complexity. Standard 2D toolpaths often take 24-48 hours, while complex 3D relief models may take 3-5 business days.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.3}>
              <h3>Do you offer design for manufacturing (DFM)?</h3>
              <p>Yes, we optimize every design for manufacturing to reduce material waste, minimize machine time, and ensure zero on-machine errors.</p>
            </AnimatedCard>
            <AnimatedCard className="glass-panel service-card" delay={0.4}>
              <h3>Which software do you specialize in?</h3>
              <p>We are experts in Vectric Aspire for wood fabrication and Onshape for advanced mechanical 3D modeling and CAD design.</p>
            </AnimatedCard>
          </div>
        </AnimatedSection>

        {/* Experience & Education Section */}
        <AnimatedSection className="section" id="experience">
          <h2 className="section-title">Experience &amp; <span className="gradient-text">Certifications</span></h2>
          <div className="experience-container">
            <div className="timeline">
              <AnimatedCard className="timeline-item glass-panel" delay={0.1}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>CEO & Founder</h4>
                  <h5>Ali CNC Pakistan</h5>
                  <p className="timeline-date">May 2026 – Present</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>Led by Raja Muhammad Ali Asghar, specializing in bridging digital design with physical industrial fabrication.</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.2}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>Umer CNC Intern</h4>
                  <h5>Umer CNC</h5>
                  <p className="timeline-date">Sep 2025 – May 2026</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.3}>
                <Award className="timeline-icon" size={24} />
                <div className="timeline-content">
                  <h4>CAD - TITAN-3M &amp; 2M Certificates</h4>
                  <h5>TITANS of CNC: Academy</h5>
                  <p className="timeline-date">Apr 2026 – Present</p>
                </div>
              </AnimatedCard>
              <AnimatedCard className="timeline-item glass-panel" delay={0.4}>
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
            <div style={{ marginBottom: '1.5rem' }}>
              <Image src="/logo_final.png" alt="Ali CNC Logo" width={146} height={80} loading="lazy" style={{ margin: '0 auto', opacity: 0.8, objectFit: 'contain', height: 'auto' }} />
            </div>
            <h2 className="footer-title">Let&apos;s Build Something Amazing</h2>
            <p>Ready to turn your ideas into high-precision reality? Get in touch today.</p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <a href="/contact" className="btn-primary">Contact Us</a>
              <a href="https://www.cadcrowd.com/profile/212733-thealidev" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.8rem 1.5rem' }}>CadCrowd</a>
              <a href="https://www.crunchbase.com/organization/ali-cnc-pakistan" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '0.8rem 1.5rem' }}>Crunchbase</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Ali CNC Pakistan. Based in Rawalpindi, Punjab. High-Precision Engineering & CAD Design.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
