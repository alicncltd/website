import React from "react";
import Link from "next/link";
import { Lock, Scale, ShieldCheck, FileText, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Legal & Regulatory Compliance | Ali CNC™",
  description: "Official Legal, Regulatory & Compliance Index for Ali CNC™ Private Limited under Pakistani Law."
};

const SECTIONS = [
  {
    title: "Privacy Policy",
    href: "/legal/privacy",
    icon: <Lock size={22} />,
    desc: "Strict compliance with Prevention of Electronic Crimes Act (PECA 2016), Electronic Transactions Ordinance 2002, and CAD design confidentiality."
  },
  {
    title: "Terms of Service",
    href: "/legal/terms",
    icon: <Scale size={22} />,
    desc: "Binding digital contract under the Contract Act 1872 of Pakistan, client verification covenants, and limitation of liability."
  },
  {
    title: "Copyright & Intellectual Property",
    href: "/legal/copyright",
    icon: <ShieldCheck size={22} />,
    desc: "Registered rights under Copyright Ordinance 1962, Trade Marks Act 2001 (IPO-Pakistan), and DMCA Certificate ca2521e1-cff3-4a80-b54a-044a66682fdd."
  },
  {
    title: "Commercial CAD/CAM Licensing EULA",
    href: "/legal/license",
    icon: <FileText size={22} />,
    desc: "Commercial manufacturing rights for physical woodworking/machining vs. strict prohibition of raw digital vector reselling."
  },
  {
    title: "Machine Safety & Spindle Disclaimer",
    href: "/legal/disclaimer",
    icon: <AlertTriangle size={22} />,
    desc: "Shop-floor CNC router safety, mandatory air-cut dry run verification, and non-liability for mechanical tool breakage."
  },
  {
    title: "File Revisions & Refund Policy",
    href: "/legal/refunds",
    icon: <RefreshCw size={22} />,
    desc: "Comprehensive 48-Hour Technical Revision SLA, controller post-processor adjustments, and digital delivery terms."
  },
];

export default function LegalIndexPage() {
  return (
    <div>
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Legal & Governance Overview</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "6px", lineHeight: 1.6 }}>
          Official statutory documentation, commercial warranties, and intellectual property registrations governing all transactions, CAD/CAM file deliveries, and digital interactions with <b>Ali CNC™ (Ali CNC Private Limited)</b>.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {SECTIONS.map((sec) => (
          <Link
            key={sec.href}
            href={sec.href}
            className="glass-panel"
            style={{
              padding: "1.75rem",
              borderRadius: "14px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.25s ease"
            }}
          >
            <div>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(235, 94, 40, 0.12)",
                color: "var(--accent-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem"
              }}>
                {sec.icon}
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                {sec.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                {sec.desc}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-color)", fontWeight: 700, fontSize: "0.85rem", marginTop: "1.25rem" }}>
              Read Full Document <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
