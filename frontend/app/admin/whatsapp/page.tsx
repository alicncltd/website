"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import Navbar from "../../../components/Navbar";
import { 
  Phone, RefreshCw, LogOut, CheckCircle2, AlertTriangle, 
  RefreshCcw, ShieldAlert, Cpu, HeartPulse, Sparkles 
} from "lucide-react";
import "./admin.css";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // WhatsApp State
  const [waStatus, setWaStatus] = useState("DISCONNECTED");
  const [pairingCode, setPairingCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingLoading, setPairingLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);

  // Scraper State
  const [scrapeNumber, setScrapeNumber] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);

  // AI Auditor State
  const [auditStatus, setAuditStatus] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // 1. Check Authentication
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.push("/login");
      } else {
        setUser(data.session.user);
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, supabase]);

  // 2. Poll WhatsApp Status
  useEffect(() => {
    if (!user) return;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/proxy?endpoint=/api/whatsapp/status");
        if (res.ok) {
          const data = await res.json();
          setWaStatus(data.status || "DISCONNECTED");
          if (data.pairingCode) {
            setPairingCode(data.pairingCode);
          }
        }
      } catch (err) {
        console.error("Failed to query status proxy:", err);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // 3. Request Pairing Code
  const handleRequestPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setPairingLoading(true);
    setPairingCode("");
    setSyncStatus("");

    try {
      const res = await fetch("/api/proxy?endpoint=/api/whatsapp/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await res.json();
      if (res.ok) {
        setPairingCode(data.code);
        setSyncStatus("Pairing code requested successfully. Enter it on your phone.");
      } else {
        setSyncStatus(`Pairing failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setSyncStatus(`Error requesting pairing code: ${err.message}`);
    } finally {
      setPairingLoading(false);
    }
  };

  // 4. Trigger Catalog Sync
  const handleTriggerSync = async () => {
    setSyncLoading(true);
    setSyncStatus("");
    try {
      const res = await fetch("/api/proxy?endpoint=/api/whatsapp/sync", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus("Synchronization successfully initiated in background.");
      } else {
        setSyncStatus(`Sync trigger failed: ${data.error}`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync connection error: ${err.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  // 5. Trigger Stateless Scrape Fallback
  const handleTriggerScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeNumber) return;
    setScrapeLoading(true);
    setScrapeStatus("");

    try {
      const res = await fetch("/api/proxy?endpoint=/api/whatsapp/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: scrapeNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setScrapeStatus(`Scraping complete. Successfully synchronized ${data.count} items.`);
      } else {
        setScrapeStatus(`Scraping failed: ${data.error}`);
      }
    } catch (err: any) {
      setScrapeStatus(`Scraping connection error: ${err.message}`);
    } finally {
      setScrapeLoading(false);
    }
  };

  // 6. Trigger AI Site Audit
  const handleTriggerAudit = async () => {
    setAuditLoading(true);
    setAuditStatus("");
    try {
      const res = await fetch("/api/proxy?endpoint=/api/admin/audit", {
        method: "POST"
      });
      if (res.ok) {
        setAuditStatus("AI Site Health Check triggered. You will receive the report via email shortly.");
      } else {
        const data = await res.json();
        setAuditStatus(`Audit failed to start: ${data.error}`);
      }
    } catch (err: any) {
      setAuditStatus(`Audit connection error: ${err.message}`);
    } finally {
      setAuditLoading(false);
    }
  };

  // 7. Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <h3 className="gradient-text">Loading Admin Panel...</h3>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-header">
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Admin Dashboard</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Welcome, {user?.email}
              </p>
            </div>
            <button className="btn-outline" onClick={handleLogout} style={{ padding: "0.6rem 1.2rem", display: "flex", gap: "8px", alignItems: "center" }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          {/* Connection Status Panel */}
          <div className="status-panel glass-panel">
            <Cpu size={24} style={{ color: "var(--accent-color)" }} />
            <div style={{ flexGrow: 1, textAlign: "left" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>WhatsApp Connection Status</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Status is queried from the background Render instance every 5 seconds.
              </p>
            </div>

            <div className={`status-badge ${waStatus.toLowerCase()}`}>
              <span className="pulse-dot"></span>
              {waStatus}
            </div>
          </div>

          <div className="admin-grid">
            {/* Left Side: Session Management */}
            <div>
              <div className="control-card glass-panel" style={{ textAlign: "left" }}>
                <h3 className="card-title">
                  <Phone size={18} style={{ color: "var(--accent-color)" }} />
                  Link WhatsApp via Phone Code
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Link your account without scanning a QR code. Type your number (e.g. <code>923440708494</code>) to request a pairing code.
                </p>

                <form onSubmit={handleRequestPairingCode} className="input-with-btn">
                  <input
                    type="text"
                    placeholder="923440708494"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={pairingLoading}
                  />
                  <button type="submit" className="btn-primary" disabled={pairingLoading || waStatus === "CONNECTED"}>
                    {pairingLoading ? <RefreshCw className="animate-spin" size={16} /> : "Request Code"}
                  </button>
                </form>

                {pairingCode && (
                  <div className="pairing-code-box">
                    <div style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)" }}>
                      Linking pairing code:
                    </div>
                    <div className="pairing-code-text">{pairingCode}</div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
                      Open WhatsApp on your phone &rarr; Settings &rarr; Linked Devices &rarr; Link with Phone Number &rarr; Enter this code.
                    </p>
                  </div>
                )}

                {syncStatus && (
                  <div className="auth-success" style={{ margin: 0, fontSize: "0.85rem" }}>
                    {syncStatus}
                  </div>
                )}
              </div>

              {/* Public Scraper (Stateless Fallback) */}
              <div className="control-card glass-panel" style={{ textAlign: "left", marginTop: "2rem" }}>
                <h3 className="card-title">
                  <ShieldAlert size={18} style={{ color: "var(--accent-color)" }} />
                  Stateless Public Scraper (Fallback)
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Grabs catalog items from the public profile (<code>wa.me/c/number</code>) without logging in.
                </p>

                <form onSubmit={handleTriggerScrape} className="input-with-btn">
                  <input
                    type="text"
                    placeholder="923440708494"
                    value={scrapeNumber}
                    onChange={(e) => setScrapeNumber(e.target.value)}
                    required
                    disabled={scrapeLoading}
                  />
                  <button type="submit" className="btn-primary" disabled={scrapeLoading}>
                    {scrapeLoading ? <RefreshCw className="animate-spin" size={16} /> : "Scrape Catalog"}
                  </button>
                </form>

                {scrapeStatus && (
                  <div className="auth-success" style={{ margin: 0, fontSize: "0.85rem" }}>
                    {scrapeStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Operations Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div className="control-card glass-panel" style={{ textAlign: "left" }}>
                <h3 className="card-title">
                  <RefreshCcw size={18} style={{ color: "var(--accent-color)" }} />
                  Catalog Operations
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Synchronize your active catalog items manually to Cloudinary and the database gallery cache.
                </p>

                <button 
                  className="btn-primary" 
                  onClick={handleTriggerSync} 
                  disabled={syncLoading || waStatus !== "CONNECTED"}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {syncLoading ? "Syncing..." : "Sync Active Catalog"}
                </button>
              </div>

              <div className="control-card glass-panel" style={{ textAlign: "left" }}>
                <h3 className="card-title">
                  <HeartPulse size={18} style={{ color: "var(--accent-color)" }} />
                  AI Website Audit (Gemini)
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Triggers an automated check of website routes and database logs. A PDF report will be generated and emailed to your inbox.
                </p>

                <button 
                  className="btn-primary" 
                  onClick={handleTriggerAudit} 
                  disabled={auditLoading}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {auditLoading ? "Auditing..." : "Trigger AI Health Audit"}
                </button>

                {auditStatus && (
                  <div className="auth-success" style={{ margin: 0, fontSize: "0.85rem" }}>
                    {auditStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
