"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { Terminal, Send, RefreshCw, Layers, ShieldCheck, AlertCircle, Play } from "lucide-react";
import "./webhook.css";

interface WebhookEvent {
  eventId: string;
  type: string;
  payload: any;
  status: "PROCESSED" | "FAILED" | "ALREADY_PROCESSED";
  retryCount: number;
  timestamp: string;
  logs: string[];
}

export default function WebhookPage() {
  const [eventType, setEventType] = useState<string>("payment_intent.succeeded");
  const [customAmount, setCustomAmount] = useState<number>(399.00);
  const [customEmail, setCustomEmail] = useState<string>("buyer@alicnc.pk");
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"logs" | "idempotency" | "dlq">("logs");
  const [lastDispatchedEventId, setLastDispatchedEventId] = useState<string>("");

  const getPayloadTemplate = () => {
    return {
      object: "event",
      type: eventType,
      data: {
        object: "payment_intent",
        amount: customAmount * 100, // in cents
        currency: "usd",
        receipt_email: customEmail,
        metadata: {
          machine_model: "Ali CNC Router S800",
          transaction_type: "b2b_finance"
        }
      }
    };
  };

  const fetchEventsFeed = async () => {
    try {
      const res = await fetch("/api/proxy?endpoint=/api/tools/webhook/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Failed to fetch webhook log feed:", e);
    }
  };

  // Poll event logs on mount
  useEffect(() => {
    fetchEventsFeed();
    const interval = setInterval(fetchEventsFeed, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateWebhook = async (duplicateId?: string) => {
    setLoading(true);
    const eventId = duplicateId || `evt_${Math.random().toString(36).substring(2, 11)}`;
    if (!duplicateId) {
      setLastDispatchedEventId(eventId);
    }

    try {
      const res = await fetch("/api/tools/webhook/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          type: eventType,
          payload: getPayloadTemplate()
        })
      });

      if (res.ok) {
        await fetchEventsFeed();
      }
    } catch (e) {
      console.error("Simulation trigger failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryEvent = async (eventId: string) => {
    try {
      const res = await fetch("/api/proxy?endpoint=/api/tools/webhook/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      });
      if (res.ok) {
        await fetchEventsFeed();
      }
    } catch (e) {
      console.error("Retry execution failed:", e);
    }
  };

  const failedEvents = events.filter((e) => e.status === "FAILED");

  return (
    <>
      <Navbar />
      <main className="webhook-container">
        <header className="webhook-header">
          <div className="oracle-title-area">
            <h1>Resilient Webhook Ingestion Engine</h1>
            <p>Idempotency verification and Dead-Letter Queue (DLQ) retry sync simulator</p>
          </div>
          <span className="oracle-badge">Payment Sync</span>
        </header>

        <section className="webhook-grid">
          {/* Left panel - Simulator controller */}
          <aside className="webhook-card">
            <h2 className="oracle-card-title">
              <Terminal size={18} className="text-sky-500" />
              Event Simulator
            </h2>

            <div className="router-input-group">
              <label htmlFor="event-type">Stripe Event Trigger</label>
              <select
                id="event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="oracle-select"
                disabled={loading}
              >
                <option value="payment_intent.succeeded">payment_intent.succeeded</option>
                <option value="payment_intent.payment_failed">payment_intent.payment_failed</option>
                <option value="customer.subscription.created">customer.subscription.created</option>
              </select>
            </div>

            <div className="router-input-group">
              <label htmlFor="amount">Custom Amount ($)</label>
              <input
                id="amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="scraper-input"
                disabled={loading}
              />
            </div>

            <div className="router-input-group">
              <label htmlFor="email">Customer Email</label>
              <input
                id="email"
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="scraper-input"
                disabled={loading}
              />
            </div>

            <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Payload Preview:
            </h4>
            <div className="webhook-payload-preview">
              {JSON.stringify(getPayloadTemplate(), null, 2)}
            </div>

            <button onClick={() => handleSimulateWebhook()} disabled={loading} className="oracle-btn">
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Dispatching Webhook...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Simulate Webhook Delivery
                </>
              )}
            </button>
          </aside>

          {/* Right panel - Logs & Queues */}
          <section className="webhook-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="oracle-tabs">
              <button
                onClick={() => setActiveTab("logs")}
                className={`oracle-tab-btn ${activeTab === "logs" ? "active" : ""}`}
              >
                Real-Time Logs Feed
              </button>
              <button
                onClick={() => setActiveTab("idempotency")}
                className={`oracle-tab-btn ${activeTab === "idempotency" ? "active" : ""}`}
              >
                Idempotency Checker
              </button>
              <button
                onClick={() => setActiveTab("dlq")}
                className={`oracle-tab-btn ${activeTab === "dlq" ? "active" : ""}`}
                style={{ position: "relative" }}
              >
                Dead-Letter Queue (DLQ)
                {failedEvents.length > 0 && (
                  <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", borderRadius: "50%", width: "16px", height: "16px", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {failedEvents.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB: Logs Feed */}
            {activeTab === "logs" && (
              <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Active Transaction Buffer Stream
                </h3>
                <div className="webhook-log-box" style={{ flexGrow: 1 }}>
                  {events.length > 0 ? (
                    events.map((evt) => (
                      <div key={evt.eventId} style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.8rem", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "0.25rem" }}>
                          <span>Event: {evt.type}</span>
                          <span>ID: {evt.eventId}</span>
                        </div>
                        {evt.logs.map((log, lidx) => (
                          <div
                            key={lidx}
                            className={`webhook-log-line ${log.includes("ERROR") ? "error" : log.includes("SUCCESS") ? "success" : ""}`}
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div style={{ margin: "auto", textAlign: "center", color: "var(--text-secondary)" }}>
                      Log buffer empty. Trigger a simulated webhook event on the left panel.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Idempotency simulator */}
            {activeTab === "idempotency" && (
              <div>
                <h3 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                  Idempotency Guard Simulation
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Duplicate webhook events are common due to network retries. Our ingestion pipeline validates the incoming `Event ID` against processed events. If it is a duplicate, it blocks reprocessing, protecting against duplicate payouts or double updates.
                </p>

                {lastDispatchedEventId ? (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)", padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
                    <ShieldCheck size={36} className="text-emerald-500" style={{ margin: "0 auto 10px" }} />
                    <p style={{ margin: "0 0 1rem 0" }}>
                      Last Sent Event ID: <strong>{lastDispatchedEventId}</strong>
                    </p>
                    <button
                      onClick={() => handleSimulateWebhook(lastDispatchedEventId)}
                      disabled={loading}
                      className="btn-outline"
                      style={{ margin: "0 auto", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                      Re-send Same Webhook Event ID
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                    Send at least one webhook event first to simulate duplicate ingestion triggers.
                  </div>
                )}
              </div>
            )}

            {/* TAB: DLQ logs list */}
            {activeTab === "dlq" && (
              <div>
                <h3 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                  Dead-Letter Queue (DLQ) Management
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Webhook events that fail transaction execution (e.g. database deadlocks or network errors) are sent to the Dead-Letter Queue (DLQ). Admins can inspect the events and manually trigger sync retries once database conflicts are resolved.
                </p>

                <div className="oracle-table-wrapper">
                  <table className="scraper-results-table">
                    <thead>
                      <tr>
                        <th>Event ID</th>
                        <th>Type</th>
                        <th>Attempts</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failedEvents.length > 0 ? (
                        failedEvents.map((evt) => (
                          <tr key={evt.eventId}>
                            <td>{evt.eventId}</td>
                            <td>
                              <span className="badge-status disconnected" style={{ textTransform: "uppercase" }}>
                                {evt.type}
                              </span>
                            </td>
                            <td>{evt.retryCount}</td>
                            <td>
                              <button onClick={() => handleRetryEvent(evt.eventId)} className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}>
                                Sync Retry
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                            <ShieldCheck size={28} className="text-emerald-500" style={{ margin: "0 auto 8px", display: "block" }} />
                            Dead-Letter Queue (DLQ) is empty! No failed events recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
