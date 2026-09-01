"use client";

import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import { Cpu, Send, DollarSign, Clock, HelpCircle, ArrowDown } from "lucide-react";
import "./router.css";

interface RouteResult {
  model: string;
  latency: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  text: string;
}

export default function RouterPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [mode, setMode] = useState<"cost" | "quality" | "balance">("balance");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleRoutePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/proxy?endpoint=/api/tools/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Routing execution failed.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Model router is currently offline.");
    } finally {
      setLoading(false);
    }
  };

  const getActiveModelClass = (resultModel: string, target: string) => {
    if (!resultModel) return "";
    return resultModel.toLowerCase().includes(target.toLowerCase()) ? "active" : "";
  };

  return (
    <>
      <Navbar />
      <main className="router-container">
        <header className="router-header">
          <div className="oracle-title-area">
            <h1>Multi-Model AI Router</h1>
            <p>Dynamically evaluates input prompt complexity to select the cost-optimal LLM</p>
          </div>
          <span className="oracle-badge">Orchestrator</span>
        </header>

        <section className="router-grid">
          {/* Input control panel */}
          <form onSubmit={handleRoutePrompt} className="router-card">
            <h2 className="oracle-card-title">
              <Cpu size={18} className="text-sky-500" />
              Prompt Ingestion Gate
            </h2>

            <div className="router-input-group">
              <label htmlFor="prompt">Enter Prompt Query</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask something... e.g. Write a python script to parse CSV files (complex) or Say hello! (simple)"
                className="router-textarea"
                disabled={loading}
              />
            </div>

            <div className="router-input-group">
              <label>Router Optimization Strategy</label>
              <div className="router-options">
                <button
                  type="button"
                  onClick={() => setMode("cost")}
                  className={`router-option-btn ${mode === "cost" ? "active" : ""}`}
                  disabled={loading}
                >
                  Cost-Optimized
                </button>
                <button
                  type="button"
                  onClick={() => setMode("balance")}
                  className={`router-option-btn ${mode === "balance" ? "active" : ""}`}
                  disabled={loading}
                >
                  Balanced
                </button>
                <button
                  type="button"
                  onClick={() => setMode("quality")}
                  className={`router-option-btn ${mode === "quality" ? "active" : ""}`}
                  disabled={loading}
                >
                  Quality-Optimized
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !prompt.trim()} className="oracle-btn">
              {loading ? "Classifying & Routing..." : (
                <>
                  <Send size={16} />
                  Dispatch Query
                </>
              )}
            </button>
          </form>

          {/* Results panel */}
          <section className="router-card">
            <h2 className="oracle-card-title">
              <Clock size={18} className="text-sky-500" />
              Routing Statistics
            </h2>

            {error && (
              <div style={{ color: "#ef4444", padding: "1rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.1)" }}>
                {error}
              </div>
            )}

            {!result && !loading && !error && (
              <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
                <HelpCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p>Dispatch a prompt to view execution costs and model decision flows.</p>
              </div>
            )}

            {loading && (
              <div className="router-node-flow">
                <div className="router-node active">Prompt Intake</div>
                <div className="router-arrow">↓</div>
                <div className="router-node active">Intent Classifier</div>
                <div className="router-arrow">↓</div>
                <div className="router-node">Routing Node...</div>
              </div>
            )}

            {result && (
              <div className="animate-fade-in">
                <div className="router-stats-row">
                  <div className="router-stat-card">
                    <span className="oracle-stat-label">Model Target</span>
                    <span style={{ fontSize: "1rem", fontWeight: "700", display: "block", marginTop: "0.25rem", color: "var(--accent-color)" }}>
                      {result.model.split(" (")[0]}
                    </span>
                  </div>
                  <div className="router-stat-card">
                    <span className="oracle-stat-label">Latency</span>
                    <span className="router-stat-val">
                      {result.latency} ms
                    </span>
                  </div>
                  <div className="router-stat-card">
                    <span className="oracle-stat-label">Cost</span>
                    <span className="router-stat-val" style={{ color: "#10b981" }}>
                      ${result.cost.toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* Routing Flow Visualization */}
                <div className="router-node-flow">
                  <div className="router-node">Intake</div>
                  <div className="router-arrow">↓</div>
                  <div className="router-node">Intent Classifier</div>
                  <div className="router-arrow">↓</div>
                  <div className={`router-node ${getActiveModelClass(result.model, "pro")}`}>
                    Gemini 2.5 Pro (Complex Routing)
                  </div>
                  <div className={`router-node ${getActiveModelClass(result.model, "flash")}`}>
                    Gemini 2.5 Flash (Fast Routing)
                  </div>
                </div>

                <div className="router-input-group" style={{ marginTop: "1rem" }}>
                  <label>Resolved Model Output</label>
                  <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)", padding: "1rem", borderRadius: "12px", minHeight: "100px", fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                    {result.text}
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
