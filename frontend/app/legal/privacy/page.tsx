import React from "react";

export const metadata = {
  title: "Privacy Policy | Ali CNC™ Private Limited",
  description: "Official Privacy Policy of Ali CNC™ in compliance with the Prevention of Electronic Crimes Act (PECA 2016) and Personal Data Protection standards in Pakistan."
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
          Effective Date: January 1, 2026 • Last Updated: September 2026 • Compliance: PECA 2016 & Pakistani Data Governance
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          1. Statutory Preamble & Scope
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <b>Ali CNC™ (Ali CNC Private Limited)</b>, an engineering entity incorporated and operating under the laws of the <b>Islamic Republic of Pakistan</b> (having its principal operational base in Rawalpindi & Islamabad, Punjab), respects the privacy of all commercial workshops, enterprise partners, and digital users.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          This Privacy Policy governs the collection, storage, processing, and lawful transfer of personal, commercial, and technical CAD/CAM data in strict compliance with the <b>Prevention of Electronic Crimes Act, 2016 (PECA 2016)</b>, the <b>Electronic Transactions Ordinance, 2002 (ETO 2002)</b>, and emerging data privacy regulations formulated under the auspices of the <b>Ministry of Information Technology and Telecommunication (MoITT)</b> of Pakistan.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          2. Information We Collect
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>We collect the following categories of information exclusively for technical fulfillment, rapid quotation, and digital file dispatch:</p>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li><b>Client Identification Data:</b> Full Name, Company/Workshop Name, Business Email Address (<code style={{ color: "var(--accent-color)" }}>ali@alicnc.pk</code>), and WhatsApp Contact Numbers.</li>
          <li><b>Technical Engineering Files:</b> Proprietary DXF, DWG, STEP, IGES, STL sketches, dimensional constraints, material stock parameters, and CNC controller configurations provided for toolpath generation.</li>
          <li><b>Automated Telemetry & Network Logs:</b> IP addresses, geographic location, browser user-agents, and non-identifying telemetry logged lawfully under Section 32 of PECA 2016 to prevent cyber intrusions and distributed denial-of-service attacks.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          3. Confidentiality of CAD/CAM Blueprints & Trade Secrets
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          All dimensional drawings, proprietary furniture designs, architectural relief models, and raw toolpath files uploaded by clients remain the exclusive confidential property of the client.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          Ali CNC™ enforces strict technical safeguards: client-provided proprietary geometry is never published, re-sold, aggregated into training datasets, or transferred to third parties without express written consent.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          4. Lawful Processing & Communication Channels
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Communications initiated via our official WhatsApp gateway (<code style={{ color: "var(--accent-color)" }}>+92 344 0708494</code>) or integrated Zoho SalesIQ live chat widgets are encrypted in transit. We use client communications strictly for project status handoffs, file dispatch, and post-delivery revision queries.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          5. Data Subject Rights Under Pakistani Law
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Clients and visitors retain statutory rights to:</p>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li>Request a comprehensive summary of all stored personal or corporate records.</li>
          <li>Demand immediate correction or rectification of erroneous contact details.</li>
          <li>Request permanent purging and cryptographic deletion of uploaded CAD source files from our delivery caches following job completion.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          6. Legal Inquiries & Data Protection Officer
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          For formal privacy inquiries, data deletion requests, or regulatory queries under Pakistani jurisdiction, contact our corporate compliance desk at: <a href="mailto:ali@alicnc.pk" style={{ color: "var(--accent-color)", fontWeight: 700 }}>ali@alicnc.pk</a> or reach out to Raja Muhammad Ali Asghar directly at <a href="https://wa.me/923440708494" style={{ color: "var(--accent-color)", fontWeight: 700 }}>+92 344 0708494</a>.
        </p>
      </section>
    </div>
  );
}
