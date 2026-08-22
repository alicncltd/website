"use client";

import React, { useRef, useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { Edit2, Eraser, Trash2, Users, Radio, RefreshCw } from "lucide-react";
import "./workspace.css";

interface Cursor {
  x: number;
  y: number;
  username: string;
}

export default function WorkspacePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState<string>("#0ea5e9");
  const [brushSize, setBrushSize] = useState<number>(4);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [otherCursors, setOtherCursors] = useState<Record<string, Cursor>>({});
  const [wsStatus, setWsStatus] = useState<"CONNECTED" | "CONNECTING" | "DISCONNECTED">("DISCONNECTED");
  const socketRef = useRef<WebSocket | null>(null);
  const [username] = useState<string>(() => `User_${Math.floor(Math.random() * 900) + 100}`);

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set display size matching CSS layout
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 600;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Handle resizing
    const handleResize = () => {
      // Store current drawing to restore
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

      canvas.width = canvas.parentElement?.clientWidth || 800;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = color;
      context.lineWidth = brushSize;
      
      // Restore drawing
      context.drawImage(tempCanvas, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync stroke configuration
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === "eraser" ? "#090d16" : color;
      contextRef.current.lineWidth = tool === "eraser" ? brushSize * 4 : brushSize;
    }
  }, [color, brushSize, tool]);

  // Establish WebSocket connection
  useEffect(() => {
    setWsStatus("CONNECTING");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    
    if (!backendUrl && typeof window !== "undefined") {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        backendUrl = "http://localhost:8080";
      }
    }

    const wsHost = backendUrl ? backendUrl.replace(/^https?:\/\//, "") : (typeof window !== "undefined" ? window.location.host : "");
    const wsUrl = `${protocol}//${wsHost}/api/tools/workspace/sync`;

    console.log("Connecting workspace socket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setWsStatus("CONNECTED");
      setRoomUsers([username]);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "draw" && contextRef.current) {
          const ctx = contextRef.current;
          const origStroke = ctx.strokeStyle;
          const origWidth = ctx.lineWidth;

          ctx.strokeStyle = payload.color;
          ctx.lineWidth = payload.size;
          ctx.beginPath();
          ctx.moveTo(payload.startX, payload.startY);
          ctx.lineTo(payload.endX, payload.endY);
          ctx.stroke();

          ctx.strokeStyle = origStroke;
          ctx.lineWidth = origWidth;
        } else if (payload.type === "cursor") {
          setOtherCursors((prev) => ({
            ...prev,
            [payload.username]: { x: payload.x, y: payload.y, username: payload.username }
          }));
          
          setRoomUsers((prev) => {
            if (prev.includes(payload.username)) return prev;
            return [...prev, payload.username];
          });
        } else if (payload.type === "clear") {
          const canvas = canvasRef.current;
          if (canvas && contextRef.current) {
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (err) {
        console.error("Error parsing workspace ws payload:", err);
      }
    };

    ws.onclose = () => {
      setWsStatus("DISCONNECTED");
      console.log("Workspace WS closed. Reconnecting in 5s...");
      setTimeout(() => {
        // Simple reconnect logic if component is still mounted
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Drawing event handlers
  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    
    const { offsetX, offsetY } = nativeEvent;
    
    // Get prior positions using private canvas api
    const lastX = (contextRef.current as any).lastX || offsetX;
    const lastY = (contextRef.current as any).lastY || offsetY;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    // Broadcast drawing stroke
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "draw",
        startX: lastX,
        startY: lastY,
        endX: offsetX,
        endY: offsetY,
        color: tool === "eraser" ? "#090d16" : color,
        size: tool === "eraser" ? brushSize * 4 : brushSize
      }));
    }

    // Cache current positions
    (contextRef.current as any).lastX = offsetX;
    (contextRef.current as any).lastY = offsetY;
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
      (contextRef.current as any).lastX = null;
      (contextRef.current as any).lastY = null;
    }
    setIsDrawing(false);
  };

  // Broadcast mouse position
  const handleMouseMove = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    
    if (isDrawing) {
      draw({ nativeEvent } as any);
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "cursor",
        x: offsetX,
        y: offsetY,
        username
      }));
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "clear" }));
    }
  };

  return (
    <>
      <Navbar />
      <main className="workspace-container">
        <header className="workspace-header">
          <div className="oracle-title-area">
            <h1>Multiplayer Collaborative Canvas</h1>
            <p>Real-time vector sketch board synchronized via WebSockets with dynamic user pointers</p>
          </div>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className={`oracle-badge`} style={{ 
              borderColor: wsStatus === "CONNECTED" ? "#10b981" : wsStatus === "CONNECTING" ? "#f59e0b" : "#ef4444",
              background: wsStatus === "CONNECTED" ? "rgba(16, 185, 129, 0.15)" : wsStatus === "CONNECTING" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: wsStatus === "CONNECTED" ? "#10b981" : wsStatus === "CONNECTING" ? "#f59e0b" : "#ef4444"
            }}>
              {wsStatus}
            </span>
          </div>
        </header>

        <section className="workspace-canvas-area">
          {/* Tool Options sidebar */}
          <aside className="workspace-sidebar">
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Drawing Brushes
              </h3>
              <div className="workspace-tools-grid">
                <button
                  onClick={() => setTool("pen")}
                  className={`workspace-tool-btn ${tool === "pen" ? "active" : ""}`}
                >
                  <Edit2 size={18} />
                  Ink Pen
                </button>
                <button
                  onClick={() => setTool("eraser")}
                  className={`workspace-tool-btn ${tool === "eraser" ? "active" : ""}`}
                >
                  <Eraser size={18} />
                  Eraser
                </button>
              </div>
            </div>

            {tool === "pen" && (
              <div>
                <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                  Palette
                </h3>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: "100%", height: "40px", cursor: "pointer", border: "1px solid var(--glass-border)", borderRadius: "8px", background: "none" }}
                />
              </div>
            )}

            <div>
              <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Brush Diameter ({brushSize}px)
              </h3>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>

            <button onClick={handleClearCanvas} className="oracle-btn" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", boxShadow: "none" }}>
              <Trash2 size={16} />
              Clear Board
            </button>

            <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                <Users size={16} className="text-sky-500" />
                Active Peers ({roomUsers.length})
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {roomUsers.map((user, idx) => (
                  <li key={idx}>
                    • {user} {user === username ? "(You)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Interactive Canvas grid */}
          <div className="workspace-canvas-wrapper">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onMouseMove={handleMouseMove}
              className="workspace-canvas"
            />

            {/* Float pointers of other users */}
            {Object.values(otherCursors).map((cur) => (
              <div
                key={cur.username}
                className="workspace-cursor"
                style={{
                  transform: `translate(${cur.x}px, ${cur.y}px)`
                }}
              >
                <div className="workspace-cursor-dot" />
                <span className="workspace-cursor-label">{cur.username}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
