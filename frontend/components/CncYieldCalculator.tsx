"use client";

import React, { useState } from "react";
import { Calculator, Zap, ShieldCheck, Clock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslation } from "./TranslationContext";

interface MaterialOption {
  id: string;
  name: string;
  density: string;
  recommendedBit: string;
  timeSavings: string;
  wasteReduction: string;
}

const MATERIALS: MaterialOption[] = [
  { id: "hardwood", name: "Solid Hardwood (Oak, Walnut, Teak)", density: "Dense / Grain-sensitive", recommendedBit: "2-Flute Downcut Spiral Carbide", timeSavings: "28%", wasteReduction: "22%" },
  { id: "plywood", name: "Plywood / MDF Sheet Goods", density: "Composite / Sheet", recommendedBit: "Compression Spiral (Clean top & bottom)", timeSavings: "35%", wasteReduction: "30%" },
  { id: "acrylic", name: "Cast Acrylic / Perspex", density: "Thermoplastic / Heat-sensitive", recommendedBit: "Single O-Flute Upcut (Zero chip weld)", timeSavings: "25%", wasteReduction: "18%" },
  { id: "aluminum", name: "6061-T6 Soft Aluminum", density: "Non-ferrous metal", recommendedBit: "Single-Flute ZrN Coated Endmill", timeSavings: "40%", wasteReduction: "15%" },
];

export default function CncYieldCalculator() {
  const { t } = useTranslation();
  const [materialId, setMaterialId] = useState<string>("hardwood");
  const [sheetSize, setSheetSize] = useState<string>("4x8");
  const [jobType, setJobType] = useState<string>("nesting");

  const selectedMaterial = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];

  const getEstimatedMetrics = () => {
    let multiplier = 1.0;
    if (jobType === "3d_relief") multiplier = 1.4;
    if (jobType === "pocket_drill") multiplier = 1.1;

    const baseSavings = parseInt(selectedMaterial.timeSavings, 10);
    const calculatedSavings = Math.min(50, Math.round(baseSavings * multiplier));

    return {
      savings: `${calculatedSavings}%`,
      waste: selectedMaterial.wasteReduction,
      turnaround: jobType === "3d_relief" ? "3 - 5 Days" : "24 - 48 Hours",
      bit: selectedMaterial.recommendedBit
    };
  };

  const metrics = getEstimatedMetrics();

  const getWhatsAppQuoteUrl = () => {
    const jobName = jobType === "nesting" ? "2D Contour & Nesting" : jobType === "3d_relief" ? "3D Relief Carving" : "2.5D Pocket & Drilling";
    const text = encodeURIComponent(
      `Hi Raja Ali! I calculated a project on Ali CNC™:\n` +
      `• Material: ${selectedMaterial.name}\n` +
      `• Stock Size: ${sheetSize === "4x8" ? "4x8 ft (1220x2440mm)" : sheetSize === "5x10" ? "5x10 ft (1500x3000mm)" : "Custom Lumber Slabs"}\n` +
      `• Job Type: ${jobName}\n` +
      `Can you review my requirements and provide a B2B file quote?`
    );
    return `https://wa.me/923440708494?text=${text}`;
  };

  return (
    <div className="glass-panel" style={{
      padding: "2.5rem 2rem",
      borderRadius: "20px",
      margin: "3rem auto",
      maxWidth: "1000px",
      border: "1px solid rgba(235, 94, 40, 0.25)",
      background: "radial-gradient(circle at 10% 10%, rgba(235, 94, 40, 0.08) 0%, rgba(15, 15, 18, 0.85) 100%)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
    }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
          marginBottom: "0.8rem"
        }}>
          <Sparkles size={14} /> Interactive Shop-Floor Yield Calculator
        </div>
        <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Estimate Your <span className="gradient-text">G-Code Efficiency & Material Yield</span>
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "650px", margin: "0.5rem auto 0" }}>
          Select your raw material stock and toolpath type to preview machine cycle-time reductions and scrap savings engineered by Ali CNC™.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
        alignItems: "stretch"
      }}>
        {/* Controls Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              1. Raw Material Type
            </label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id} style={{ background: "#1c1917", color: "#fafaf9" }}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              2. Stock Sheet Dimensions
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {[
                { id: "4x8", label: "4 × 8 ft" },
                { id: "5x10", label: "5 × 10 ft" },
                { id: "custom", label: "Custom Slabs" }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSheetSize(s.id)}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: "8px",
                    border: sheetSize === s.id ? "1px solid var(--accent-color)" : "1px solid rgba(255, 255, 255, 0.1)",
                    background: sheetSize === s.id ? "rgba(235, 94, 40, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    color: sheetSize === s.id ? "var(--accent-color)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              3. Toolpath & Job Scope
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {[
                { id: "nesting", label: "2D Nesting" },
                { id: "pocket_drill", label: "2.5D Pockets" },
                { id: "3d_relief", label: "3D Relief" }
              ].map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setJobType(j.id)}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: "8px",
                    border: jobType === j.id ? "1px solid var(--accent-color)" : "1px solid rgba(255, 255, 255, 0.1)",
                    background: jobType === j.id ? "rgba(235, 94, 40, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    color: jobType === j.id ? "var(--accent-color)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div style={{
          background: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em", fontWeight: 700 }}>
              Calculated CNC Optimizations
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--accent-color)", fontSize: "0.75rem", fontWeight: 700 }}>
                  <Zap size={14} /> Cycle-Time Saved
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
                  ~{metrics.savings}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--accent-color)", fontSize: "0.75rem", fontWeight: 700 }}>
                  <ShieldCheck size={14} /> Waste Reduction
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
                  ~{metrics.waste}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <CheckCircle2 size={13} style={{ color: "var(--accent-color)" }} />
                <span><b>Recommended Bit:</b> {metrics.bit}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={13} style={{ color: "var(--accent-color)" }} />
                <span><b>Turnaround Window:</b> {metrics.turnaround}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <a
              href={getWhatsAppQuoteUrl()}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "0.8rem 1rem",
                fontSize: "0.9rem"
              }}
            >
              Transfer Specs to WhatsApp <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
