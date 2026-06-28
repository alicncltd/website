"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { Wrench, Video, ArrowRight, Settings } from "lucide-react";
import { useTranslation } from "../../components/TranslationContext";

export default function ToolsDashboard() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      
      <main className="section" style={{ minHeight: "100vh", paddingTop: "8rem", paddingBottom: "4rem", background: "var(--bg-primary)" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h1 className="section-title" style={{ marginBottom: "1rem" }}>
              Ali CNC <span className="gradient-text">Tools Suite</span>
            </h1>
            <p className="hero-description" style={{ margin: "0 auto", maxWidth: "600px" }}>
              Advanced CAD/CAM, vector processing, and CNC optimization utilities designed to streamline your workshop workflow.
            </p>
          </div>

          {/* Tools Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: "2rem",
            justifyContent: "center"
          }}>
            {/* SVGV Tool Card */}
            <div className="glass-panel" style={{ 
              padding: "2.5rem", 
              borderRadius: "16px", 
              display: "flex", 
              flexDirection: "column",
              height: "100%",
              transition: "transform 0.3s ease, border-color 0.3s ease",
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.08)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "var(--accent-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            }}
            >
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "10px", 
                background: "rgba(235, 94, 40, 0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "var(--accent-color)"
              }}>
                <Video size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                SVGV Player & Compressor
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Vectorize standard MP4 videos into high-precision CNC G-code paths. Play back, customize simulation density, and manage vectorized previews.
              </p>
              
              <Link href="/tools/svgv" className="btn-primary" style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}>
                Open Tool <ArrowRight size={16} />
              </Link>
            </div>

            {/* Placeholder Card (Coming Soon) */}
            <div className="glass-panel" style={{ 
              padding: "2.5rem", 
              borderRadius: "16px", 
              display: "flex", 
              flexDirection: "column",
              height: "100%",
              opacity: 0.6,
              border: "1px solid rgba(255, 255, 255, 0.05)",
              background: "rgba(255, 255, 255, 0.01)"
            }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "10px", 
                background: "rgba(255, 255, 255, 0.05)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1.5rem",
                color: "var(--text-secondary)"
              }}>
                <Settings size={26} />
              </div>
              
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-secondary)" }}>
                G-Code Toolpath Visualizer
              </h2>
              
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem", flexGrow: 1 }}>
                Analyze, simulate, and check 3D CNC toolpaths directly in your browser. Calculate execution run times and detect mechanical interferences.
              </p>
              
              <button disabled className="btn-outline" style={{ 
                width: "100%", 
                cursor: "not-allowed",
                borderColor: "rgba(255,255,255,0.1)"
              }}>
                Coming Soon
              </button>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
