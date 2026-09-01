import React from "react";

export const metadata = {
  title: "Copyright & Intellectual Property Notice | Ali CNC™",
  description: "Official Intellectual Property, Trademark, and Copyright Protection Notice for Ali CNC™ under the Copyright Ordinance 1962 of Pakistan and IPO-Pakistan."
};

export default function CopyrightNoticePage() {
  return (
    <div style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Copyright & Intellectual Property</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
          Statutory Framework: Copyright Ordinance 1962 • Trade Marks Act 2001 (IPO-Pakistan) • DMCA Status ID: ca2521e1-cff3-4a80-b54a-044a66682fdd
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          1. Proprietary Rights & Ownership Declaration
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          All original vector geometry, parametric 3D CAD models, proprietary G-code toolpath sequences, mathematical curve interpolation routines, website UI components, branding insignias, and technical documentation published under the <b>Ali CNC™</b> banner are the exclusive intellectual property of <b>Ali CNC Private Limited</b> and <b>Raja Muhammad Ali Asghar</b>.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          These works are protected under the <b>Copyright Ordinance, 1962</b> and the <b>Registered Designs Ordinance, 2000</b> as administered by the <b>Intellectual Property Organization of Pakistan (IPO-Pakistan)</b>, as well as reciprocal international treaties including the <b>Berne Convention for the Protection of Literary and Artistic Works</b>.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          2. Trademarks & Brand Nomenclature
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          The names <b style={{ color: "var(--text-primary)" }}>"Ali CNC"</b>, <b style={{ color: "var(--text-primary)" }}>"Ali CNC™"</b>, the corporate stylized vector emblem, and the registered operational motto:
        </p>
        <blockquote style={{
          borderLeft: "3px solid var(--accent-color)",
          paddingLeft: "1rem",
          margin: "1rem 0",
          fontStyle: "italic",
          color: "var(--text-primary)",
          fontWeight: 600
        }}>
          "We design the math. You run the spin.™"
        </blockquote>
        <p style={{ color: "var(--text-secondary)" }}>
          are protected trademarks in Pakistan under the <b>Trade Marks Act, 2001</b>. Unauthorized use, imitation, or deceptive misrepresentation of these marks is strictly prohibited and subject to civil injunctions and criminal penalties.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          3. DMCA.com Registered Protection & Takedown Protocol
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          The digital assets, 3D relief catalog, and vector architectures across <code style={{ color: "var(--accent-color)" }}>alicnc.pk</code> are actively monitored and certified under <b>DMCA.com Protection Status Certificate ID: <code style={{ color: "var(--accent-color)" }}>ca2521e1-cff3-4a80-b54a-044a66682fdd</code></b>.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          Any third-party platform, file-sharing depository, or torrent index found distributing pirated copies of Ali CNC™ 3D relief models or proprietary toolpath sequences will be served immediate expedited statutory takedown notices under the Digital Millennium Copyright Act and PECA 2016.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          4. Notice of Copyright Infringement Claims
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          If you believe in good faith that any content hosted on our digital portal infringes upon your copyright, please send a formal written notice containing:
        </p>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li>A description of the copyrighted work claimed to have been infringed.</li>
          <li>Specific URL / identification of the allegedly infringing material.</li>
          <li>Your contact details and a statement of good faith belief under oath.</li>
        </ul>
        <p style={{ color: "var(--text-secondary)" }}>
          Direct IP infringement notices to our IP compliance desk: <a href="mailto:ali@alicnc.pk" style={{ color: "var(--accent-color)", fontWeight: 700 }}>ali@alicnc.pk</a>.
        </p>
      </section>
    </div>
  );
}
