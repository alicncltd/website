import React from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { ShieldCheck, FileText, Lock, Scale, AlertTriangle, RefreshCw, ChevronRight, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Legal Center | Ali CNC™ Private Limited",
  description: "Official legal compliance, privacy policies, terms of service, commercial licensing agreements, and intellectual property notices under the laws of the Islamic Republic of Pakistan."
};

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy", icon: <Lock size={16} />, desc: "Data protection & PECA 2016 compliance" },
  { href: "/legal/terms", label: "Terms of Service", icon: <Scale size={16} />, desc: "Pakistani jurisdiction & contract terms" },
  { href: "/legal/copyright", label: "Copyright & IP Notice", icon: <ShieldCheck size={16} />, desc: "IPO-Pakistan & DMCA registered rights" },
  { href: "/legal/license", label: "Commercial EULA", icon: <FileText size={16} />, desc: "CAD/CAM blueprint & toolpath license" },
  { href: "/legal/disclaimer", label: "Machine Safety Disclaimer", icon: <AlertTriangle size={16} />, desc: "Spindle operation & shop-floor safety" },
  { href: "/legal/refunds", label: "Revisions & Refunds", icon: <RefreshCw size={16} />, desc: "Virtual delivery & 48h SLA policy" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ paddingTop: "7.5rem", paddingBottom: "5rem", flexGrow: 1 }}>
        <div className="container" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem" }}>
          
          {/* Header Banner */}
          <div style={{
            background: "radial-gradient(circle at 50% 0%, rgba(235, 94, 40, 0.12) 0%, rgba(24, 24, 27, 0.8) 100%)",
            border: "1px solid rgba(235, 94, 40, 0.25)",
            borderRadius: "20px",
            padding: "2.5rem 2rem",
            marginBottom: "2.5rem",
            backdropFilter: "blur(16px)"
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(235, 94, 40, 0.12)",
              border: "1px solid rgba(235, 94, 40, 0.3)",
              color: "var(--accent-color)",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.75rem"
            }}>
              <Scale size={14} /> Islamic Republic of Pakistan • Legal & Regulatory Framework
            </div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Ali CNC™ <span className="gradient-text">Legal, Compliance & IP Center</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "800px", marginTop: "0.5rem", lineHeight: 1.6 }}>
              Comprehensive legal covenants, data protection notices, commercial CAD/CAM licensing terms, and intellectual property registrations governing Ali CNC™ Private Limited.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem", alignItems: "start" }}>
            
            {/* Sidebar Navigation */}
            <aside className="glass-panel" style={{ padding: "1.5rem", borderRadius: "16px", position: "sticky", top: "6rem" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", fontWeight: 700, marginBottom: "1rem" }}>
                Legal Documents
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 0.85rem",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--accent-color)" }}>{link.icon}</span>
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  </Link>
                ))}
              </div>

              <div style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <div><b>Registered Corporate Base:</b></div>
                <div style={{ marginTop: "4px" }}>Rawalpindi & Islamabad, Punjab, Pakistan</div>
                <div style={{ marginTop: "1rem" }}>
                  <a
                    href="https://wa.me/923440708494?text=Legal%20or%20Compliance%20Inquiry%20regarding%20Ali%20CNC"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--accent-color)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 700 }}
                  >
                    Contact Legal Counsel <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </aside>

            {/* Document Content */}
            <article className="glass-panel" style={{ padding: "3rem 2.5rem", borderRadius: "16px" }}>
              {children}
            </article>

          </div>

        </div>
      </div>

    </div>
  );
}
