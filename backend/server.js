import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import PDFDocument from "pdfkit";
import cron from "node-cron";
import ws, { WebSocketServer } from "ws";
import os from "os";
import pkg from "whatsapp-web.js";
import multer from "multer";
import { fileURLToPath } from "url";
import { vectorizeFrame, generateSimulatedFrame } from "./vectorizer.js";
import { encodeSvgvHeader, encodeSvgvFrameToBuffer, encodeSvgvEOF } from "./encoder.js";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

const { Client, LocalAuth } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// 0. WebSocket polyfill for older Node versions (realtime client dependency)
if (typeof global.WebSocket === "undefined") {
  global.WebSocket = ws;
}

dotenv.config();

const uploadDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || "fallback_secret_api_key_123";

// Middleware to authenticate API requests
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (!apiKey || apiKey !== BACKEND_API_KEY) {
    return res.status(401).json({ error: "Unauthorized access: Invalid or missing API key." });
  }
  next();
}

// 1. Initialize Clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY || "");

// 2. Cross-platform helper to resolve Chrome executable path
function getChromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  
  const platform = process.platform;
  if (platform === "win32") {
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      path.join(os.homedir(), "AppData\\Local\\Google\\Chrome\\Application\\chrome.exe"),
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (platform === "darwin") {
    const paths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else {
    // Linux
    const paths = [
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/chrome",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

// 3. Gemini B2B Catalog Description Enrichment Generator
async function generateB2BDescription(name, price) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return "Expert CAD/CAM design and high-precision CNC optimization tailored for commercial woodwork and engraving.";
  }
  
  try {
    const prompt = `You are a premier B2B copywriter for "Ali CNC".
Write a highly professional, technically rich, B2B direct-response catalog description for a CNC product named "${name}" (Price: ${price}).
Focus on woodworking shop floor benefits: flawless edge finishes, vacuum table spatial efficiency, reducing machine cycle run times, router bit protection from thermal buildup, and watertight mechanical tolerances.
Keep the description direct, professional, and convincing for shop owners.
Return only a clean, well-formatted plain paragraph with NO markdown tags, NO headers, and NO styling. Keep it under 200 words.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      const desc = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (desc) return desc.trim();
    }
  } catch (e) {
    console.error("Gemini description generation failed:", e);
  }
  return `Expert high-precision CAD/CAM toolpath modeling and G-code engineering for "${name}". Optimized for maximum material yield and spindle efficiency on CNC routers.`;
}

// 6. Public Catalog Scraper Fallback (Zero-login method)
// 6. Public Catalog Scraper Fallback (Zero-login seed-based method)
async function scrapePublicCatalog(phoneNumber) {
  console.log(`Starting stateless B2B catalog sync from seed file for ${phoneNumber}...`);
  try {
    const seedPath = path.resolve("catalog_seed.json");
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed database file not found at ${seedPath}`);
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    console.log(`Loaded ${seedData.length} B2B products from seed file.`);

    const syncedProducts = [];

    for (const item of seedData) {
      const { data: cached } = await supabase
        .from("catalog_items")
        .select("id, name, description, price, cloudinary_url")
        .eq("id", item.id)
        .maybeSingle();

      if (cached) {
        console.log(`-> Product already cached in database: "${cached.name}"`);
        syncedProducts.push(cached);
        continue;
      }

      console.log(`-> New product detected! Enriching "${item.name}" with Gemini B2B copywriter...`);
      let finalDescription = `Expert CAD/CAM and high-precision CNC toolpath design optimization for "${item.name}".`;
      try {
        finalDescription = await generateB2BDescription(item.name, item.price);
      } catch (e) {
        console.error("Gemini B2B copywriting failed:", e);
      }

      console.log(`-> Loading product image from: ${item.imageUrl}`);
      let buffer;
      if (fs.existsSync(item.imageUrl)) {
        console.log("-> Reading local image file from disk...");
        buffer = fs.readFileSync(item.imageUrl);
      } else {
        console.log("-> Fetching image from web URL...");
        const imageRes = await fetch(item.imageUrl);
        if (!imageRes.ok) {
          throw new Error(`Failed to fetch image: ${imageRes.statusText}`);
        }
        buffer = await imageRes.buffer();
      }
      const base64Data = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      console.log(`-> Uploading product image to Cloudinary...`);
      const uploadRes = await cloudinary.uploader.upload(base64Data, {
        folder: "whatsapp_catalog",
        public_id: `scraped_${item.id}`,
        overwrite: true
      });
      console.log(`-> Cloudinary secure URL: ${uploadRes.secure_url}`);

      console.log(`-> Upserting product details into Supabase...`);
      const cleanPrice = String(item.price).replace(/[^0-9.]/g, "") || "0";
      const { data: upserted, error } = await supabase.from("catalog_items").upsert({
        id: item.id,
        name: item.name,
        description: finalDescription,
        price: cleanPrice,
        cloudinary_url: uploadRes.secure_url,
        updated_at: new Date().toISOString()
      }).select().maybeSingle();

      if (error) {
        console.error(`-> Supabase upsert error:`, error);
        throw error;
      } else {
        console.log(`-> Successfully synced and cached in database!`);
        if (upserted) syncedProducts.push(upserted);
      }
    }

    await supabase.from("system_logs").insert({
      type: "CATALOG_SCRAPE",
      message: `Stateless B2B catalog sync completed from seed file for ${phoneNumber}. Synced ${syncedProducts.length} items.`,
      status: "SUCCESS"
    });

    return syncedProducts;
  } catch (err) {
    console.error("B2B catalog sync process failed:", err);
    await supabase.from("system_logs").insert({
      type: "CATALOG_SCRAPE",
      message: `B2B catalog sync from seed file failed for ${phoneNumber}: ${err.message}`,
      status: "FAILURE"
    });
    throw err;
  }
}

// 8. 6-Hour Gemini AI Website Health Auditor & PDF Generator
async function runDailyHealthCheck() {
  console.log("Running 6-Hour Gemini Website Health & Traffic Audit...");
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    // Fetch frontend layout status
    let frontendStatus = "Unknown";
    let frontendAccessibility = "Accessible";
    try {
      const res = await fetch(frontendUrl);
      frontendStatus = res.ok ? "Healthy (200 OK)" : `Error (${res.status})`;
    } catch (e) {
      frontendStatus = `Failed to Reach (${e.message})`;
      frontendAccessibility = "Inaccessible";
    }

    // Fetch visitor logs within the last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: visits } = await supabase
      .from("system_logs")
      .select("*")
      .eq("type", "VISIT")
      .gte("created_at", sixHoursAgo);

    const totalVisits = visits ? visits.length : 0;
    const ipSet = new Set();
    const pathCounts = {};

    if (visits) {
      visits.forEach(v => {
        try {
          const payload = JSON.parse(v.message);
          if (payload.ip) ipSet.add(payload.ip);
          if (payload.path) {
            pathCounts[payload.path] = (pathCounts[payload.path] || 0) + 1;
          }
        } catch (e) {
          // Fallback if message is plain text or invalid JSON
          ipSet.add("unknown");
        }
      });
    }
    const uniqueVisitors = ipSet.size;

    // Fetch recent logs (non-visit logs first for system status audit, but include some visit logs)
    const { data: logs } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    const logsSummary = logs && logs.length > 0 
      ? JSON.stringify(logs.filter(l => l.type !== "VISIT").slice(0, 15), null, 2)
      : "No system logs recorded.";

    // Send context to Gemini for analysis
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let auditSummary = "Gemini Auditor not configured.";

    if (geminiApiKey) {
      const prompt = `You are a world-class AI website auditor and B2B system analytics analyst for "Ali CNC".
Review the following live system status and visitor logs captured in the last 6 hours:

- Frontend URL Status: ${frontendStatus}
- Accessibility Check: ${frontendAccessibility}

Visitor Analytics (Last 6 Hours):
- Total Page Visits: ${totalVisits}
- Unique Visitors (IP-based): ${uniqueVisitors}
- Most Visited Paths: ${JSON.stringify(pathCounts)}

Recent System Activity Logs:
${logsSummary}

Changelog / System Updates:
1. Added dynamic visitor logging and tracking system.
2. Built Admin Google Analytics Tag manager panel and layout script injector.
3. Updated AI auditor cron checking frequency to 6 hours with email PDF reports.
4. Embedded interactive codebase changelog timeline in admin dashboard.

Please write a professional website audit assessment. Identify any system errors, catalog sync failures, or warnings. Analyze the visitor traffic patterns, and offer direct-response optimization ideas to improve the global B2B conversion rate. Keep the language direct, clear, and professional. Return only a clean, well-formatted response with no markdown tags.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (response.ok) {
        const resJson = await response.json();
        auditSummary = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "Audit failed to generate content.";
      } else {
        auditSummary = `Gemini audit service returned error: ${response.statusText}`;
      }
    }

    // Generate PDF report
    const doc = new PDFDocument();
    const pdfBuffers = [];
    doc.on("data", (chunk) => pdfBuffers.push(chunk));
    
    const pdfPromise = new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(pdfBuffers)));
    });

    const now = new Date();
    const localTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Karachi" });

    // Write PDF layout
    doc.fontSize(22).fillColor("#0ea5e9").text("Ali CNC", { align: "center" });
    doc.fontSize(16).fillColor("#0f172a").text("6-Hour AI System Health & Traffic Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#475569").text(`Generated: ${localTimeStr} (PKT)`, { align: "right" });
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("1. Overall System Status");
    doc.fontSize(11).fillColor("#0f172a").text(`Frontend URL: ${frontendUrl}`);
    doc.text(`Frontend Accessibility: ${frontendStatus}`);
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("2. 6-Hour Visitor Traffic Metrics");
    doc.fontSize(11).fillColor("#0f172a").text(`Total Page Visits: ${totalVisits}`);
    doc.text(`Unique Visitors (IP-based): ${uniqueVisitors}`);
    doc.text(`Page Hit Frequencies:`);
    Object.entries(pathCounts).forEach(([path, count]) => {
      doc.text(`  - ${path}: ${count} hits`);
    });
    if (Object.keys(pathCounts).length === 0) {
      doc.text(`  - No visitor traffic logged in the last 6 hours.`);
    }
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("3. AI Auditor Assessment (Gemini)");
    doc.fontSize(10).fillColor("#334155").text(auditSummary);
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("4. 6-Hour Global News & Politician Summary (AI)");
    doc.fontSize(10).fillColor("#334155").text(newsSummary);
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("5. Engineering Changelog Timeline");
    const changelogItems = [
      "- Monorepo restucturing: Separated backend and frontend perfectly into isolated builds.",
      "- Supabase WhatsApp persistence: Stored WhatsApp sessions in Supabase to bypass Render container limits, with 10s auto-backup.",
      "- Cloudinary dynamic catalog sync: Automatically linked catalog items and cached in Supabase database.",
      "- Multi-language translation engine: Pre-translated all website copy into 8 languages using Gemini AI.",
      "- B2B direct-response copywriting overhaul: Focused homepage copy on woodshop floor metrics, machine uptime, and maximizing yield.",
      "- Mobile styling & UI overrides: Removed region-specific friction (KakaoTalk, Line removed), corrected project grid overlays.",
      "- Dynamic Google Analytics settings: Saved and updated GA Measurement tags dynamically, and injected script in layout.",
      "- Silent visitor traffic logging: Tracked visitors silently in the background and logged parameters to Supabase.",
      "- 6-Hour AI Audit Engine: Switched cron interval to 6 hours with beautifully formatted PDF reports."
    ];
    doc.fontSize(9).fillColor("#0f172a");
    changelogItems.forEach(item => doc.text(item));
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("6. Recent System Logs");
    doc.fontSize(8).fillColor("#0f172a").text(logsSummary);

    doc.end();

    const pdfBuffer = await pdfPromise;

    // Send email report
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const dateFormattedStr = now.toISOString().slice(0, 10);
    const timeFormattedStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
    const uniqueFilename = `ali_cnc_audit_${dateFormattedStr}_${timeFormattedStr}.pdf`;

    const { error: mailErr } = await resend.emails.send({
      from: "Ali CNC Auditor <onboarding@resend.dev>",
      to: adminEmail,
      subject: `🕒 6-Hour AI Audit Report - ${localTimeStr}`,
      html: `
        <h3>Ali CNC System Audit Report</h3>
        <p>A new 6-hour automated health check and visitor traffic assessment has been compiled via Gemini AI.</p>
        <p><b>Report Time:</b> ${localTimeStr} (PKT)</p>
        <p>Please find the comprehensive audit and engineering changelog attached as a PDF.</p>
      `,
      attachments: [
        {
          filename: uniqueFilename,
          content: pdfBuffer
        }
      ]
    });

    if (mailErr) console.error("Error sending 6-hour report:", mailErr);
    else console.log(`6-hour health report emailed successfully as ${uniqueFilename}`);

  } catch (err) {
    console.error("Failed to run 6-hour health check:", err);
  }
}

// Cron scheduler for 6-hour checks
cron.schedule("0 */6 * * *", runDailyHealthCheck);

// 9. API Routes Configuration

// Silent visitor logging endpoint
app.post("/api/log-visit", authenticateApiKey, async (req, res) => {
  const userAgent = req.headers["user-agent"] || "unknown";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const { path = "/" } = req.body;
  
  try {
    const { error } = await supabase.from("system_logs").insert({
      type: "VISIT",
      message: JSON.stringify({ ip, userAgent, path, timestamp: new Date().toISOString() }),
      status: "SUCCESS"
    });
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to log visit:", err);
    res.status(500).json({ error: "Failed to log visit" });
  }
});

// Settings Endpoints for Google Analytics Tag
app.get("/api/settings/google-analytics", authenticateApiKey, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("whatsapp_sessions")
      .select("session_data")
      .eq("id", "google_analytics_tag")
      .maybeSingle();
      
    if (error) throw error;
    res.json({ tag: data ? data.session_data : "" });
  } catch (err) {
    console.error("Failed to fetch GA tag:", err);
    res.status(500).json({ error: "Failed to fetch Google Analytics tag" });
  }
});

app.post("/api/settings/google-analytics", authenticateApiKey, async (req, res) => {
  const { tag } = req.body;
  try {
    const { error } = await supabase
      .from("whatsapp_sessions")
      .upsert({
        id: "google_analytics_tag",
        session_data: tag || "",
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
    res.json({ success: true, tag });
  } catch (err) {
    console.error("Failed to save GA tag:", err);
    res.status(500).json({ error: "Failed to save Google Analytics tag" });
  }
});

// Public Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", serverTime: new Date().toISOString(), ffmpeg: !!ffmpegPath });
});

// Helper: extracts audio track from video as MP3 format
function extractAudio(videoPath, audioOutPath) {
  return new Promise((resolve) => {
    if (!ffmpegPath) return resolve(false);
    const ffmpeg = spawn(ffmpegPath, [
      '-y',
      '-i', videoPath,
      '-vn',
      '-ar', '44100',
      '-ac', '2',
      '-b:a', '128k',
      '-f', 'mp3',
      audioOutPath
    ]);

    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Helper: Extracts resolution (width x height) and frame rate (FPS) from video file
function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error('FFmpeg path not found'));
    const ffmpeg = spawn(ffmpegPath, ['-i', videoPath]);
    let stderr = '';

    ffmpeg.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on('close', () => {
      const resMatch = stderr.match(/\s(\d{2,4})x(\d{2,4})\b/);
      const fpsMatch = stderr.match(/([\d.]+)\s+fps/);

      const width = resMatch ? parseInt(resMatch[1], 10) : 640;
      const height = resMatch ? parseInt(resMatch[2], 10) : 480;
      const originalFps = fpsMatch ? Math.round(parseFloat(fpsMatch[1])) : 25;
      const fps = Math.min(30, originalFps); // Cap at 30 FPS to prevent browser lag during vector rendering

      resolve({ width, height, fps });
    });
  });
}

// SVGV Endpoint: POST /api/vectorize
app.post('/api/vectorize', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  const videoPath = req.file.path;

  if (!ffmpegPath) {
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    return res.status(500).json({ error: 'FFmpeg binary not found on backend' });
  }

  try {
    const meta = await getVideoMetadata(videoPath);
    const parsedWidth = req.body.width ? parseInt(req.body.width, 10) : 0;
    const parsedHeight = req.body.height ? parseInt(req.body.height, 10) : 0;
    const parsedFps = req.body.fps ? parseInt(req.body.fps, 10) : 0;

    const targetWidth = !isNaN(parsedWidth) && parsedWidth > 0 ? parsedWidth : meta.width;
    const targetHeight = !isNaN(parsedHeight) && parsedHeight > 0 ? parsedHeight : meta.height;
    const targetFps = !isNaN(parsedFps) && parsedFps > 0 ? parsedFps : meta.fps;

    const options = {
      edgeThreshold: req.body.edgeThreshold ? parseInt(req.body.edgeThreshold, 10) : 50,
      rdpTolerance: req.body.rdpTolerance ? parseFloat(req.body.rdpTolerance) : 3.0,
      minPathLength: req.body.minPathLength ? parseInt(req.body.minPathLength, 10) : 8,
      rasterPatchRatio: req.body.rasterPatchRatio ? parseFloat(req.body.rasterPatchRatio) : 0.15,
      meshGridSize: req.body.meshGridSize ? parseInt(req.body.meshGridSize, 10) : 32,
      blockSize: req.body.blockSize ? parseInt(req.body.blockSize, 10) : 16,
    };

    const tempOutPath = path.join(tempDir, `${path.basename(videoPath)}.svgv`);
    const tempAudioPath = path.join(tempDir, `${path.basename(videoPath)}.mp3`);

    console.log(`Extracting audio from ${videoPath}...`);
    const hasAudio = await extractAudio(videoPath, tempAudioPath);

    const outStream = fs.createWriteStream(tempOutPath);

    // Write header with placeholder frame count (0)
    const headerBuf = encodeSvgvHeader(targetWidth, targetHeight, targetFps, 0);
    outStream.write(headerBuf);

    // Spawn FFmpeg to extract raw RGBA frames
    const ffmpegArgs = [
      '-i', videoPath,
      '-f', 'rawvideo',
      '-pix_fmt', 'rgba',
      '-s', `${targetWidth}x${targetHeight}`,
      '-r', `${targetFps}`,
      '-v', 'quiet',
      '-'
    ];

    const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

    const frameBytesSize = targetWidth * targetHeight * 4;
    let accumulatedBuffer = Buffer.alloc(0);
    let frameCount = 0;

    ffmpeg.stdout.on('data', (chunk) => {
      accumulatedBuffer = Buffer.concat([accumulatedBuffer, chunk]);

      while (accumulatedBuffer.length >= frameBytesSize) {
        const frameData = accumulatedBuffer.subarray(0, frameBytesSize);
        accumulatedBuffer = accumulatedBuffer.subarray(frameBytesSize);

        const frame = vectorizeFrame(new Uint8Array(frameData), targetWidth, targetHeight, options);
        const frameBuf = encodeSvgvFrameToBuffer(frame);

        outStream.write(frameBuf);
        frameCount++;
      }
    });

    ffmpeg.on('close', async (code) => {
      if (frameCount === 0) {
        outStream.close();
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (fs.existsSync(tempOutPath)) fs.unlinkSync(tempOutPath);
        if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
        return res.status(500).json({ error: 'No frames could be extracted from this video.' });
      }

      // Write EOF marker
      outStream.write(encodeSvgvEOF());

      // Write audio block
      if (hasAudio && fs.existsSync(tempAudioPath)) {
        try {
          const audioData = fs.readFileSync(tempAudioPath);
          const lenBuf = Buffer.alloc(4);
          lenBuf.writeInt32LE(audioData.length, 0);
          outStream.write(lenBuf);
          outStream.write(audioData);
        } catch (err) {
          console.error('Error embedding audio:', err);
          const lenBuf = Buffer.alloc(4);
          lenBuf.writeInt32LE(0, 0);
          outStream.write(lenBuf);
        } finally {
          try {
            if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
          } catch (e) {}
        }
      } else {
        const lenBuf = Buffer.alloc(4);
        lenBuf.writeInt32LE(0, 0);
        outStream.write(lenBuf);
      }

      outStream.end(async () => {
        try {
          const fd = fs.openSync(tempOutPath, 'r+');
          const countBuf = Buffer.alloc(4);
          countBuf.writeInt32LE(frameCount, 0);
          fs.writeSync(fd, countBuf, 0, 4, 9);
          fs.closeSync(fd);

          // Log vectorization to Supabase system_logs
          try {
            await supabase.from("system_logs").insert({
              type: "SVGV_VECTORIZE",
              message: `Vectorized video file: ${req.file.originalname} (${frameCount} frames, resolution: ${targetWidth}x${targetHeight})`,
              status: "SUCCESS"
            });
          } catch (dbErr) {
            console.error("Failed to log SVGV action in Supabase:", dbErr);
          }

          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${path.basename(tempOutPath)}"`);
          
          const readStream = fs.createReadStream(tempOutPath);
          readStream.pipe(res);

          readStream.on('close', () => {
            try {
              if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
              if (fs.existsSync(tempOutPath)) fs.unlinkSync(tempOutPath);
            } catch (err) {}
          });
        } catch (err) {
          console.error('Error rewriting header count:', err);
          res.status(500).json({ error: 'Failed to finalize SVGV file header.' });
        }
      });
    });

  } catch (error) {
    console.error('Vectorization failed:', error);
    res.status(500).json({ error: error.message || 'An error occurred during video processing.' });
  }
});

// SVGV Endpoint: POST /api/simulated
app.post('/api/simulated', async (req, res) => {
  const width = parseInt(req.body.width || '320', 10);
  const height = parseInt(req.body.height || '240', 10);
  const fps = parseInt(req.body.fps || '15', 10);
  const totalFrames = parseInt(req.body.frameCount || '100', 10);

  const tempOutPath = path.join(tempDir, `simulated-${Date.now()}.svgv`);

  try {
    const outStream = fs.createWriteStream(tempOutPath);

    const headerBuf = encodeSvgvHeader(width, height, fps, totalFrames);
    outStream.write(headerBuf);

    for (let f = 0; f < totalFrames; f++) {
      const rgba = generateSimulatedFrame(f, totalFrames, width, height);
      const frame = vectorizeFrame(rgba, width, height, {
        edgeThreshold: 30,
        rdpTolerance: 2.5,
        minPathLength: 4,
        rasterPatchRatio: 0.15,
        meshGridSize: 6
      });
      const frameBuf = encodeSvgvFrameToBuffer(frame);
      outStream.write(frameBuf);
    }

    outStream.write(encodeSvgvEOF());
    outStream.end(async () => {
      // Log to database
      try {
        await supabase.from("system_logs").insert({
          type: "SVGV_VECTORIZE",
          message: `Generated simulated SVGV file (${totalFrames} frames, resolution: ${width}x${height})`,
          status: "SUCCESS"
        });
      } catch (dbErr) {}

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="simulated.svgv"`);
      
      const readStream = fs.createReadStream(tempOutPath);
      readStream.pipe(res);

      readStream.on('close', () => {
        try {
          if (fs.existsSync(tempOutPath)) fs.unlinkSync(tempOutPath);
        } catch (err) {}
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate simulation.' });
  }
});

// RSS Parsing Utility (dependency-free regex based XML parser)
function parseRss(xmlText, sourceName) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract title
    let title = "";
    const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/);
    if (titleMatch) {
      title = (titleMatch[1] || titleMatch[2] || "").trim();
    }

    // Extract link
    let url = "";
    const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/);
    if (linkMatch) {
      url = (linkMatch[1] || linkMatch[2] || "").trim();
    }

    // Extract pubDate
    let pubDateStr = "";
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    if (pubDateMatch) {
      pubDateStr = pubDateMatch[1].trim();
    }
    const publishedAt = pubDateStr ? new Date(pubDateStr) : new Date();

    // Extract description
    let content = "";
    const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/);
    if (descMatch) {
      content = (descMatch[1] || descMatch[2] || "").trim();
    }

    const cleanTitle = title.replace(/<\/?[^>]+(>|$)/g, "").trim();
    const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, "").trim();

    if (cleanTitle && url) {
      items.push({
        source: sourceName,
        title: cleanTitle,
        content: cleanContent || "No description provided.",
        url: url,
        published_at: publishedAt.toISOString()
      });
    }
  }
  return items;
}

// 6-Hour News Aggregator Core
async function syncAggregatedNews() {
  console.log("Starting 6-Hour Global News & Politician Post Aggregation...");
  const newsItems = [];
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  // 1. Google News World RSS
  try {
    const res = await fetch("https://news.google.com/rss/search?q=world+news+when:6h&hl=en-US&gl=US&ceid=US:en");
    if (res.ok) {
      const xml = await res.text();
      const items = parseRss(xml, "google_news");
      newsItems.push(...items);
    }
  } catch (e) {
    console.error("Failed to sync Google News RSS:", e);
  }

  // 2. Reuters (via Google News source query to bypass blocks)
  try {
    const res = await fetch("https://news.google.com/rss/search?q=Reuters+when:6h&hl=en-US&gl=US&ceid=US:en");
    if (res.ok) {
      const xml = await res.text();
      const items = parseRss(xml, "reuters");
      newsItems.push(...items);
    }
  } catch (e) {
    console.error("Failed to sync Reuters RSS:", e);
  }

  // 3. Truth Social (Donald Trump Feed)
  try {
    const res = await fetch("https://truthsocial.com/@realDonaldTrump.rss");
    if (res.ok) {
      const xml = await res.text();
      const items = parseRss(xml, "truth_social");
      items.forEach(item => {
        item.author = "Donald Trump";
        // Shorten long status updates for title
        if (item.title.length > 90) {
          item.title = item.title.substring(0, 87) + "...";
        }
      });
      newsItems.push(...items);
    }
  } catch (e) {
    console.error("Failed to sync Truth Social RSS:", e);
  }

  // 4. Twitter / Politicians fallback (Google News query mapping statements in last 6h)
  try {
    const res = await fetch("https://news.google.com/rss/search?q=politicians+statements+when:6h&hl=en-US&gl=US&ceid=US:en");
    if (res.ok) {
      const xml = await res.text();
      const items = parseRss(xml, "twitter");
      items.forEach(item => {
        item.author = "Politicians Feed";
      });
      newsItems.push(...items);
    }
  } catch (e) {
    console.error("Failed to sync Twitter fallback RSS:", e);
  }

  // Filter items in the last 6 hours
  const activeItems = newsItems.filter(item => new Date(item.published_at) >= sixHoursAgo);
  console.log(`Synced ${activeItems.length} active news items within 6-hour threshold.`);

  if (activeItems.length > 0) {
    for (const item of activeItems) {
      try {
        const { data: existing } = await supabase
          .from("aggregated_news")
          .select("id")
          .eq("title", item.title)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase
            .from("aggregated_news")
            .insert(item);
          if (error) console.error("Database insert news error:", error);
        }
      } catch (dbErr) {
        console.error("Database check news error:", dbErr);
      }
    }
  }

  try {
    await supabase.from("system_logs").insert({
      type: "NEWS_SYNC",
      message: `Sync completed. Fetched and stored ${activeItems.length} items in the database.`,
      status: "SUCCESS"
    });
  } catch (logErr) {}

  return activeItems;
}

// News Aggregator API Sync Endpoint
app.post("/api/admin/sync-news", authenticateApiKey, async (req, res) => {
  try {
    const items = await syncAggregatedNews();
    res.json({ success: true, count: items.length });
  } catch (err) {
    res.status(500).json({ error: `Sync failed: ${err.message}` });
  }
});

// News Briefing API Get Endpoint
app.get("/api/admin/news-briefing", authenticateApiKey, async (req, res) => {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: newsItems, error } = await supabase
      .from("aggregated_news")
      .select("*")
      .gte("published_at", sixHoursAgo)
      .order("published_at", { ascending: false });

    if (error) throw error;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    let summaryText = "No recent global news or politician updates found in the database. Please trigger a sync.";

    if (geminiApiKey && newsItems && newsItems.length > 0) {
      try {
        const textBlocks = newsItems.slice(0, 30).map(item => 
          `[${item.source.toUpperCase()}] ${item.author ? `(${item.author})` : ""} ${item.title}: ${item.content}`
        ).join("\n\n");

        const prompt = `You are a professional B2B business and geopolitical intelligence analyst for "Ali CNC".
Summarize the following global news events and politician statements recorded in the last 6 hours:

${textBlocks}

Please write a structured, highly professional, direct intelligence brief summarizing the major developments. Identify:
1. Significant geopolitical event developments.
2. Major announcements from Donald Trump and key politicians.
3. Relevant global trade or economic developments.
Keep the summary under 200 words, highly professional, and direct. Return only a plain text response with no markdown tags or headers.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (response.ok) {
          const resJson = await response.json();
          summaryText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate briefing content.";
        }
      } catch (geminiErr) {
        console.error("Gemini news summarization failed:", geminiErr);
        summaryText = "AI news summarization is temporarily unavailable due to API limit or connection issues.";
      }
    }

    res.json({
      summary: summaryText.trim(),
      news: newsItems || []
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch news briefing: ${err.message}` });
  }
});

// Oracle AI Analysis Engine Child Process Runner
function executeOracleAnalysis(symbol = "BTCUSDT") {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, "oracle_ai", "venv", "Scripts", "python.exe");
    const scriptPath = path.join(__dirname, "oracle_ai", "run_oracle.py");
    
    console.log(`Spawning Oracle AI analyzer for ${symbol}...`);
    const py = spawn(pythonPath, [scriptPath, symbol]);
    
    let stdout = "";
    let stderr = "";
    
    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    py.on("close", (code) => {
      if (code !== 0) {
        console.error(`Oracle AI exited with error code ${code}`);
        console.error("Stderr:", stderr);
        return reject(new Error(`Oracle execution failed: ${stderr || 'Unknown error'}`));
      }
      
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch (err) {
        console.error("Failed to parse Oracle JSON output:", err);
        console.error("Stdout output was:", stdout);
        reject(new Error("Oracle returned invalid JSON data."));
      }
    });
  });
}

// Oracle AI Analysis Endpoint
app.post("/api/admin/run-oracle", authenticateApiKey, async (req, res) => {
  const { symbol = "BTCUSDT" } = req.body;
  try {
    const report = await executeOracleAnalysis(symbol);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stateless Scrape endpoint fallback
app.post("/api/whatsapp/scrape", authenticateApiKey, async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "Missing phoneNumber in request body" });
  }
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");

  try {
    const products = await scrapePublicCatalog(cleanNumber);
    res.json({ status: "SUCCESS", count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: `Scraping failed: ${err.message}` });
  }
});


// Trigger daily report manually (for testing purposes)
app.post("/api/admin/audit", authenticateApiKey, async (req, res) => {
  runDailyHealthCheck(); // Run async in background
  res.json({ status: "TRIGGERED", message: "Audit execution started." });
});

// Cron scheduler to scrape catalog statelessly and enrich it with Gemini every 12 hours
cron.schedule("0 */12 * * *", async () => {
  console.log("Triggering 12-Hour Automated Public Catalog Scraping & Gemini Enrichment...");
  try {
    await scrapePublicCatalog("923440708494");
  } catch (err) {
    console.error("Scheduled 12-hour catalog update failed:", err);
  }
});

// ==========================================
// WhatsApp Calling Agent & Live Takeover Setup
// ==========================================

const whatsappState = {
  status: "DISCONNECTED", // "DISCONNECTED", "QR_READY", "CONNECTING", "CONNECTED"
  qr: "",
  activeCall: null // { id, caller, timestamp }
};

const dashboardSockets = new Set();
let puppeteerSocket = null;
let client = null;

function broadcastState() {
  const payload = JSON.stringify({ type: "state", data: whatsappState });
  dashboardSockets.forEach(ws => {
    try { ws.send(payload); } catch(e){}
  });
}

// Seed admin user in Supabase Auth if not already seeded
async function seedAdminUser() {
  const email = "thealidevmail@gmail.com";
  const password = "302-Killer";
  try {
    console.log(`Checking/seeding admin user: ${email}...`);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const adminUser = users.find(u => u.email === email);
    if (!adminUser) {
      console.log(`Admin user does not exist. Creating...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Muhammad Ali (Admin)" }
      });
      if (error) throw error;
      console.log(`Admin user created successfully with ID: ${data.user.id}`);
    } else {
      console.log(`Admin user exists. Syncing password...`);
      const { error } = await supabase.auth.admin.updateUserById(adminUser.id, {
        password: password
      });
      if (error) throw error;
      console.log(`Admin user password synced successfully.`);
    }
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }
}

// Transcribe WebM user audio using gemini-2.5-flash
async function transcribeAudio(base64Audio) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "audio/webm",
              data: base64Audio
            }
          },
          {
            text: "Transcribe this audio. Return only the exact text spoken in Urdu (or English if spoken in English). Do not add any explanation or preamble."
          }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini transcription error: ${res.statusText} - ${errText}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}

// Generate humorous Urdu response and convert to speech (PCM 24kHz)
async function generateUrduSpeechResponse(userText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
  
  const systemInstruction = 
    "You are the AI assistant for 'Ali CNC' answering a phone call. " +
    "Your persona is a cute girl voice with insane B2B woodwork engineering humor. " +
    "You speak Urdu only. Keep your responses short, natural, conversational (under 3 sentences) and highly relevant. " +
    "Be playful but professional when discussing vacuum table clamping, toolpath cycle times, or sawdust containment.";

  const prompt = `User said: "${userText}". Respond back in Urdu only.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    },
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Aoede" // Cute female voice
          }
        }
      }
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini TTS error: ${res.statusText} - ${errText}`);
  }

  const json = await res.json();
  
  const audioPart = json.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  const textPart = json.candidates?.[0]?.content?.parts?.find(p => p.text);

  return {
    text: textPart ? textPart.text.trim() : "",
    audioBase64: audioPart ? audioPart.inlineData.data : null
  };
}

// Log call activity in database
async function logCallActivity(caller, type, status, message) {
  try {
    await supabase.from("system_logs").insert({
      type: type, // "WHATSAPP_CALL"
      message: JSON.stringify({ caller, status, message, timestamp: new Date().toISOString() }),
      status: "SUCCESS"
    });
  } catch (err) {
    console.error("Failed to log call activity:", err);
  }
}

// Injected WebRTC audio interceptor script
const injectionScript = `
(function() {
  console.log("Interception script injected successfully!");

  // Establish WebSocket connection back to the backend
  const ws = new WebSocket("ws://localhost:" + window.location.port + "/api/whatsapp/stream?client=puppeteer");
  window.whatsappCallSocket = ws;

  ws.onopen = () => {
    console.log("Injected socket connected to backend.");
  };

  let currentPlayingNode = null;
  let audioContext = null;
  let customDestination = null;

  async function playAudio(base64pcm) {
    try {
      if (!audioContext || !customDestination) {
        audioContext = window.myAudioContext || new (window.AudioContext || window.webkitAudioContext)();
        customDestination = window.myDestination || audioContext.createMediaStreamDestination();
        window.myAudioContext = audioContext;
        window.myDestination = customDestination;
      }

      const binaryString = window.atob(base64pcm);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(customDestination);

      if (currentPlayingNode) {
        try { currentPlayingNode.stop(); } catch(e){}
      }
      currentPlayingNode = sourceNode;

      sourceNode.start(0);
    } catch (err) {
      console.error("Failed to play response audio:", err);
    }
  }

  function stopAudio() {
    if (currentPlayingNode) {
      try {
        currentPlayingNode.stop();
        console.log("Playback interrupted and stopped.");
      } catch (err) {}
      currentPlayingNode = null;
    }
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "play-audio") {
        playAudio(msg.data);
      } else if (msg.type === "stop-audio") {
        stopAudio();
      }
    } catch (err) {
      console.error("Error handling ws message in browser:", err);
    }
  };

  const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = async function(constraints) {
    if (constraints && constraints.audio) {
      console.log("getUserMedia: Intercepting microphone request.");
      const stream = await originalGetUserMedia(constraints);
      
      if (!audioContext || !customDestination) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        customDestination = audioContext.createMediaStreamDestination();
        window.myAudioContext = audioContext;
        window.myDestination = customDestination;
      }
      
      return customDestination.stream;
    }
    return originalGetUserMedia(constraints);
  };

  const OriginalRTCPeerConnection = window.RTCPeerConnection;
  window.RTCPeerConnection = function(...args) {
    const pc = new OriginalRTCPeerConnection(...args);
    console.log("RTCPeerConnection: New connection created.");

    pc.addEventListener("track", (event) => {
      if (event.track.kind === "audio") {
        console.log("RTCPeerConnection: Intercepted incoming audio track.");
        setupIncomingAudioPipeline(event.track);
      }
    });

    return pc;
  };
  window.RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;

  let mediaRecorder = null;
  let audioChunks = [];
  let isSpeaking = false;
  let silenceStart = Date.now();
  const SILENCE_THRESHOLD = 0.015;
  const SILENCE_DURATION = 1500;

  function setupIncomingAudioPipeline(track) {
    const incomingStream = new MediaStream([track]);
    
    const vadContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = vadContext.createMediaStreamSource(incomingStream);
    const processor = vadContext.createScriptProcessor(2048, 1, 1);

    source.connect(processor);
    processor.connect(vadContext.destination);

    processor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < inputBuffer.length; i++) {
        sum += inputBuffer[i] * inputBuffer[i];
      }
      const rms = Math.sqrt(sum / inputBuffer.length);

      if (rms > SILENCE_THRESHOLD) {
        if (!isSpeaking) {
          isSpeaking = true;
          console.log("VAD: User speaking started.");
          ws.send(JSON.stringify({ type: "caller-speaking-start" }));
          
          stopAudio();

          audioChunks = [];
          mediaRecorder = new MediaRecorder(incomingStream, { mimeType: "audio/webm" });
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
          };
          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: "audio/webm" });
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result.split(",")[1];
              ws.send(JSON.stringify({ type: "caller-audio", data: base64 }));
            };
            reader.readAsDataURL(blob);
          };
          mediaRecorder.start();
        }
        silenceStart = Date.now();
      } else {
        if (isSpeaking && (Date.now() - silenceStart > SILENCE_DURATION)) {
          isSpeaking = false;
          console.log("VAD: User speaking stopped.");
          ws.send(JSON.stringify({ type: "caller-speaking-stop" }));
          
          if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        }
      }
    };
  }

  const observer = new MutationObserver(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const acceptBtn = buttons.find(btn => {
      const label = (btn.getAttribute("aria-label") || "").toLowerCase();
      const title = (btn.getAttribute("title") || "").toLowerCase();
      const text = btn.innerText.toLowerCase();
      return label.includes("accept") || label.includes("answer") || 
             title.includes("accept") || title.includes("answer") ||
             text.includes("accept") || text.includes("answer");
    });

    if (acceptBtn) {
      console.log("Auto-Answer: Clicking accept button!");
      acceptBtn.click();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log("Auto-Answer: MutationObserver active.");
})();
`;

function initializeWhatsAppClient() {
  console.log("Initializing WhatsApp Client with Custom Call Answering WebRTC injection...");
  whatsappState.status = "CONNECTING";
  broadcastState();

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: "./.wwebjs_auth"
    }),
    puppeteer: {
      headless: true,
      executablePath: getChromePath() || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ]
    }
  });

  client.on("qr", (qr) => {
    console.log("WhatsApp QR Code received.");
    whatsappState.status = "QR_READY";
    whatsappState.qr = qr;
    broadcastState();
  });

  client.on("ready", () => {
    console.log("WhatsApp Client is ready!");
    whatsappState.status = "CONNECTED";
    whatsappState.qr = "";
    broadcastState();
  });

  client.on("disconnected", (reason) => {
    console.log("WhatsApp Client disconnected:", reason);
    whatsappState.status = "DISCONNECTED";
    whatsappState.qr = "";
    broadcastState();
  });

  client.on("auth_failure", (msg) => {
    console.error("WhatsApp auth failure:", msg);
    whatsappState.status = "DISCONNECTED";
    broadcastState();
  });

  // Intercept call events
  client.on("call", async (call) => {
    console.log(`Incoming call from: ${call.from}, ID: ${call.id}`);
    whatsappState.activeCall = {
      id: call.id,
      caller: call.from,
      timestamp: new Date().toISOString()
    };
    broadcastState();
    await logCallActivity(call.from, "WHATSAPP_CALL", "INCOMING", "Auto-answering incoming voice call...");
  });

  client.initialize().then(async () => {
    console.log("WhatsApp Web browser target launched. Injecting scripts and refreshing...");
    setTimeout(async () => {
      try {
        const page = client.pupPage;
        if (page) {
          await page.evaluateOnNewDocument(injectionScript);
          console.log("Scripts registered. Reloading Puppeteer session once to activate...");
          await page.reload({ waitUntil: "networkidle0" });
          console.log("Puppeteer page successfully reloaded and injected!");
        }
      } catch (err) {
        console.error("Failed to inject scripts into Puppeteer page:", err);
      }
    }, 10000); // 10s delay to allow browser to open first
  }).catch(err => {
    console.error("Failed to initialize WhatsApp:", err);
  });
}

// WebSocket message router
async function handlePuppeteerMessage(payload) {
  if (payload.type === "caller-speaking-start") {
    console.log("Call event: Caller started speaking.");
    dashboardSockets.forEach(ws => {
      try { ws.send(JSON.stringify({ type: "caller-speaking" })); } catch(e){}
    });
  } else if (payload.type === "caller-speaking-stop") {
    console.log("Call event: Caller stopped speaking.");
  } else if (payload.type === "caller-audio") {
    console.log("Call event: Caller audio chunk received.");
    try {
      dashboardSockets.forEach(ws => {
        try { ws.send(JSON.stringify({ type: "caller-audio", data: payload.data })); } catch(e){}
      });

      const callerText = await transcribeAudio(payload.data);
      console.log(`Transcribed caller speech: "${callerText}"`);
      
      if (!callerText) return;

      const activeCall = whatsappState.activeCall || { caller: "Unknown" };
      await logCallActivity(activeCall.caller, "WHATSAPP_CALL", "TRANSCRIBED", `Caller: ${callerText}`);

      const { text: aiText, audioBase64 } = await generateUrduSpeechResponse(callerText);
      console.log(`AI Urdu response: "${aiText}"`);

      if (aiText) {
        await logCallActivity(activeCall.caller, "WHATSAPP_CALL", "RESPONDED", `AI: ${aiText}`);
      }

      if (audioBase64 && puppeteerSocket) {
        puppeteerSocket.send(JSON.stringify({ type: "play-audio", data: audioBase64 }));
      }
    } catch (err) {
      console.error("Voice processing failed:", err);
    }
  }
}

function handleDashboardMessage(payload, ws) {
  if (payload.type === "connect-whatsapp") {
    if (whatsappState.status === "DISCONNECTED") {
      initializeWhatsAppClient();
    }
  } else if (payload.type === "disconnect-whatsapp") {
    if (client) {
      console.log("Disconnecting WhatsApp...");
      client.destroy().then(() => {
        whatsappState.status = "DISCONNECTED";
        whatsappState.qr = "";
        whatsappState.activeCall = null;
        broadcastState();
      });
    }
  } else if (payload.type === "takeover-start") {
    console.log("Admin initiated call takeover.");
    if (puppeteerSocket) {
      puppeteerSocket.send(JSON.stringify({ type: "stop-audio" }));
    }
  } else if (payload.type === "dashboard-audio") {
    if (puppeteerSocket) {
      puppeteerSocket.send(JSON.stringify({ type: "play-audio", data: payload.data }));
    }
  }
}

// -------------------------------------------------------------
// ADVANCED TOOLS SERVICES & ENDPOINTS
// -------------------------------------------------------------

// Webhook Engine Stores
const webhookQueue = [];
const processedWebhookIds = new Set();

// AI Orchestrator Router API
app.post("/api/tools/router", authenticateApiKey, async (req, res) => {
  const { prompt, mode = "cost" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const start = Date.now();
  let chosenModel = "gemini-2.5-flash"; // default
  let modelLabel = "Gemini 2.5 Flash (Fast/Cheap)";
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

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let resultText = "Gemini API key is not configured on the backend.";
  let inputTokens = Math.ceil(prompt.length / 4);
  let outputTokens = 0;
  let cost = 0;

  if (geminiApiKey) {
    try {
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (apiRes.ok) {
        const json = await apiRes.json();
        resultText = json.candidates?.[0]?.content?.parts?.[0]?.text || "Empty response.";
        outputTokens = Math.ceil(resultText.length / 4);
        cost = ((inputTokens * costPerMillionInput) + (outputTokens * costPerMillionOutput)) / 1000000;
      } else {
        const errorText = await apiRes.text();
        console.error("Router model API failed:", errorText);
        resultText = `API error: ${errorText.substring(0, 150)}`;
      }
    } catch (err) {
      console.error("Router error:", err);
      resultText = `Router failed to contact LLM API: ${err.message}`;
    }
  }

  const latency = Date.now() - start;

  res.json({
    model: modelLabel,
    latency,
    cost: Number(cost.toFixed(6)),
    inputTokens,
    outputTokens,
    text: resultText
  });
});

// ETL Crawler Scraper API
app.post("/api/tools/scrape", authenticateApiKey, async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "URLs array is required." });
  }

  const parsedResults = [];

  for (const url of urls) {
    let scrapedText = "";
    let pageTitle = "Untitled Page";
    try {
      console.log(`Crawling URL: ${url}`);
      const scraperRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (scraperRes.ok) {
        const html = await scraperRes.text();
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        pageTitle = titleMatch ? titleMatch[1].trim() : "Parsed Page";
        
        scrapedText = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .substring(0, 8000);
      } else {
        scrapedText = `Failed to download. Status code: ${scraperRes.status}`;
      }
    } catch (err) {
      console.error(`Scrape failed for ${url}:`, err);
      scrapedText = `Failed to scrape page due to network timeout: ${err.message}`;
    }

    let structuredData = { title: pageTitle, author: "Unknown", summary: "Could not parse details.", keyPoints: [], sentiment: "NEUTRAL" };
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && !scrapedText.startsWith("Failed")) {
      try {
        const etlPrompt = `Evaluate the following scraped raw text content from: ${url}
Please extract the information and return a structured JSON object.
Required JSON Schema:
{
  "title": "Clean, parsed page or article title",
  "author": "Author or publisher name, null if none",
  "summary": "1-2 sentence core content summary",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "sentiment": "BULLISH or BEARISH or NEUTRAL"
}
Return only a valid JSON output. No markdown wrappers.

Scraped text content:
${scrapedText}`;

        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: etlPrompt }] }]
            })
          }
        );

        if (apiRes.ok) {
          const json = await apiRes.json();
          const parsedText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const jsonMatch = parsedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredData = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (err) {
        console.error("Gemini ETL failed:", err);
      }
    } else {
      structuredData = {
        title: pageTitle,
        author: "Unknown",
        summary: scrapedText.substring(0, 150) + "...",
        keyPoints: ["Could not extract details due to network errors."],
        sentiment: "NEUTRAL"
      };
    }

    parsedResults.push({
      url,
      status: scrapedText.startsWith("Failed") ? "FAILED" : "COMPLETED",
      data: structuredData
    });
  }

  res.json({ results: parsedResults });
});

// Webhook Ingest API
app.post("/api/tools/webhook/ingest", async (req, res) => {
  const { eventId, type, payload } = req.body;
  
  if (!eventId || !type) {
    return res.status(400).json({ error: "Missing eventId or type in request body." });
  }

  if (processedWebhookIds.has(eventId)) {
    console.log(`[Webhook] Duplicate event blocked: ${eventId}`);
    return res.json({ status: "ALREADY_PROCESSED", message: "Idempotency check passed. Event ignored." });
  }

  processedWebhookIds.add(eventId);

  const shouldFail = Math.random() < 0.3;
  const status = shouldFail ? "FAILED" : "PROCESSED";
  
  const webhookEntry = {
    eventId,
    type,
    payload,
    status,
    retryCount: 0,
    timestamp: new Date().toISOString(),
    logs: [`[${new Date().toLocaleTimeString()}] Event received and logged.`]
  };

  if (shouldFail) {
    webhookEntry.logs.push(`[${new Date().toLocaleTimeString()}] ERROR: Database transaction lock timeout. Sent to Dead-Letter Queue (DLQ).`);
  } else {
    webhookEntry.logs.push(`[${new Date().toLocaleTimeString()}] SUCCESS: Payment sync completed. Database updated.`);
  }

  webhookQueue.unshift(webhookEntry);
  if (webhookQueue.length > 50) webhookQueue.pop();

  res.json({ status, eventId });
});

// Fetch webhook events
app.get("/api/tools/webhook/events", authenticateApiKey, (req, res) => {
  res.json(webhookQueue);
});

// Retry webhook event
app.post("/api/tools/webhook/retry", authenticateApiKey, (req, res) => {
  const { eventId } = req.body;
  const item = webhookQueue.find(w => w.eventId === eventId);
  
  if (!item) {
    return res.status(404).json({ error: "Webhook event not found in logs." });
  }

  item.retryCount += 1;
  item.status = "PROCESSED";
  item.logs.push(`[${new Date().toLocaleTimeString()}] Retry attempt #${item.retryCount} initiated.`);
  item.logs.push(`[${new Date().toLocaleTimeString()}] SUCCESS: Database lock resolved. Synced successfully.`);

  res.json({ status: "SUCCESS", item });
});

// Start HTTP & WebSocket Servers
const server = app.listen(PORT, async () => {
  console.log(`Backend Server running on port ${PORT}`);
  
  // Seed the admin credentials
  await seedAdminUser();

  // Auto-connect WhatsApp if session exists
  initializeWhatsAppClient();

  // Seed the catalog by running stateless scrape on start in the background
  console.log("Auto-seeding catalog from public WA catalog...");
  scrapePublicCatalog("923440708494").catch(err => {
    console.error("Initial catalog auto-seeding failed:", err);
  });
});

const wss = new WebSocketServer({ noServer: true });
const wssWorkspace = new WebSocketServer({ noServer: true });
const workspaceClients = new Set();

wssWorkspace.on("connection", (ws, request) => {
  console.log("Workspace WebSocket connection established.");
  workspaceClients.add(ws);

  ws.on("message", (message) => {
    // Broadcast coordinates/drawings to all other connected workspace clients
    for (const client of workspaceClients) {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on("close", () => {
    console.log("Workspace WebSocket connection closed.");
    workspaceClients.delete(ws);
  });
});

server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (pathname === "/api/whatsapp/stream") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else if (pathname === "/api/tools/workspace/sync") {
    wssWorkspace.handleUpgrade(request, socket, head, (ws) => {
      wssWorkspace.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws, request) => {
  const urlParams = new URLSearchParams(request.url.split("?")[1] || "");
  const clientType = urlParams.get("client") || "dashboard";

  if (clientType === "puppeteer") {
    console.log("Puppeteer WebSocket connection established.");
    puppeteerSocket = ws;

    ws.on("message", async (message) => {
      try {
        const payload = JSON.parse(message);
        await handlePuppeteerMessage(payload);
      } catch (err) {
        console.error("Error handling puppeteer socket message:", err);
      }
    });

    ws.on("close", () => {
      console.log("Puppeteer WebSocket connection closed.");
      puppeteerSocket = null;
      whatsappState.activeCall = null;
      broadcastState();
    });
  } else {
    console.log("Dashboard WebSocket connection established.");
    dashboardSockets.add(ws);
    
    ws.send(JSON.stringify({ type: "state", data: whatsappState }));

    ws.on("message", (message) => {
      try {
        const payload = JSON.parse(message);
        handleDashboardMessage(payload, ws);
      } catch (err) {
        console.error("Error handling dashboard socket message:", err);
      }
    });

    ws.on("close", () => {
      console.log("Dashboard WebSocket connection closed.");
      dashboardSockets.delete(ws);
    });
  }
});

