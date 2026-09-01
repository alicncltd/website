import React from "react";

export const metadata = {
  title: "Terms of Service | Ali CNC™ Private Limited",
  description: "Official Terms and Conditions of Service governing CAD/CAM drafting, G-Code programming, and digital file delivery under Pakistani law."
};

export default function TermsOfServicePage() {
  return (
    <div style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
          Effective Date: January 1, 2026 • Governing Law: Islamic Republic of Pakistan (Contract Act 1872 & ETO 2002)
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          1. Binding Agreement & Acceptance of Terms
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          These Terms of Service constitute a legally enforceable digital contract between you (the "Client", "Machinist", or "User") and <b>Ali CNC™ (Ali CNC Private Limited)</b>, represented by Founder & CEO <b>Raja Muhammad Ali Asghar</b>.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          By accessing <code style={{ color: "var(--accent-color)" }}>alicnc.pk</code>, initiating a CAD/CAM order, downloading 3D relief model templates, or transferring technical design files via our WhatsApp gateway, you unconditionally agree to be bound by these terms pursuant to the <b>Contract Act, 1872</b> and the <b>Electronic Transactions Ordinance, 2002</b> of Pakistan.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          2. Nature of Virtual CAD/CAM Engineering Services
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Ali CNC™ operates as a specialized virtual CAD/CAM file design and G-Code compilation engineering studio. Our core services include:</p>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li>2D and 3D CAD modeling, digital vector cleanup, and curve smoothing (.DXF, .SVG, .STEP, .IGES, .STL).</li>
          <li>CNC Toolpath programming and machine-specific G-Code post-processing (.NC, .TAP, .GCODE) configured for specified machine controllers (Mach3/4, GRBL, Syntec, Fanuc, LinuxCNC).</li>
          <li>Design for Manufacturability (DFM) auditing, safe stepover calculation, and scrap-reducing sheet nesting arrays.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          3. Client Obligations & Machine Verification Duty
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          While Ali CNC™ engineers toolpaths with extreme precision (±0.001 mm tolerance standards), the Client acknowledges that physical CNC router execution involves mechanical variables (spindle runout, tool wear, workpiece clamping, stock warping).
        </p>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <b>The Mandatory Dry-Run Covenant:</b> The Client agrees to conduct a physical dry-run (Z-axis raised above workpiece) or CAM toolpath simulation prior to initiating full-depth spindle plunge cutting on any physical machine.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          4. Commercial Payment Terms & Currency
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Quotations are denominated in Pakistani Rupees (PKR) for domestic commercial workshops or United States Dollars (USD) for international export clients. Payment must be cleared prior to final high-resolution vector and G-Code file dispatch, unless an approved B2B corporate credit agreement exists.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          5. Limitation of Liability
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          To the maximum extent permitted under the laws of Pakistan, Ali CNC™ and its officers shall not be held liable for indirect, incidental, or consequential damages resulting from shop-floor mechanical collisions, router bit breakage, raw lumber spoilage, or incorrect operator machine coordinate zeroing (G54/G55).
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          In all events, the maximum aggregate liability of Ali CNC™ for any claim arising out of a specific engineering job shall not exceed the total fees paid by the Client for that specific digital design deliverable.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          6. Governing Law & Dispute Resolution Jurisdiction
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          This agreement is governed by, construed, and enforced in accordance with the substantive laws of the <b>Islamic Republic of Pakistan</b>.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          Any legal disputes, controversies, or claims arising out of or relating to these terms shall be resolved primarily through amicable mediation. Failing resolution within thirty (30) days, disputes shall be submitted to the exclusive jurisdiction of the competent civil courts located in <b>Rawalpindi / Islamabad, Pakistan</b>, pursuant to the <b>Arbitration Act, 1940</b>.
        </p>
      </section>
    </div>
  );
}
