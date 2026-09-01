import React from "react";

export const metadata = {
  title: "Machine Safety & Spindle Operation Disclaimer | Ali CNC™",
  description: "Shop-floor CNC machine safety covenants, operator verification protocols, and non-liability disclaimers for physical CNC machining."
};

export default function MachineSafetyDisclaimerPage() {
  return (
    <div style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Machine Safety & Spindle Disclaimer</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
          Operational Standard • CNC Router Safety, Workpiece Clamping & Spindle Clearance Protocols
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          1. High-Speed Machining Warning
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          CNC routers and milling machines utilize high-speed rotating spindles operating between <b>12,000 RPM and 24,000 RPM</b>, capable of generating extreme cutting forces and hazardous projectile debris if operated improperly.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          The digital files and G-Code provided by <b>Ali CNC™</b> are mathematically verified for collision-free toolpaths based strictly on client-provided parameters. Physical workshop execution is the sole operational responsibility of the designated machine operator.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          2. Mandatory Pre-Machining Checklist
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Before running any G-Code (.NC, .TAP, .GCODE) file on your machine floor, the operator MUST:</p>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li><b>Verify Workpiece Coordinate Zero (G54/G55):</b> Confirm X0, Y0, and Z0 (top of material vs machine bed) match the setup documentation provided with your file.</li>
          <li><b>Confirm Tooling Geometry:</b> Verify endmill diameter, flute length, ballnose radius, and collet overhang.</li>
          <li><b>Execute Dry-Run Air-Cut:</b> Perform an elevated air pass above the stock to verify toolpath boundaries and clearance heights.</li>
          <li><b>Ensure Secure Fixturing:</b> Check vacuum hold-down pressure, T-slot clamps, or screw tabs to eliminate workpiece shifting during heavy pocketing cuts.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)", marginBottom: "0.75rem" }}>
          3. Absolute Disclaimer of Physical Shop-Floor Damage
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Ali CNC™ and its technical personnel shall not be liable for:
        </p>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          <li>Physical damage to CNC routers, spoilboards, hold-down clamps, or stepper/servo motors.</li>
          <li>Router bit breakage, collet overheating, or thermal tool failure caused by incorrect physical spindle speed override settings.</li>
          <li>Scrap material loss resulting from warped raw timber, uneven stock thickness, or improper operator zeroing.</li>
        </ul>
      </section>
    </div>
  );
}
