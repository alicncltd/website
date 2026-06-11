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
const { Client, LocalAuth } = pkg;


// 0. WebSocket polyfill for older Node versions (realtime client dependency)
if (typeof global.WebSocket === "undefined") {
  global.WebSocket = ws;
}

dotenv.config();

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
    const prompt = `You are a premier B2B copywriter for "Ali CNC Private Limited".
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
      const prompt = `You are a world-class AI website auditor and B2B system analytics analyst for "Ali CNC Private Limited".
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
    doc.fontSize(22).fillColor("#0ea5e9").text("Ali CNC Private Limited", { align: "center" });
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

    doc.fontSize(14).fillColor("#0ea5e9").text("4. Engineering Changelog Timeline");
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

    doc.fontSize(14).fillColor("#0ea5e9").text("5. Recent System Logs");
    doc.fontSize(8).fillColor("#0f172a").text(logsSummary);

    doc.end();

    const pdfBuffer = await pdfPromise;

    // Send email report
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const dateFormattedStr = now.toISOString().slice(0, 10);
    const timeFormattedStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
    const uniqueFilename = `ali_cnc_audit_${dateFormattedStr}_${timeFormattedStr}.pdf`;

    const { error: mailErr } = await resend.emails.send({
      from: "Ali CNC Private Limited Auditor <onboarding@resend.dev>",
      to: adminEmail,
      subject: `🕒 6-Hour AI Audit Report - ${localTimeStr}`,
      html: `
        <h3>Ali CNC Private Limited System Audit Report</h3>
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
  res.json({ status: "OK", serverTime: new Date().toISOString() });
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
    "You are the AI assistant for 'Ali CNC Private Limited' answering a phone call. " +
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

server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (pathname === "/api/whatsapp/stream") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
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

