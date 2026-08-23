"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../components/Navbar";
import { 
  Phone, PhoneOff, Mic, Volume2, Settings, ShieldAlert,
  Database, RefreshCw, AlertCircle, CheckCircle2, ListFilter, Play
} from "lucide-react";
import "./echodesk.css";

interface CallSummary {
  id: string;
  caller: string;
  phone: string;
  duration: string;
  status: string;
  transcript: string[];
  summary: string;
  crmSynced: boolean;
  crmTicketId: string;
  timestamp: string;
}

export default function EchoDeskPage() {
  const [localApiKey, setLocalApiKey] = useState<string>("");
  const [crmType, setCrmType] = useState<string>("Jobber");
  const [persona, setPersona] = useState<string>(
    "You are EchoDesk AI, a friendly, ultra-professional workshop and home services assistant. Keep answers brief (1-2 sentences) and schedule appointments."
  );
  
  // Call States
  const [callState, setCallState] = useState<"idle" | "ringing" | "active" | "ended">("idle");
  const [callerName, setCallerName] = useState<string>("Muhammad Ali");
  const [callerPhone, setCallerPhone] = useState<string>("+92 300 1234567");
  const [chatLog, setChatLog] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  
  // Summary/History States
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"brief" | "crm" | "sms">("brief");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load configuration
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalApiKey(localStorage.getItem("alicnc_gemini_api_key") || "");
      const stored = localStorage.getItem("alicnc_echodesk_calls");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCalls(parsed);
          if (parsed.length > 0) setSelectedCall(parsed[0]);
        } catch {}
      }
    }
  }, []);

  // Timer counter for call
  useEffect(() => {
    if (callState === "active") {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  // Voice Speech Recognition init (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    
    // Check if webkitSpeechRecognition is available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Browser Speech Recognition not supported. Please type in the chat instead.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      submitUserSpeech(speechToText);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Speaks response aloud using Web Speech Synthesis API
  const speakAloud = (text: string) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    
    synth.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a clean natural voice
    const voices = synth.getVoices();
    const cleanVoice = voices.find(v => v.lang.includes("en") && v.name.includes("Natural")) || voices[0];
    if (cleanVoice) utterance.voice = cleanVoice;
    
    synth.speak(utterance);
  };

  const handleStartInboundSimulation = () => {
    setCallState("ringing");
    setChatLog([]);
    setErrorMsg("");
  };

  const handleAcceptCall = () => {
    setCallState("active");
    // Initial welcome message
    const welcome = "Hello! Thanks for calling Ali CNC™. How can I help you today?";
    setChatLog([{ sender: "ai", text: welcome }]);
    speakAloud(welcome);
  };

  const handleDeclineCall = () => {
    setCallState("idle");
  };

  const submitUserSpeech = async (text: string) => {
    if (!text.trim()) return;

    const newChat = [...chatLog, { sender: "user" as const, text }];
    setChatLog(newChat);
    setInputText("");

    try {
      const fullPrompt = `${persona}\n\nCall History:\n${newChat.map(c => `${c.sender.toUpperCase()}: ${c.text}`).join("\n")}\nAI:`;
      
      const res = await fetch("/api/proxy?endpoint=/api/tools/echodesk/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      if (!res.ok) throw new Error("Voice chatbot server error.");

      const data = await res.json();
      const responseText = data.text || "I understand. Let me check that.";
      setChatLog([...newChat, { sender: "ai", text: responseText }]);
      speakAloud(responseText);
    } catch (err) {
      console.error(err);
      const fallback = "I've noted that down. Let me coordinate our main dispatcher.";
      setChatLog([...newChat, { sender: "ai", text: fallback }]);
      speakAloud(fallback);
    }
  };

  const handleHangUp = async () => {
    setCallState("ended");
    setIsSummarizing(true);

    const callTranscript = chatLog.map(c => `${c.sender === "user" ? "Customer" : "AI"}: ${c.text}`);
    const timeStr = `${Math.floor(callDuration / 60)}m ${callDuration % 60}s`;

    let generatedBrief = "Customer requested booking details. Verified address and logged to CRM.";
    const crmId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    if (callTranscript.length > 0) {
      try {
        const res = await fetch("/api/proxy?endpoint=/api/tools/echodesk/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: callTranscript })
        });

        if (res.ok) {
          const data = await res.json();
          generatedBrief = data.summary || generatedBrief;
        }
      } catch (err) {
        console.error("Failed to generate voice dispatcher call brief:", err);
      }
    }

    const newCall: CallSummary = {
      id: `call_${Date.now()}`,
      caller: callerName,
      phone: callerPhone,
      duration: timeStr,
      status: "COMPLETED",
      transcript: callTranscript,
      summary: generatedBrief,
      crmSynced: true,
      crmTicketId: crmId,
      timestamp: new Date().toLocaleString()
    };

    const updatedCalls = [newCall, ...calls].slice(0, 30);
    setCalls(updatedCalls);
    setSelectedCall(newCall);
    localStorage.setItem("alicnc_echodesk_calls", JSON.stringify(updatedCalls));
    
    setIsSummarizing(false);
  };

  return (
    <>
      <Navbar />
      <main className="echodesk-container">
        <header className="echodesk-header">
          <div className="oracle-title-area">
            <h1>EchoDesk AI Dispatcher</h1>
            <p>24/7 client-side voice receptionist prototype executing real-time Speech-to-Text and Synthesis</p>
          </div>
          <span className="oracle-badge">Dispatcher</span>
        </header>

        <section className="echodesk-grid">
          {/* Dialer Simulator Panel */}
          <aside className="phone-simulator-card">
            <h2 className="oracle-card-title" style={{ marginBottom: "1rem", display: "flex", gap: "8px", alignItems: "center" }}>
              <Phone size={18} className="text-sky-400" /> Live Dialer Simulator
            </h2>

            {/* Mobile Phone Mock frame */}
            <div className="phone-screen">
              <div className="phone-status-bar">
                <span>9:41 AM</span>
                <span>📶 🔋 100%</span>
              </div>

              {callState === "idle" && (
                <div style={{ textAlign: "center", margin: "auto 0" }}>
                  <div style={{ color: "#475569", fontSize: "0.8rem", marginBottom: "1rem" }}>
                    Configure mock caller values:
                  </div>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="Caller Name"
                    className="scraper-input"
                    style={{ marginBottom: "0.8rem", textAlign: "center" }}
                  />
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    placeholder="Caller Phone"
                    className="scraper-input"
                    style={{ marginBottom: "1.5rem", textAlign: "center" }}
                  />
                  <button onClick={handleStartInboundSimulation} className="oracle-btn" style={{ width: "100%", justifyContent: "center" }}>
                    <Play size={16} /> Simulate Inbound Call
                  </button>
                </div>
              )}

              {callState === "ringing" && (
                <>
                  <div className="phone-call-info">
                    <div className="phone-caller-name">{callerName}</div>
                    <div className="phone-call-status">Inbound Call Ringing...</div>
                  </div>

                  <div className="phone-avatar-pulse">
                    <Phone size={36} className="text-sky-400" />
                  </div>

                  <div className="phone-actions">
                    <button onClick={handleDeclineCall} className="phone-btn decline">
                      <PhoneOff size={24} />
                    </button>
                    <button onClick={handleAcceptCall} className="phone-btn accept">
                      <Phone size={24} />
                    </button>
                  </div>
                </>
              )}

              {callState === "active" && (
                <>
                  <div className="phone-call-info">
                    <div className="phone-caller-name">{callerName}</div>
                    <div className="phone-call-status" style={{ animation: "none", color: "#64748b" }}>
                      Connected • {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>

                  <div className="phone-transcription-box">
                    {chatLog.length === 0 ? (
                      <span className="text-slate-500">Call active. Speak or type to converse.</span>
                    ) : (
                      chatLog.map((c, i) => (
                        <div key={i} style={{ marginBottom: "4px", fontSize: "0.75rem" }}>
                          <strong style={{ color: c.sender === "user" ? "#0ea5e9" : "#f59e0b" }}>
                            {c.sender === "user" ? "User" : "Agent"}:
                          </strong>{" "}
                          {c.text}
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "6px", marginTop: "1rem" }}>
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitUserSpeech(inputText)}
                      className="scraper-input"
                      style={{ fontSize: "0.75rem", padding: "0.4rem" }}
                    />
                    <button onClick={() => submitUserSpeech(inputText)} className="oracle-btn" style={{ padding: "0.4rem 0.8rem" }}>
                      Send
                    </button>
                  </div>

                  <div className="phone-actions" style={{ marginTop: "1.5rem" }}>
                    <button onClick={toggleSpeechRecognition} className={`phone-btn ${isListening ? "accept" : "mute"}`}>
                      <Mic size={24} />
                    </button>
                    <button onClick={handleHangUp} className="phone-btn decline">
                      <PhoneOff size={24} />
                    </button>
                  </div>
                </>
              )}

              {callState === "ended" && (
                <div style={{ textAlign: "center", margin: "auto 0" }}>
                  <CheckCircle2 size={44} className="text-emerald-500" style={{ margin: "0 auto 1rem" }} />
                  <div className="phone-caller-name" style={{ fontSize: "1.2rem" }}>Call Disconnected</div>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.5rem 0 1.5rem" }}>
                    Generating post-call report...
                  </p>
                  <button onClick={() => setCallState("idle")} className="oracle-btn" style={{ width: "100%", justifyContent: "center" }}>
                    Return to Dialer
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* CRM Audit Logs & Call Reports */}
          <section className="echodesk-panel">
            <h2 className="oracle-card-title" style={{ marginBottom: "1rem", display: "flex", gap: "8px", alignItems: "center" }}>
              <Database size={18} className="text-sky-400" /> Dispatch Reports & CRM Sync
            </h2>

            {/* Config Area */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.5rem", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px" }}>
              <div className="router-input-group">
                <label>Integration Target CRM</label>
                <select value={crmType} onChange={(e) => setCrmType(e.target.value)} className="oracle-select">
                  <option value="Jobber">Jobber Sync</option>
                  <option value="ServiceTitan">ServiceTitan Sync</option>
                  <option value="Local Storage">Local Only (Private)</option>
                </select>
              </div>

              <div className="router-input-group">
                <label>Local API Key Status</label>
                <div style={{ fontSize: "0.8rem", color: localApiKey ? "#10b981" : "#f59e0b", marginTop: "8px", fontWeight: "600" }}>
                  {localApiKey ? "🔑 Gemini Connected" : "⚠️ Running Offline Mock Mode"}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="webhook-card" style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", display: "flex", gap: "8px", padding: "0.8rem", marginBottom: "1.5rem" }}>
                <AlertCircle className="text-red-400" size={16} />
                <span style={{ fontSize: "0.8rem", color: "#fca5a5" }}>{errorMsg}</span>
              </div>
            )}

            {/* Selected Call Details */}
            {selectedCall ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>{selectedCall.caller}</h3>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {selectedCall.timestamp} • Duration: {selectedCall.duration}
                    </span>
                  </div>
                  <span className="crm-sync-badge synced">
                    Synced to {crmType}
                  </span>
                </div>

                <div className="echodesk-tabs">
                  <button onClick={() => setActiveTab("brief")} className={`echodesk-tab ${activeTab === "brief" ? "active" : ""}`}>
                    AI Call Briefing
                  </button>
                  <button onClick={() => setActiveTab("crm")} className={`echodesk-tab ${activeTab === "crm" ? "active" : ""}`}>
                    CRM Ticket Data
                  </button>
                  <button onClick={() => setActiveTab("sms")} className={`echodesk-tab ${activeTab === "sms" ? "active" : ""}`}>
                    SMS Logs
                  </button>
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1.2rem", minHeight: "150px" }}>
                  {activeTab === "brief" && (
                    <div>
                      <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b", marginBottom: "0.4rem" }}>
                        Call Executive Summary
                      </h4>
                      <p style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>{selectedCall.summary}</p>
                      
                      <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b", marginTop: "1rem", marginBottom: "0.4rem" }}>
                        Original Audio Transcript
                      </h4>
                      <div style={{ maxHeight: "120px", overflowY: "auto", fontSize: "0.8rem", color: "#94a3b8" }}>
                        {selectedCall.transcript.map((line, idx) => (
                          <div key={idx} style={{ marginBottom: "2px" }}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "crm" && (
                    <div style={{ fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#64748b" }}>CRM Integration</span>
                        <strong>{crmType} API</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#64748b" }}>Ticket Reference ID</span>
                        <code style={{ color: "#0ea5e9" }}>{selectedCall.crmTicketId}</code>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#64748b" }}>Trigger Event Status</span>
                        <span style={{ color: "#10b981" }}>SUCCESS</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#64748b" }}>Jobber/ Titan Dispatch Category</span>
                        <span>Emergency Service Request</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "sms" && (
                    <div>
                      <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "0.8rem", borderRadius: "6px", maxWidth: "280px" }}>
                        <strong style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", display: "block" }}>
                          Outgoing SMS Notification
                        </strong>
                        <p style={{ fontSize: "0.75rem", marginTop: "4px" }}>
                          "🔔 **EchoDesk AI Alert**: New emergency call from {selectedCall.caller} ({selectedCall.phone}). Issue: {selectedCall.summary.substring(0, 80)}..."
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#475569", padding: "3rem" }}>
                No call dispatch records found. Initiate a simulated call on the dialer to generate logs.
              </div>
            )}

            {/* History List */}
            {calls.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#64748b", marginBottom: "0.6rem" }}>
                  Call Logs Archive
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
                  {calls.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => { setSelectedCall(c); setErrorMsg(""); }}
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        background: selectedCall?.id === c.id ? "rgba(14,165,233,0.06)" : "rgba(255,255,255,0.01)", 
                        border: selectedCall?.id === c.id ? "1px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.03)", 
                        padding: "0.6rem 1rem", 
                        borderRadius: "8px", 
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                    >
                      <span>{c.caller} • {c.duration}</span>
                      <span style={{ color: "#64748b" }}>{c.timestamp.split(",")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
