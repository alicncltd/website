import React from "react";

export const metadata = {
  title: "File Revisions & Refund Policy | Ali CNC™",
  description: "Official 48-Hour Technical Revision SLA and digital file delivery return policy for Ali CNC™ CAD/CAM clients."
};

export default function RefundsPolicyPage() {
  return (
    <div style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>File Revisions & Refund Policy</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
          Digital Asset Fulfillment Policy • Guaranteed 48-Hour Revision SLA & Compatibility Protection
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          1. The 48-Hour Free Technical Revision Guarantee
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          At <b>Ali CNC™</b>, we take pride in delivering math-perfect files. Every custom CAD/CAM or G-Code deliverable includes a <b>48-Hour Free Technical Revision Window</b> starting from the moment files are dispatched to your email or WhatsApp.
        </p>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Qualifying free adjustments include:</p>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li>Modifying post-processor syntax to match a different controller (e.g. converting Mach3 .TAP to GRBL .NC).</li>
          <li>Adjusting tool diameter compensations if you switch to a different bit flute size.</li>
          <li>Correcting minor dimensional deviations from your original signed-off CAD brief.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          2. Digital Deliverable Nature & Finality of Sale
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Due to the intangible, non-returnable nature of downloadable digital engineering assets (3D relief packages, G-Code files, and vector blueprints), all sales are considered final once the digital archive has been downloaded or dispatched via WhatsApp/email.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          Refunds are not granted for changes of mind, client machine hardware breakdowns, or projects canceled by the client after engineering work has commenced.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          3. How to Request an Expedited File Adjustment
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          To initiate a rapid file revision, simply reply directly to your delivery WhatsApp thread or email <a href="mailto:ali@alicnc.pk" style={{ color: "var(--accent-color)", fontWeight: 700 }}>ali@alicnc.pk</a> with your order ID, photos of the test air-cut, and the specific controller output adjustment required. Our technical desk responds within 2 hours during active shop operating hours.
        </p>
      </section>
    </div>
  );
}
