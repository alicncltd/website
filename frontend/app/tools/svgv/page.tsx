"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../components/Navbar";
import { SvgvDecoder } from "../../../lib/svgv/decoder";
import { SvgvPlayer } from "../../../lib/svgv/player";
import * as db from "../../../lib/svgv/db";
import { 
  Video, Play, Square, RotateCcw, Volume2, Folder, 
  Trash2, Upload, Settings, Award, AlertCircle, FileText, CheckCircle2 
} from "lucide-react";
import "./svgv.css";

// Quality Presets
interface PresetValues {
  edgeThreshold: number;
  rdpTolerance: number;
  meshGridSize: number;
  rasterPatchRatio: number;
  blockSize: number;
}

const PRESETS: Record<string, PresetValues> = {
  eco: {
    edgeThreshold: 90,
    rdpTolerance: 5.0,
    meshGridSize: 16,
    rasterPatchRatio: 1.0,
    blockSize: 16
  },
  balanced: {
    edgeThreshold: 50,
    rdpTolerance: 3.0,
    meshGridSize: 32,
    rasterPatchRatio: 0.15,
    blockSize: 16
  },
  'high-vector': {
    edgeThreshold: 30,
    rdpTolerance: 1.5,
    meshGridSize: 48,
    rasterPatchRatio: 1.0,
    blockSize: 16
  },
  'max-hybrid': {
    edgeThreshold: 20,
    rdpTolerance: 1.0,
    meshGridSize: 64,
    rasterPatchRatio: 0.08,
    blockSize: 16
  },
  'full-raster': {
    edgeThreshold: 10,
    rdpTolerance: 0.5,
    meshGridSize: 64,
    rasterPatchRatio: 0.0,
    blockSize: 8
  }
};

export default function SvgvPage() {
  const [activeTab, setActiveTab] = useState<"compressor" | "player" | "gallery">("compressor");
  
  // Compressor States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [qualityPreset, setQualityPreset] = useState<string>("balanced");
  const [edgeThreshold, setEdgeThreshold] = useState<number>(50);
  const [rdpTolerance, setRdpTolerance] = useState<number>(3.0);
  const [meshGridSize, setMeshGridSize] = useState<number>(32);
  const [rasterPatchRatio, setRasterPatchRatio] = useState<number>(0.15);
  const [blockSize, setBlockSize] = useState<number>(16);

  const [processingState, setProcessingState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Synced File Stats
  const [syncedStats, setSyncedStats] = useState<{
    name: string;
    origSize: string;
    newSize: string;
    ratio: string;
    frameCount: number;
    fps: number;
    res: string;
    binary: Uint8Array | null;
  } | null>(null);

  // Player States
  const [loadedVideo, setLoadedVideo] = useState<{
    name: string;
    size: string;
    width: number;
    height: number;
    fps: number;
    frameCount: number;
  } | null>(null);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1.0);
  const [loop, setLoop] = useState<boolean>(true);
  const [currentFrameInfo, setCurrentFrameInfo] = useState<string>("0 / 0");
  const [seekBarMax, setSeekBarMax] = useState<number>(0);
  const [seekBarValue, setSeekBarValue] = useState<number>(0);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState<boolean>(false);

  // Gallery States
  const [galleryVideos, setGalleryVideos] = useState<db.SavedVideo[]>([]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const playerFileInputRef = useRef<HTMLInputElement | null>(null);
  const playerRef = useRef<SvgvPlayer | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Resolve API Base URL
  const getApiBase = () => {
    if (typeof window === "undefined") return "";
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (envUrl) return envUrl;
    
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8080";
    }
    return ""; // Same origin
  };

  // Preset Selection Sync
  useEffect(() => {
    if (qualityPreset === "custom") return;
    const config = PRESETS[qualityPreset];
    if (config) {
      setEdgeThreshold(config.edgeThreshold);
      setRdpTolerance(config.rdpTolerance);
      setMeshGridSize(config.meshGridSize);
      setRasterPatchRatio(config.rasterPatchRatio);
      setBlockSize(config.blockSize);
    }
  }, [qualityPreset]);

  // Load Gallery videos
  const fetchGallery = async () => {
    try {
      const videos = await db.getAllVideos();
      setGalleryVideos(videos);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "gallery") {
      fetchGallery();
    }
  }, [activeTab]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Format File Size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Drag and Drop Upload Zone handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      validateAndSetVideo(files[0]);
    }
  };

  const validateAndSetVideo = (file: File) => {
    if (file.type !== "video/mp4") {
      alert("Please upload an MP4 video file.");
      return;
    }
    setSelectedFile(file);
    setProcessingState("idle");
    setSyncedStats(null);
  };

  // Trigger File Input Click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Form Submit (Upload & Vectorize)
  const handleCompressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setProcessingState("processing");
    setProgressPercent(0);
    setProgressText("Uploading video...");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("edgeThreshold", String(edgeThreshold));
    formData.append("rdpTolerance", String(rdpTolerance));
    formData.append("meshGridSize", String(meshGridSize));
    formData.append("rasterPatchRatio", String(rasterPatchRatio));
    formData.append("blockSize", String(blockSize));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${getApiBase()}/api/vectorize`, true);
    xhr.responseType = "arraybuffer";

    // Track upload progress (first 40% of the bar)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        setProgressPercent(percent * 0.4);
        setProgressText(`Uploading video: ${percent.toFixed(0)}%`);
      }
    };

    // Track processing progress (remaining 60%)
    xhr.onloadstart = () => {
      let currentPct = 40;
      progressIntervalRef.current = setInterval(() => {
        if (currentPct < 95) {
          currentPct += (98 - currentPct) * 0.05; // Asymptotic progress curve
          setProgressPercent(currentPct);
          setProgressText("Processing and vectorizing frames... (this might take 1-2 mins)");
        }
      }, 1500);
    };

    xhr.onload = () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (xhr.status === 200) {
        const arrayBuffer = xhr.response as ArrayBuffer;
        const binaryData = new Uint8Array(arrayBuffer);

        // Decode header to retrieve metadata
        try {
          const decoder = new SvgvDecoder(binaryData);
          const header = decoder.getHeader();
          const targetName = selectedFile.name.replace(".mp4", ".svgv");

          setProgressPercent(100);
          setProcessingState("success");
          setSyncedStats({
            name: targetName,
            origSize: formatBytes(selectedFile.size),
            newSize: formatBytes(binaryData.length),
            ratio: ((binaryData.length / selectedFile.size) * 100).toFixed(1) + "%",
            frameCount: header.frameCount,
            fps: header.fps,
            res: `${header.width}x${header.height}`,
            binary: binaryData
          });
        } catch (err: any) {
          setProcessingState("error");
          setErrorMsg(`Decoding failed: ${err.message}`);
        }
      } else {
        setProcessingState("error");
        try {
          const decoded = new TextDecoder("utf-8").decode(xhr.response as ArrayBuffer);
          const parsed = JSON.parse(decoded);
          setErrorMsg(parsed.error || "Server processing failed.");
        } catch {
          setErrorMsg(`Server returned status code: ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProcessingState("error");
      setErrorMsg("Network request failed. Ensure the backend server is running.");
    };

    xhr.send(formData);
  };

  // Generate Simulation
  const handleSimulateBtn = async () => {
    setProcessingState("processing");
    setProgressPercent(20);
    setProgressText("Requesting simulation build...");
    setErrorMsg("");

    try {
      const res = await fetch(`${getApiBase()}/api/simulated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          width: 320,
          height: 240,
          fps: 15,
          frameCount: 120
        })
      });

      if (!res.ok) throw new Error(`Server returned error ${res.status}`);

      const buffer = await res.arrayBuffer();
      const binaryData = new Uint8Array(buffer);
      const decoder = new SvgvDecoder(binaryData);
      const header = decoder.getHeader();

      setProgressPercent(100);
      setProcessingState("success");
      setSyncedStats({
        name: "simulated_vector_preview.svgv",
        origSize: "N/A (Simulated)",
        newSize: formatBytes(binaryData.length),
        ratio: "N/A",
        frameCount: header.frameCount,
        fps: header.fps,
        res: `${header.width}x${header.height}`,
        binary: binaryData
      });
    } catch (err: any) {
      setProcessingState("error");
      setErrorMsg(err.message || "Failed to generate simulation.");
    }
  };

  // Save to Gallery
  const handleSaveToGallery = async () => {
    if (!syncedStats || !syncedStats.binary) return;
    try {
      await db.saveVideo({
        name: syncedStats.name,
        data: syncedStats.binary,
        size: syncedStats.binary.length,
        width: parseInt(syncedStats.res.split("x")[0]),
        height: parseInt(syncedStats.res.split("x")[1]),
        fps: syncedStats.fps,
        frameCount: syncedStats.frameCount
      });
      alert("Successfully saved vector video to your browser's local gallery!");
      setActiveTab("gallery");
    } catch (err) {
      alert("Failed to save to gallery cache: " + err);
    }
  };

  // Direct Play
  const handleDirectPlay = () => {
    if (!syncedStats || !syncedStats.binary) return;
    initializePlayer(syncedStats.binary, syncedStats.name);
  };

  // Load a file in player from disk
  const handlePlayerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".svgv")) {
      alert("Please upload a valid .svgv binary vector file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      const binaryData = new Uint8Array(buffer);
      initializePlayer(binaryData, file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  // Initialize SvgvPlayer
  const initializePlayer = (binaryData: Uint8Array, fileName: string) => {
    try {
      setActiveTab("player");
      
      // Delay slightly to ensure canvas DOM element is mounted
      setTimeout(() => {
        if (!canvasRef.current) {
          alert("Canvas context not available yet. Please try again.");
          return;
        }

        if (playerRef.current) {
          playerRef.current.destroy();
        }

        const decoder = new SvgvDecoder(binaryData);
        const header = decoder.getHeader();

        setLoadedVideo({
          name: fileName,
          size: formatBytes(binaryData.length),
          width: header.width,
          height: header.height,
          fps: header.fps,
          frameCount: header.frameCount
        });

        // Initialize SvgvPlayer class
        const player = new SvgvPlayer(canvasRef.current, decoder);
        playerRef.current = player;

        // Bind Callbacks
        player.setOnFrameChanged((frame, total) => {
          setSeekBarMax(total - 1);
          setSeekBarValue(frame);
          setCurrentFrameInfo(`${frame + 1} / ${total}`);
        });

        player.setOnPlayStateChanged((playing) => {
          setIsPlaying(playing);
        });

        player.setSpeed(playSpeed);
        player.setLoop(loop);

        // Auto-play
        player.play();
      }, 100);
    } catch (err: any) {
      alert(`Initialization failed: ${err.message}`);
    }
  };

  // Player controls hooks
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handleStop = () => {
    if (!playerRef.current) return;
    playerRef.current.pause();
    playerRef.current.seek(0);
  };

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSeekBarValue(val);
    playerRef.current?.seek(val);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaySpeed(speed);
    playerRef.current?.setSpeed(speed);
  };

  const toggleLoop = () => {
    const nextLoop = !loop;
    setLoop(nextLoop);
    playerRef.current?.setLoop(nextLoop);
  };

  // Gallery Handlers
  const handlePlayGalleryItem = (video: db.SavedVideo) => {
    initializePlayer(video.data, video.name);
  };

  const handleDeleteGalleryItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved video from your local cache?")) return;
    try {
      await db.deleteVideo(id);
      fetchGallery();
    } catch (err) {
      alert("Failed to delete gallery item: " + err);
    }
  };

  return (
    <>
      <Navbar />

      <main className="svgv-container">
        {/* Header Navigation */}
        <header className="svgv-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem", color: "var(--accent-color)" }}>⚡</span>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Vector Vision (SVGV)</h1>
          </div>
          <nav className="svgv-nav">
            <button 
              className={`svgv-tab-btn ${activeTab === "compressor" ? "active" : ""}`}
              onClick={() => setActiveTab("compressor")}
            >
              Vectorizer
            </button>
            <button 
              className={`svgv-tab-btn ${activeTab === "player" ? "active" : ""}`}
              onClick={() => setActiveTab("player")}
            >
              Player Viewport
            </button>
            <button 
              className={`svgv-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
              onClick={() => setActiveTab("gallery")}
            >
              IndexedDB Gallery
            </button>
          </nav>
        </header>

        {/* Tab Content Section: Compressor */}
        <section className={`svgv-section ${activeTab === "compressor" ? "active" : ""}`}>
          <div className="svgv-compressor-grid">
            {/* Left Column: Form Settings */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", borderLeft: "4px solid var(--accent-color)", paddingLeft: "10px" }}>
                Vectorization Controls
              </h2>

              <form onSubmit={handleCompressSubmit}>
                {/* Upload Zone */}
                <div 
                  className="svgv-upload-zone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="video/mp4" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) validateAndSetVideo(e.target.files[0]);
                    }}
                    style={{ display: "none" }} 
                  />
                  <Upload className="svgv-upload-icon" size={36} color="var(--accent-color)" />
                  <p className="svgv-upload-title">Choose MP4 Video</p>
                  <p className="svgv-upload-subtitle">Drag & drop or click to browse files</p>
                  
                  {selectedFile && (
                    <div className="svgv-selected-file" onClick={(e) => e.stopPropagation()}>
                      <FileText size={16} />
                      <span>{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <span className="svgv-remove-file" onClick={() => setSelectedFile(null)}>✕</span>
                    </div>
                  )}
                </div>

                {/* Preset Selector */}
                <div className="svgv-form-field">
                  <label htmlFor="preset-select">Quality Profile</label>
                  <select 
                    id="preset-select" 
                    value={qualityPreset} 
                    onChange={(e) => setQualityPreset(e.target.value)}
                  >
                    <option value="eco">Eco Profile (Maximum Compression)</option>
                    <option value="balanced">Balanced Default</option>
                    <option value="high-vector">High-Fidelity Vector outlines</option>
                    <option value="max-hybrid">Max Quality Hybrid (Details & Outlines)</option>
                    <option value="full-raster">Full Quality Raster Blocks</option>
                    <option value="custom">Custom Parameters</option>
                  </select>
                  <p className="svgv-help-text">Adjust sliders below for custom G-code mapping properties.</p>
                </div>

                {/* Range Sliders */}
                <div className="svgv-form-field">
                  <label>
                    <span>Sobel Edge Outline Threshold</span>
                    <span style={{ color: "var(--accent-color)" }}>{edgeThreshold}</span>
                  </label>
                  <input 
                    type="range" 
                    className="svgv-slider"
                    min="5" 
                    max="150" 
                    value={edgeThreshold} 
                    onChange={(e) => {
                      setEdgeThreshold(parseInt(e.target.value));
                      setQualityPreset("custom");
                    }}
                  />
                  <p className="svgv-help-text">Lower threshold captures more geometry; higher values filter out noise.</p>
                </div>

                <div className="svgv-form-field">
                  <label>
                    <span>Simplification Tolerance (RDP)</span>
                    <span style={{ color: "var(--accent-color)" }}>{rdpTolerance}px</span>
                  </label>
                  <input 
                    type="range" 
                    className="svgv-slider"
                    min="0.5" 
                    max="10" 
                    step="0.5" 
                    value={rdpTolerance} 
                    onChange={(e) => {
                      setRdpTolerance(parseFloat(e.target.value));
                      setQualityPreset("custom");
                    }}
                  />
                  <p className="svgv-help-text">Controls path node density. Higher values simplify paths, reducing file size.</p>
                </div>

                <div className="svgv-form-field">
                  <label>
                    <span>Background Mesh Grid Resolution</span>
                    <span style={{ color: "var(--accent-color)" }}>{meshGridSize} cols</span>
                  </label>
                  <input 
                    type="range" 
                    className="svgv-slider"
                    min="8" 
                    max="64" 
                    step="4" 
                    value={meshGridSize} 
                    onChange={(e) => {
                      setMeshGridSize(parseInt(e.target.value));
                      setQualityPreset("custom");
                    }}
                  />
                  <p className="svgv-help-text">Resolution of low-poly gradient cells rendering the video backdrop.</p>
                </div>

                <div className="svgv-form-field">
                  <label>
                    <span>Raster Patch Detail Ratio</span>
                    <span style={{ color: "var(--accent-color)" }}>{rasterPatchRatio === 1.0 ? "Disabled (1.0)" : rasterPatchRatio}</span>
                  </label>
                  <input 
                    type="range" 
                    className="svgv-slider"
                    min="0.0" 
                    max="1.0" 
                    step="0.05" 
                    value={rasterPatchRatio} 
                    onChange={(e) => {
                      setRasterPatchRatio(parseFloat(e.target.value));
                      setQualityPreset("custom");
                    }}
                  />
                  <p className="svgv-help-text">Edge density threshold to generate photo-detail raster patches. 1.0 disables raster.</p>
                </div>

                <div className="svgv-form-field">
                  <label>
                    <span>Raster Block Size</span>
                    <span style={{ color: "var(--accent-color)" }}>{blockSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    className="svgv-slider"
                    min="8" 
                    max="64" 
                    step="8" 
                    value={blockSize} 
                    onChange={(e) => {
                      setBlockSize(parseInt(e.target.value));
                      setQualityPreset("custom");
                    }}
                  />
                  <p className="svgv-help-text">Dimensions of rasterization patch blocks. Smaller sizes yield finer details.</p>
                </div>

                {/* Actions */}
                <div className="svgv-action-buttons">
                  <button 
                    type="button" 
                    className="btn-outline" 
                    style={{ padding: "0.7rem" }}
                    onClick={handleSimulateBtn}
                  >
                    Simulate Demo SVGV
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ padding: "0.7rem" }}
                    disabled={!selectedFile || processingState === "processing"}
                  >
                    Start Vectorization
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Processing Status */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", borderLeft: "4px solid var(--accent-color)", paddingLeft: "10px" }}>
                Compilation Status
              </h2>

              <div className="svgv-status-container">
                {processingState === "idle" && (
                  <div>
                    <div className="svgv-status-icon">⚙️</div>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Upload an MP4 or generate a simulation, then click <strong>Start Vectorization</strong>.
                    </p>
                  </div>
                )}

                {processingState === "processing" && (
                  <div style={{ width: "100%" }}>
                    <div className="svgv-spinner" style={{ margin: "0 auto 1.5rem" }}></div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#ffffff" }}>Compiling Vector Video...</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                      Processing frames on Express backend. Output is streamed directly to keep memory footprints low.
                    </p>
                    <div className="svgv-progress-container">
                      <div className="svgv-progress-bar" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontWeight: 500 }}>
                      {progressText}
                    </p>
                  </div>
                )}

                {processingState === "success" && syncedStats && (
                  <div style={{ width: "100%" }}>
                    <div className="svgv-success-icon" style={{ margin: "0 auto 1.5rem" }}><CheckCircle2 size={32} /></div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#10b981" }}>Vectorization Successful!</h3>
                    
                    <div className="svgv-stats-summary">
                      <table className="info-table">
                        <tbody>
                          <tr><td>Filename:</td><td>{syncedStats.name}</td></tr>
                          <tr><td>Original Size:</td><td>{syncedStats.origSize}</td></tr>
                          <tr><td>Compressed Size:</td><td>{syncedStats.newSize}</td></tr>
                          <tr><td>Compression Ratio:</td><td style={{ color: "var(--accent-color)" }}>{syncedStats.ratio}</td></tr>
                          <tr><td>Resolution:</td><td>{syncedStats.res}</td></tr>
                          <tr><td>Playback Rate:</td><td>{syncedStats.fps} FPS ({syncedStats.frameCount} frames)</td></tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="svgv-success-actions">
                      <button className="btn-outline" onClick={handleSaveToGallery}>
                        Save to Gallery Cache
                      </button>
                      <button className="btn-primary" onClick={handleDirectPlay}>
                        Play Instantly
                      </button>
                    </div>
                  </div>
                )}

                {processingState === "error" && (
                  <div>
                    <div className="svgv-error-icon" style={{ margin: "0 auto 1.5rem" }}><AlertCircle size={32} /></div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.5rem" }}>Processing Failed</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{errorMsg}</p>
                    <button 
                      className="btn-outline" 
                      style={{ marginTop: "1.5rem", padding: "0.5rem 1.5rem" }}
                      onClick={() => setProcessingState("idle")}
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tab Content Section: Player */}
        <section className={`svgv-section ${activeTab === "player" ? "active" : ""}`}>
          <div className="svgv-player-layout">
            {/* Player Screen Viewport */}
            <div className="glass-panel svgv-viewport-card">
              <div className="svgv-viewport-header">
                <span className="svgv-playing-title">
                  {loadedVideo ? loadedVideo.name : "No file loaded"}
                </span>
                <span className="svgv-viewport-hints">
                  Scroll: Zoom | Drag: Pan | Double Click: Recenter
                </span>
              </div>

              {/* Canvas Board */}
              <div 
                className={`svgv-canvas-wrapper ${isDragOverCanvas ? "dragover" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverCanvas(true);
                }}
                onDragLeave={() => setIsDragOverCanvas(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverCanvas(false);
                  const file = e.dataTransfer?.files?.[0];
                  if (file && file.name.endsWith(".svgv")) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const buffer = event.target?.result as ArrayBuffer;
                      initializePlayer(new Uint8Array(buffer), file.name);
                    };
                    reader.readAsArrayBuffer(file);
                  } else {
                    alert("Only .svgv files can be dropped here.");
                  }
                }}
              >
                <canvas ref={canvasRef} id="player-canvas" width={640} height={480}></canvas>
                {!loadedVideo && (
                  <div className="svgv-drop-overlay">
                    <div className="svgv-drop-icon">🎬</div>
                    <p style={{ fontWeight: 500 }}>Drag & Drop .svgv file here to play</p>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="svgv-player-controls">
                <div className="svgv-controls-top">
                  <span className="svgv-current-time">{currentFrameInfo}</span>
                  <input 
                    type="range" 
                    className="svgv-seek-bar"
                    min="0"
                    max={seekBarMax}
                    value={seekBarValue}
                    onChange={handleSeekBarChange}
                    disabled={!loadedVideo}
                  />
                </div>
                <div className="svgv-controls-bottom">
                  <div className="svgv-controls-left">
                    <button 
                      className="svgv-control-btn"
                      onClick={togglePlay}
                      disabled={!loadedVideo}
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button 
                      className="svgv-control-btn"
                      onClick={handleStop}
                      disabled={!loadedVideo}
                    >
                      Stop
                    </button>
                  </div>
                  <div className="svgv-controls-right">
                    <div className="svgv-control-item">
                      <label>Playback Speed</label>
                      <select 
                        value={playSpeed} 
                        onChange={handleSpeedChange}
                        disabled={!loadedVideo}
                      >
                        <option value="0.5">0.5x</option>
                        <option value="1.0">1.0x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2.0">2.0x</option>
                      </select>
                    </div>
                    <button 
                      className={`svgv-control-btn ${loop ? "active" : ""}`}
                      onClick={toggleLoop}
                      disabled={!loadedVideo}
                      title="Toggle Loop"
                    >
                      🔁
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Loader & Info */}
            <div className="svgv-file-loader-card">
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem", color: "var(--accent-color)" }}>
                  Load SVGV Binary
                </h3>
                <div className="svgv-load-zone">
                  <input 
                    type="file" 
                    ref={playerFileInputRef}
                    accept=".svgv"
                    onChange={handlePlayerFileChange}
                    style={{ display: "none" }}
                  />
                  <Folder className="svgv-load-icon" size={24} />
                  <p>Load from local hard drive</p>
                  <button 
                    className="btn-outline" 
                    style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}
                    onClick={() => playerFileInputRef.current?.click()}
                  >
                    Browse Files
                  </button>
                </div>
              </div>

              {loadedVideo && (
                <div className="glass-panel svgv-loaded-info-box" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", color: "#10b981" }}>
                    File Details
                  </h3>
                  <table className="info-table">
                    <tbody>
                      <tr><td>Name:</td><td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>{loadedVideo.name}</td></tr>
                      <tr><td>Binary Size:</td><td>{loadedVideo.size}</td></tr>
                      <tr><td>Dimensions:</td><td>{loadedVideo.width}x{loadedVideo.height}</td></tr>
                      <tr><td>Framerate:</td><td>{loadedVideo.fps} FPS</td></tr>
                      <tr><td>Total Frames:</td><td>{loadedVideo.frameCount}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tab Content Section: Gallery */}
        <section className={`svgv-section ${activeTab === "gallery" ? "active" : ""}`}>
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <div className="svgv-gallery-header">
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, borderLeft: "4px solid var(--accent-color)", paddingLeft: "10px" }}>
                Local IndexedDB Gallery
              </h2>
              <p>Cached vector videos saved in your local browser sandbox. No server limits apply.</p>
            </div>

            <div className="svgv-gallery-grid">
              {galleryVideos.length > 0 ? (
                galleryVideos.map((video) => (
                  <div key={video.id} className="svgv-gallery-item">
                    <div className="svgv-item-details">
                      <h4>{video.name}</h4>
                      <div className="svgv-item-meta">
                        <div>Size: {formatBytes(video.size)}</div>
                        <div>Resolution: {video.width}x{video.height}</div>
                        <div>Framerate: {video.fps} FPS ({video.frameCount} frames)</div>
                        <div>Saved: {new Date(video.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="svgv-item-actions">
                      <button 
                        className="btn-outline" 
                        onClick={(e) => handleDeleteGalleryItem(e, video.id!)}
                      >
                        <Trash2 size={12} style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }} />
                        Delete
                      </button>
                      <button 
                        className="btn-primary" 
                        onClick={() => handlePlayGalleryItem(video)}
                      >
                        Play
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="svgv-gallery-empty">
                  <div className="svgv-empty-icon">📂</div>
                  <h3>Your Local Gallery is Empty</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                    Go to the <strong>Vectorizer</strong> tab, compile a video, and click <strong>Save to Gallery Cache</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
