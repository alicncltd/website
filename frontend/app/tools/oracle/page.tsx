"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { 
  TrendingUp, TrendingDown, RefreshCw, Cpu, Award, 
  AlertTriangle, DollarSign, Percent, ShieldAlert, BarChart3, 
  HelpCircle, Newspaper, ArrowRightLeft, BookOpen, Layers
} from "lucide-react";
import "./oracle.css";

// Interface for API output
interface OracleReport {
  publish: boolean;
  final_prediction: "LONG" | "SHORT" | "NEUTRAL" | "ERROR";
  confidence: number;
  reliability: number;
  expected_move: number;
  risk: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  trade: {
    entry_price?: number;
    stop_loss?: number;
    take_profit_1?: number;
    take_profit_2?: number;
    risk_reward?: number;
  };
  summary?: string;
  reasoning?: string;
  reasons?: string[];
  warnings?: string[];
  snapshot?: any;
  technical?: {
    name: string;
    category: string;
    warnings: string[];
    evidence: Array<{
      name: string;
      source: string | null;
      category: string;
      direction: "LONG" | "SHORT" | "NEUTRAL";
      confidence: number;
      reliability: number;
      importance: number | null;
      reason: string;
    }>;
  };
  sentiment?: {
    module: string;
    bullish_score: number;
    bearish_score: number;
    net_score: number;
    confidence: number;
    prediction: string;
    fear_greed?: {
      value: number | null;
      classification: string;
    };
    funding?: {
      rate: number;
    };
    btc_dominance?: {
      value: number;
    };
    whale_activity?: {
      signal: string;
    };
  };
  derivatives?: {
    open_interest?: {
      current: number;
      change_pct: number;
    };
    long_short_ratio?: {
      ratio: number;
    };
  };
  news?: {
    module: string;
    headlines: string[];
  };
  whales?: {
    module: string;
    buy_volume: number;
    sell_volume: number;
  };
}

const SUPPORTED_SYMBOLS = [
  { value: "BTCUSDT", name: "Bitcoin / USDT" },
  { value: "ETHUSDT", name: "Ethereum / USDT" },
  { value: "SOLUSDT", name: "Solana / USDT" },
  { value: "XRPUSDT", name: "Ripple / USDT" },
  { value: "BNBUSDT", name: "Binance Coin / USDT" },
  { value: "ADAUSDT", name: "Cardano / USDT" },
  { value: "DOGEUSDT", name: "Dogecoin / USDT" }
];

export default function OraclePage() {
  const [symbol, setSymbol] = useState<string>("BTCUSDT");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [report, setReport] = useState<OracleReport | null>(null);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"technical" | "sentiment" | "news">("technical");

  // Handle loading steps simulation
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }

    const intervals = [
      setTimeout(() => setLoadingStep(1), 1000),  // Fetch snapshot
      setTimeout(() => setLoadingStep(2), 3000),  // Run technical
      setTimeout(() => setLoadingStep(3), 6000),  // Sentiment/Whales
      setTimeout(() => setLoadingStep(4), 10000), // Call Gemini Judge
    ];

    return () => {
      intervals.forEach(clearTimeout);
    };
  }, [loading]);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      // Use general proxy endpoint to query Express backend
      const res = await fetch("/api/proxy?endpoint=/api/admin/run-oracle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ symbol })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to execute analysis engine.");
      }

      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during execution.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictClass = (verdict: string) => {
    if (verdict === "LONG") return "long";
    if (verdict === "SHORT") return "short";
    return "neutral";
  };

  const formatNumber = (num: any, decimals: number = 2) => {
    if (num === null || num === undefined || isNaN(Number(num))) return "N/A";
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <>
      <Navbar />
      <main className="oracle-container">
        <header className="oracle-header">
          <div className="oracle-title-area">
            <h1>Oracle AI Trading Analyst</h1>
            <p>Geopolitical, sentiment, and multi-committee quantitative algorithmic analysis engine</p>
          </div>
          <span className="oracle-badge">v5.0.0 Stable</span>
        </header>

        <section className="oracle-grid">
          {/* Side Control Panel */}
          <aside className="oracle-card">
            <h2 className="oracle-card-title">
              <Cpu size={18} className="text-sky-500" />
              Engine Settings
            </h2>
            <div className="oracle-symbol-selector">
              <label htmlFor="symbol">Select Market Asset</label>
              <select
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="oracle-select"
                disabled={loading}
              >
                {SUPPORTED_SYMBOLS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="oracle-btn"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Analyzing Market...
                </>
              ) : (
                <>
                  <Cpu size={18} />
                  Run Oracle Engine
                </>
              )}
            </button>
          </aside>

          {/* Main Content Area */}
          <section className="oracle-main-area">
            {/* Error Message */}
            {error && (
              <div className="oracle-card" style={{ borderLeft: "4px solid #ef4444", marginBottom: "1.5rem" }}>
                <h3 className="oracle-alert-title">
                  <ShieldAlert size={18} />
                  Execution Failed
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.5rem 0 0" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Loading Panel */}
            {loading && (
              <div className="oracle-card oracle-loading-container">
                <div className="oracle-spinner"></div>
                <h2>Simulating Quantum Multi-Committee Scoring</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  Oracle AI is calculating indicators, scraping global sentiment, and consulting Gemini.
                </p>

                <div className="oracle-loading-steps">
                  <div className={`oracle-loading-step ${loadingStep >= 1 ? "completed" : "active"}`}>
                    <Layers size={16} />
                    <span>Step 1: Building market snapshot & order history</span>
                  </div>
                  <div className={`oracle-loading-step ${loadingStep > 2 ? "completed" : loadingStep === 2 ? "active" : ""}`}>
                    <BarChart3 size={16} />
                    <span>Step 2: Scoring technical indicators committee</span>
                  </div>
                  <div className={`oracle-loading-step ${loadingStep > 3 ? "completed" : loadingStep === 3 ? "active" : ""}`}>
                    <ArrowRightLeft size={16} />
                    <span>Step 3: Calculating whale order-flow & funding bias</span>
                  </div>
                  <div className={`oracle-loading-step ${loadingStep >= 4 ? "active" : ""}`}>
                    <Award size={16} />
                    <span>Step 4: Activating Gemini 3.6-Flash AI Judge arbitration</span>
                  </div>
                </div>
              </div>
            )}

            {/* Inactive State */}
            {!loading && !report && !error && (
              <div className="oracle-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <Cpu size={48} className="text-slate-600" style={{ marginBottom: "1.5rem", display: "inline-block" }} />
                <h2>Engine Idle</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "450px", margin: "0.5rem auto 0" }}>
                  Select a cryptocurrency asset from the sidebar and trigger the analysis run. Oracle will perform a full quantitative and AI audit check.
                </p>
              </div>
            )}

            {/* Results Output */}
            {!loading && report && (
              <div className="oracle-result-layout animate-fade-in">
                {/* 1. Verdict Highlights */}
                <div className="oracle-verdict-row">
                  <div className="oracle-stat-box">
                    <span className="oracle-stat-label">AI Decision</span>
                    <span className={`oracle-stat-value ${getVerdictClass(report.final_prediction)}`}>
                      {report.final_prediction}
                    </span>
                  </div>
                  <div className="oracle-stat-box">
                    <span className="oracle-stat-label">Confidence Score</span>
                    <span className="oracle-stat-value">
                      {formatNumber(report.confidence)}%
                    </span>
                  </div>
                  <div className="oracle-stat-box">
                    <span className="oracle-stat-label">Risk Rating</span>
                    <span className="oracle-stat-value" style={{ color: report.risk === "HIGH" ? "#ef4444" : report.risk === "LOW" ? "#10b981" : "#f59e0b" }}>
                      {report.risk}
                    </span>
                  </div>
                </div>

                {/* 2. Trade Setups */}
                {report.trade && report.trade.entry_price && (
                  <div className="oracle-card">
                    <h3 className="oracle-card-title">
                      <DollarSign size={18} className="text-emerald-500" />
                      Suggested Institutional Execution
                    </h3>
                    <div className="oracle-trade-setup">
                      <div className="oracle-trade-levels">
                        <div className="oracle-level-item entry">
                          <span>Target Entry</span>
                          <span>${formatNumber(report.trade.entry_price)}</span>
                        </div>
                        <div className="oracle-level-item stop">
                          <span>Stop Loss</span>
                          <span>${formatNumber(report.trade.stop_loss)}</span>
                        </div>
                        <div className="oracle-level-item profit">
                          <span>Take Profit 1</span>
                          <span>${formatNumber(report.trade.take_profit_1)}</span>
                        </div>
                        <div className="oracle-level-item profit">
                          <span>Take Profit 2</span>
                          <span>${formatNumber(report.trade.take_profit_2)}</span>
                        </div>
                      </div>
                      <div className="oracle-ratio-gauge">
                        <span className="oracle-stat-label">Risk-Reward Ratio</span>
                        <span className="oracle-ratio-val">
                          1 : {formatNumber(report.trade.risk_reward)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. AI Commentary */}
                <div className="oracle-card">
                  <h3 className="oracle-card-title">
                    <BookOpen size={18} className="text-sky-500" />
                    AI Judge Geopolitical & Market Commentary
                  </h3>
                  <p style={{ color: "var(--text-primary)", fontSize: "1rem", lineHeight: "1.6", margin: 0 }}>
                    {report.reasoning || "No detailed AI review reasoning generated."}
                  </p>
                  
                  {report.reasons && report.reasons.length > 0 && (
                    <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.5rem" }}>Core Drivers:</h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {report.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 4. Tabbed Breakdowns */}
                <div className="oracle-card">
                  <div className="oracle-tabs">
                    <button
                      onClick={() => setActiveTab("technical")}
                      className={`oracle-tab-btn ${activeTab === "technical" ? "active" : ""}`}
                    >
                      Technical Evidence
                    </button>
                    <button
                      onClick={() => setActiveTab("sentiment")}
                      className={`oracle-tab-btn ${activeTab === "sentiment" ? "active" : ""}`}
                    >
                      Sentiment & Whales
                    </button>
                    <button
                      onClick={() => setActiveTab("news")}
                      className={`oracle-tab-btn ${activeTab === "news" ? "active" : ""}`}
                    >
                      Headlines Aggregator
                    </button>
                  </div>

                  {activeTab === "technical" && (
                    <div className="oracle-table-wrapper">
                      {report.technical && report.technical.evidence && report.technical.evidence.length > 0 ? (
                        <table className="oracle-table">
                          <thead>
                            <tr>
                              <th>Indicator Name</th>
                              <th>Category</th>
                              <th>Verdict</th>
                              <th>Confidence</th>
                              <th>Calculated Driver</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.technical.evidence.map((ev, idx) => (
                              <tr key={idx}>
                                <td><strong>{ev.name}</strong></td>
                                <td style={{ textTransform: "capitalize" }}>{ev.category}</td>
                                <td>
                                  <span className={`direction ${getVerdictClass(ev.direction)}`}>
                                    {ev.direction}
                                  </span>
                                </td>
                                <td>{ev.confidence}%</td>
                                <td>{ev.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>
                          No technical indicators details reported.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "sentiment" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div className="oracle-verdict-row">
                        <div className="oracle-stat-box" style={{ background: "rgba(0,0,0,0.15)" }}>
                          <span className="oracle-stat-label">Fear & Greed Index</span>
                          <span className="oracle-stat-value" style={{ fontSize: "1.5rem", color: "#f59e0b" }}>
                            {report.sentiment?.fear_greed?.value || "N/A"}{" "}
                            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                              ({report.sentiment?.fear_greed?.classification || "Unknown"})
                            </span>
                          </span>
                        </div>
                        <div className="oracle-stat-box" style={{ background: "rgba(0,0,0,0.15)" }}>
                          <span className="oracle-stat-label">Whale Order Bias</span>
                          <span className="oracle-stat-value" style={{ fontSize: "1.5rem", color: "#10b981" }}>
                            {report.whales?.buy_volume ? (
                              <>
                                Buy: {formatNumber(report.whales.buy_volume, 1)} BTC
                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block" }}>
                                  Sell: {formatNumber(report.whales.sell_volume, 1)} BTC
                                </span>
                              </>
                            ) : (
                              "Normal"
                            )}
                          </span>
                        </div>
                        <div className="oracle-stat-box" style={{ background: "rgba(0,0,0,0.15)" }}>
                          <span className="oracle-stat-label">Funding Rate</span>
                          <span className="oracle-stat-value" style={{ fontSize: "1.5rem" }}>
                            {report.sentiment?.funding?.rate ? `${(report.sentiment.funding.rate * 100).toFixed(4)}%` : "N/A"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="oracle-level-item">
                        <span>BTC Market Dominance Percentage</span>
                        <span>{report.sentiment?.btc_dominance?.value ? `${formatNumber(report.sentiment.btc_dominance.value)}%` : "N/A"}</span>
                      </div>
                      <div className="oracle-level-item">
                        <span>Binance Futures Long/Short Accounts Ratio</span>
                        <span>{report.derivatives?.long_short_ratio?.ratio ? formatNumber(report.derivatives.long_short_ratio.ratio) : "N/A"}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "news" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Newspaper size={16} />
                        Analyzed Global Geopolitical & Trade Headings
                      </h4>
                      {report.news && report.news.headlines && report.news.headlines.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {report.news.headlines.map((hl, idx) => (
                            <li key={idx} style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                              {hl}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>
                          No headlines aggregated in this snapshot.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Execution Warnings */}
                {report.warnings && report.warnings.length > 0 && (
                  <div className="oracle-alert">
                    <h4 className="oracle-alert-title">
                      <AlertTriangle size={18} />
                      Engine Diagnostics Warnings
                    </h4>
                    <ul>
                      {report.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
