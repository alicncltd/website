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

    const start = Date.now();
    let chosenModel = "gemini-2.0-flash";
    let modelLabel = "Gemini 2.0 Flash (Fast/Cheap)";
    let costPerMillionInput = 0.075;
    let costPerMillionOutput = 0.30;

    const promptLower = prompt.toLowerCase();
    const isComplex = prompt.length > 100 || 
                      promptLower.includes("explain") || 
                      promptLower.includes("code") || 
                      promptLower.includes("program") || 
                      promptLower.includes("architect") ||
                      mode === "quality";

    if (isComplex && mode !== "cost") {
      chosenModel = "gemini-2.5-pro";
      modelLabel = "Gemini 2.5 Pro (Complex Reasoning)";
      costPerMillionInput = 1.25;
      costPerMillionOutput = 5.00;
    }

    const localApiKey = typeof window !== "undefined" ? localStorage.getItem("alicnc_gemini_api_key") || "" : "";

    if (localApiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${localApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (!res.ok) {
          throw new Error(`API returned status ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Empty response.";
        const inputTokens = Math.ceil(prompt.length / 4);
        const outputTokens = Math.ceil(text.length / 4);
        const cost = ((inputTokens * costPerMillionInput) + (outputTokens * costPerMillionOutput)) / 1000000;

        setResult({
          model: modelLabel,
          latency: Date.now() - start,
          cost: Number(cost.toFixed(6)),
          inputTokens,
          outputTokens,
          text
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to contact Gemini API directly from browser.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulate local heuristic routing response
      setTimeout(() => {
        const mockResponse = `[Local Simulation Mode - Enter Gemini API Key on Tools page for real answers]
Heuristics evaluated:
- Prompt length: ${prompt.length} characters
- Complexity flag: ${isComplex ? "COMPLEX" : "SIMPLE"}
- Strategy selected: ${mode.toUpperCase()}

Simulated Response content resolving query: "${prompt.substring(0, 40)}..."
This is a client-side mockup generated instantly.`;

        const inputTokens = Math.ceil(prompt.length / 4);
        const outputTokens = Math.ceil(mockResponse.length / 4);
        const cost = ((inputTokens * costPerMillionInput) + (outputTokens * costPerMillionOutput)) / 1000000;

        setResult({
          model: modelLabel + " (Mocked)",
          latency: Date.now() - start,
          cost: Number(cost.toFixed(6)),
          inputTokens,
          outputTokens,
          text: mockResponse
        });
        setLoading(false);
      }, 800);
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
