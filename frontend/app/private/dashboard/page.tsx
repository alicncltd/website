"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import Navbar from "../../../components/Navbar";
import { QRCodeSVG } from "qrcode.react";
import { 
  Phone, User, Server, QrCode, Wifi, WifiOff, LogOut, 
  Radio, Mic, MicOff, Volume2, Calendar, FileText, CheckCircle, Newspaper, RefreshCw
} from "lucide-react";
import "./dashboard.css";

interface ActiveCall {
  id: string;
  caller: string;
  timestamp: string;
}

interface CallLog {
  caller: string;
  status: string;
  message: string;
  timestamp: string;
}

export default function PrivateDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState("");
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [takeoverActive, setTakeoverActive] = useState(false);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isCallerSpeaking, setIsCallerSpeaking] = useState(false);
  
  // News Briefing States
  const [briefing, setBriefing] = useState<{ summary: string; news: any[] } | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [syncingNews, setSyncingNews] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  const socketRef = useRef<WebSocket | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Fetch News Briefing (last 6h)
  const fetchNewsBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch("/api/proxy?endpoint=/api/admin/news-briefing");
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (e) {
      console.error("Failed to fetch news briefing:", e);
    } finally {
      setLoadingBriefing(false);
    }
  };

  // Sync news manually
  const triggerNewsSync = async () => {
    setSyncingNews(true);
    try {
      const res = await fetch("/api/proxy?endpoint=/api/admin/sync-news", {
        method: "POST"
      });
      if (res.ok) {
        await fetchNewsBriefing();
      }
    } catch (e) {
      console.error("Failed to sync news feed:", e);
    } finally {
      setSyncingNews(false);
    }
  };

  // 1. Authenticate Admin User on Mount
  useEffect(() => {
    async function verifyAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== "thealidevmail@gmail.com") {
          router.push("/login");
        } else {
          setIsAdmin(true);
          setLoading(false);
          fetchHistoricalLogs();
          fetchNewsBriefing();
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        router.push("/login");
      }
    }
    verifyAdmin();
  }, [router, supabase]);

  // 2. Fetch past call logs from system_logs
  const fetchHistoricalLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .eq("type", "WHATSAPP_CALL")
        .order("created_at", { ascending: false })
        .limit(40);
        
      if (!error && data) {
        const parsed = data.map(log => {
          try {
            return JSON.parse(log.message) as CallLog;
          } catch (e) {
            return {
              caller: "System",
              status: log.status,
              message: log.message,
              timestamp: log.created_at
            } as CallLog;
          }
        });
        setCallLogs(parsed);
      }
    } catch (e) {
      console.error("Failed to fetch historical logs:", e);
    }
  };

  // 3. Setup WebSocket connection to backend
  useEffect(() => {
    if (!isAdmin) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const wsHost = backendUrl.replace(/^https?:\/\//, "");
    const wsUrl = `${protocol}//${wsHost}/api/whatsapp/stream?client=dashboard`;

    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "state") {
          setStatus(msg.data.status);
          setQrCode(msg.data.qr);
          setActiveCall(msg.data.activeCall);
          
          if (!msg.data.activeCall) {
            stopTakeover();
            setIsCallerSpeaking(false);
          }
        } else if (msg.type === "caller-speaking") {
          setIsCallerSpeaking(true);
          setTimeout(() => setIsCallerSpeaking(false), 2000);
        } else if (msg.type === "caller-audio") {
          playCallerAudio(msg.data);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    const logInterval = setInterval(fetchHistoricalLogs, 5000);

    ws.onclose = () => {
      console.log("WebSocket disconnected. Retrying in 5s...");
      setTimeout(() => {
        if (isAdmin) setStatus("DISCONNECTED");
      }, 5000);
    };

    return () => {
      ws.close();
      clearInterval(logInterval);
    };
  }, [isAdmin]);

  // 4. Play caller's speech chunk through dashboard speakers
  const playCallerAudio = (base64Webm: string) => {
    try {
      const audio = new Audio("data:audio/webm;base64," + base64Webm);
      audio.play().catch(err => console.error("Audio playback error:", err));
    } catch (e) {
      console.error("Failed to construct audio element:", e);
    }
  };

  // 5. Connect and Disconnect WhatsApp triggers
  const triggerConnect = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "connect-whatsapp" }));
    }
  };

  const triggerDisconnect = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "disconnect-whatsapp" }));
    }
  };

  // 6. Handle Manual Call Takeover (mic streaming)
  const startTakeover = async () => {
    try {
      setTakeoverActive(true);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "takeover-start" }));
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      micProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const buffer = new ArrayBuffer(inputData.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        const uint8 = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "dashboard-audio", data: base64 }));
        }
      };

    } catch (err) {
      console.error("Takeover capture failed:", err);
      stopTakeover();
    }
  };

  const stopTakeover = () => {
    setTakeoverActive(false);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "takeover-stop" }));
    }

    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="status-indicator">
          <div className="status-dot connecting"></div>
          <span>Authenticating Dashboard Security...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="private-dashboard">
        <header className="dashboard-header">
          <h1 className="gradient-text">Private Call Agent Panel</h1>
          <p style={{ color: "var(--text-secondary)" }}>Secure portal for Muhammad Ali to manage private WhatsApp voice bot and intercept active calls.</p>
        </header>

        <div className="dashboard-grid">
          
          {/* Left Panel - Control Card */}
          <section className="control-panel glass-panel">
            <h2 className="panel-title">
              <Server size={20} style={{ marginRight: "8px", verticalAlign: "middle", display: "inline-block" }} />
              Agent Controls
            </h2>

            {/* Connection Status */}
            <div className="status-card">
              <div className="status-indicator">
                <div className={`status-dot ${status.toLowerCase()}`}></div>
                <span>
                  {status === "CONNECTED" && "WhatsApp Connected"}
                  {status === "CONNECTING" && "Initiating Puppeteer..."}
                  {status === "QR_READY" && "Scan pairing QR code"}
                  {status === "DISCONNECTED" && "WhatsApp Stopped"}
                </span>
              </div>

              {status === "QR_READY" && qrCode && (
                <div className="qr-container">
                  <QRCodeSVG value={qrCode} size={200} />
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "1rem", textAlign: "center" }}>
                    Scan this QR code from your phone's linked devices screen.
                  </p>
                </div>
              )}

              {status === "CONNECTED" && (
                <div style={{ textAlign: "center", margin: "1rem 0" }}>
                  <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Voice agent is active and listening for incoming voice calls.</p>
                </div>
              )}

              {status === "DISCONNECTED" && (
                <div className="qr-placeholder">
                  <QrCode size={40} style={{ marginBottom: "12px", opacity: 0.5 }} />
                  <span>No active session. Click Connect to spin up WhatsApp Web.</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "1.5rem" }}>
                {status === "DISCONNECTED" ? (
                  <button onClick={triggerConnect} className="btn-primary" style={{ flex: 1, padding: "0.7rem" }}>
                    Connect Session
                  </button>
                ) : (
                  <button onClick={triggerDisconnect} className="btn-primary" style={{ flex: 1, padding: "0.7rem", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
                    Stop Session
                  </button>
                )}
              </div>
            </div>

            {/* Active Call Control */}
            {activeCall ? (
              <div className="active-call-widget">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Radio size={20} className="status-dot connected" style={{ background: "transparent" }} />
                    <span style={{ fontWeight: 700, color: "#10b981" }}>Live Active Call!</span>
                  </div>
                  {isCallerSpeaking && (
                    <span style={{ fontSize: "0.8rem", color: "var(--accent-color)", animation: "pulse 1s infinite" }}>
                      🎙️ Caller Speaking...
                    </span>
                  )}
                </div>
                
                <div style={{ marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                  <div><strong>From:</strong> {activeCall.caller}</div>
                  <div><strong>Started:</strong> {new Date(activeCall.timestamp).toLocaleTimeString()}</div>
                </div>

                {!takeoverActive ? (
                  <button onClick={startTakeover} className="takeover-btn">
                    <Mic size={18} style={{ marginRight: "8px", verticalAlign: "middle", display: "inline-block" }} />
                    Take Over Call (Mic)
                  </button>
                ) : (
                  <button onClick={stopTakeover} className="takeover-btn active">
                    <MicOff size={18} style={{ marginRight: "8px", verticalAlign: "middle", display: "inline-block" }} />
                    Admin Speaking (Mute)
                  </button>
                )}
                {takeoverActive && (
                  <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "8px", textAlign: "center" }}>
                    ⚠️ Live takeover active. AI is muted. Caller hears your microphone.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ padding: "1.5rem", borderColor: "var(--glass-border)", borderStyle: "solid", borderWidth: "1px", borderRadius: "16px", background: "rgba(0,0,0,0.01)", textAlign: "center" }}>
                <Phone size={24} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>No active call at the moment.</p>
              </div>
            )}

            <button onClick={handleLogout} className="btn-outline" style={{ width: "100%", marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
              <LogOut size={16} />
              Secure Log Out
            </button>
          </section>

          {/* Right Panel - Logs */}
          <section className="logs-panel glass-panel">
            <h2 className="panel-title">
              <FileText size={20} style={{ marginRight: "8px", verticalAlign: "middle", display: "inline-block" }} />
              Live Call Activity Logs
            </h2>

            <div className="logs-table-wrapper">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Caller</th>
                    <th>Type</th>
                    <th>Activity Details</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.length > 0 ? (
                    callLogs.map((log, index) => (
                      <tr key={index}>
                        <td style={{ whiteSpace: "nowrap", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>{log.caller}</td>
                        <td>
                          <span className={`badge-status ${log.status.toLowerCase()}`}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ color: log.status === "RESPONDED" ? "var(--text-primary)" : "var(--text-secondary)", fontStyle: log.status === "TRANSCRIBED" ? "italic" : "normal" }}>
                          {log.message}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                        No voice agent calls or activities logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* News Briefing Panel */}
          <section className="news-briefing-panel glass-panel" style={{ gridColumn: "span 2", marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.75rem" }}>
              <h2 className="panel-title" style={{ margin: 0, border: "none", padding: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Newspaper size={20} className="text-sky-500" />
                6-Hour Geopolitical Intel Briefing
              </h2>
              <button 
                onClick={triggerNewsSync} 
                disabled={syncingNews}
                className="btn-outline" 
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={14} className={syncingNews ? "animate-spin" : ""} />
                {syncingNews ? "Syncing..." : "Sync Feeds Now"}
              </button>
            </div>

            {loadingBriefing ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                <p>Generating briefing via Gemini AI...</p>
              </div>
            ) : briefing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* AI Executive Briefing Summary */}
                <div style={{ background: "rgba(14, 165, 233, 0.03)", borderLeft: "4px solid var(--accent-color)", padding: "1.5rem", borderRadius: "0 12px 12px 0" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                    Geopolitical Executive Summary
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-primary)", margin: 0 }}>
                    {briefing.summary || "No active intelligence summary computed for this interval."}
                  </p>
                </div>

                {/* Aggregated Feeds Table */}
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-primary)" }}>
                    Chronological Aggregated Sources (Last 6 Hours)
                  </h3>
                  <div className="logs-table-wrapper" style={{ maxHeight: "300px" }}>
                    <table className="logs-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Source</th>
                          <th>Author</th>
                          <th>Article Heading / Statement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {briefing.news && briefing.news.length > 0 ? (
                          briefing.news.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ whiteSpace: "nowrap", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                {new Date(item.published_at).toLocaleTimeString()}
                              </td>
                              <td>
                                <span className="badge-status responded" style={{ textTransform: "uppercase" }}>
                                  {item.source}
                                </span>
                              </td>
                              <td style={{ fontWeight: 600 }}>{item.author || "N/A"}</td>
                              <td>{item.title}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                              No news articles aggregated in the last 6 hours. Click "Sync Feeds Now" to fetch latest feeds.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                <p>No recent news briefing loaded.</p>
                <button onClick={fetchNewsBriefing} className="btn-primary" style={{ marginTop: "1rem", padding: "0.6rem 1.2rem" }}>
                  Load Briefing
                </button>
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  );
}
