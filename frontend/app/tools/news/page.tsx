"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { Radio, RefreshCw, Mail, Globe, Sparkles, HelpCircle, CheckCircle2, ChevronRight } from "lucide-react";
import "./news.css";

interface NewsItem {
  id: number;
  source: "google_news" | "reuters" | "truth_social" | "twitter";
  author: string | null;
  title: string;
  url: string;
  published_at: string;
}

export default function GeopoliticalNewsPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [emailing, setEmailing] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>("");
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const fetchBriefingData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/proxy?endpoint=/api/admin/news-briefing");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch briefing.");

      setArticles(data.newsItems || []);
      setSummary(data.summary || "");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load geopolitical briefing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefingData();
  }, []);

  const handleSyncFeeds = async () => {
    setSyncing(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/proxy?endpoint=/api/admin/sync-news", {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed.");

      setSuccessMsg(`Successfully aggregated ${data.count} recent feed articles!`);
      await fetchBriefingData();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to trigger RSS live sync.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSendEmailReport = async () => {
    setEmailing(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/proxy?endpoint=/api/admin/audit", {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email audit trigger failed.");

      setSuccessMsg("Automated health & geopolitical news PDF audit emailed successfully!");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to email PDF report.");
    } finally {
      setEmailing(false);
    }
  };

  const formatSourceLabel = (src: string) => {
    return src.replace("_", " ");
  };

  const timeAgo = (dateStr: string) => {
    try {
      const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      let interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return `${interval} minute${interval > 1 ? "s" : ""} ago`;
      return "just now";
    } catch {
      return "recently";
    }
  };

  return (
    <>
      <Navbar />
      <main className="news-container">
        <header className="news-header">
          <div className="oracle-title-area">
            <h1>Geopolitical Intel Aggregator</h1>
            <p>Aggregates Google News, Reuters, Truth Social, and Twitter politicians statements inside the last 6h</p>
          </div>
          <span className="oracle-badge">News Buffer</span>
        </header>

        {/* Global Controls */}
        <section className="news-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="news-card" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={handleSyncFeeds}
              disabled={syncing || loading}
              className="oracle-btn"
              style={{ width: "auto", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Crawling Feeds..." : "Sync Live News"}
            </button>

            <button
              onClick={handleSendEmailReport}
              disabled={emailing || loading}
              className="btn-outline"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.8rem 1.5rem" }}
            >
              <Mail size={16} className={emailing ? "animate-pulse" : ""} />
              {emailing ? "Mailing PDF Report..." : "Email PDF Audit Report"}
            </button>

            {successMsg && (
              <span className="text-emerald-400" style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} />
                {successMsg}
              </span>
            )}
          </div>
        </section>

        <section className="news-grid">
          {/* Gemini AI Briefing Summary */}
          <div className="news-card">
            <h2 className="oracle-card-title">
              <Sparkles size={18} className="text-amber-500" />
              Gemini AI Geopolitical Digest
            </h2>

            {error && (
              <div style={{ color: "#ef4444", padding: "1rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.1)", marginBottom: "1.5rem" }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <RefreshCw size={36} className="animate-spin text-sky-500" style={{ margin: "0 auto 12px" }} />
                <p>Generating Gemini geopolitical intelligence summary...</p>
              </div>
            ) : summary ? (
              <div className="news-brief-box">
                {summary}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                <HelpCircle size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p>No recent news found to summarize. Trigger "Sync Live News" above to ingest articles.</p>
              </div>
            )}
          </div>

          {/* Raw Feed list */}
          {!loading && articles.length > 0 && (
            <div className="news-card">
              <h2 className="oracle-card-title">
                <Globe size={18} className="text-sky-500" />
                Aggregated News Buffer ({articles.length} articles)
              </h2>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {articles.map((art) => (
                  <div key={art.id} className="news-item-row">
                    <div className="news-item-details">
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span className={`news-badge ${art.source}`}>
                          {formatSourceLabel(art.source)}
                        </span>
                        {art.author && (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                            By {art.author}
                          </span>
                        )}
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          • {timeAgo(art.published_at)}
                        </span>
                      </div>
                      <a href={art.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline" style={{ fontSize: "1.05rem", fontWeight: "600", marginTop: "0.35rem", display: "inline-block" }}>
                        {art.title}
                      </a>
                    </div>
                    <ChevronRight size={18} style={{ color: "var(--text-secondary)" }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
