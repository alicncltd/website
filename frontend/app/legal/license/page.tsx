import React from "react";

export const metadata = {
  title: "Commercial CAD/CAM License & EULA | Ali CNC™",
  description: "Commercial End User Licensing Agreement (EULA) for downloadable 3D relief templates, G-Code files, and custom vectors provided by Ali CNC™."
};

export default function LicenseAgreementPage() {
  return (
    <div style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Commercial CAD/CAM Licensing Agreement</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
          End User License Agreement (EULA) • Standard Single-Workshop Commercial License & Enterprise Multi-Spindle Terms
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          1. Grant of Commercial Manufacturing License
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Upon purchase or commission of custom CAD/CAM design files, 3D relief packages, or G-Code programs from <b>Ali CNC™ (Ali CNC Private Limited)</b>, you are granted a non-exclusive, perpetual, worldwide commercial license to use the digital vectors to manufacture physical products.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          2. Permitted Commercial Uses (What You Can Do)
        </h2>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li><b>Physical CNC Machining:</b> You may run the G-code and vectors on CNC routers, plasma cutters, waterjets, and lasers to carve, profile, and engrave physical workpieces (wood, MDF, acrylic, metals).</li>
          <li><b>Commercial Sale of Physical Goods:</b> You may sell unlimited quantities of the physical carvings, furniture panels, doors, and decorative items produced using the vectors.</li>
          <li><b>Custom In-House Modifications:</b> You may alter dimensions, feeds, speeds, and toolpath depths to match your specific workshop tooling and material stock.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          3. Prohibited Exploitations (What You Cannot Do)
        </h2>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li><b style={{ color: "#ef4444" }}>No Digital Redistribution:</b> You may NOT resell, sub-license, share, donate, or upload the digital vector files (.DXF, .SVG, .STEP, .IGES, .STL, .NC, .TAP) to any public cloud, file-sharing group, torrent network, or stock vector marketplace.</li>
          <li><b style={{ color: "#ef4444" }}>No Direct Vector Reselling:</b> You may not bundle our 3D relief files or parametric models into commercial digital asset packs.</li>
          <li><b style={{ color: "#ef4444" }}>No Trademark Exploitation:</b> You may not brand your physical products with the Ali CNC™ trademark without an explicit enterprise partnership agreement.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          4. Custom Commissioned Works (Work-Made-For-Hire)
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          For bespoke B2B design orders where the Client commissions proprietary 3D CAD modeling from client-supplied concepts or confidential technical sketches, full exclusive copyright in the unique geometry is transferred to the Client upon final settlement of the commissioning invoice.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          5. Termination of License
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Any breach of the digital redistribution prohibitions shall automatically terminate your commercial manufacturing license without prejudice to statutory legal remedies and damages pursued under the Copyright Ordinance 1962 of Pakistan.
        </p>
      </section>
    </div>
  );
}
