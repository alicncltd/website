import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "whatsapp-web.js";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import PDFDocument from "pdfkit";
import cron from "node-cron";
import ws from "ws";
import os from "os";

// 0. WebSocket polyfill for older Node versions (realtime client dependency)
if (typeof global.WebSocket === "undefined") {
  global.WebSocket = ws;
}


const { Client, LocalAuth } = pkg;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || "fallback_secret_api_key_123";

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

// 2. Global State
let whatsappClient = null;
let clientStatus = "DISCONNECTED"; // DISCONNECTED, INITIALIZING, PAIRING, CONNECTED
let latestPairingCode = "";
let latestQr = "";
let lastStatusEmailSent = false;
const sessionDir = "./.wwebjs_auth";
const sessionZipPath = "./session.zip";

// Secure API Middleware
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== BACKEND_API_KEY) {
    return res.status(401).json({ error: "Unauthorized access: Invalid API Key" });
  }
  next();
}

// 3. Database session persistence helper functions
async function saveSessionToSupabase() {
  console.log("Packaging session files for Supabase persistence...");
  try {
    if (!fs.existsSync(sessionDir)) {
      console.warn("Session directory does not exist. Skipping backup.");
      return;
    }
    const zip = new AdmZip();
    zip.addLocalFolder(sessionDir);
    const zipBuffer = zip.toBuffer();
    const base64Data = zipBuffer.toString("base64");

    const { error } = await supabase
      .from("whatsapp_sessions")
      .upsert({
        id: "main_session",
        session_data: base64Data,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log("Session successfully backed up to Supabase.");
  } catch (err) {
    console.error("Failed to back up session to Supabase:", err);
  }
}

async function loadSessionFromSupabase() {
  console.log("Attempting to restore session from Supabase...");
  try {
    const { data, error } = await supabase
      .from("whatsapp_sessions")
      .select("session_data")
      .eq("id", "main_session")
      .maybeSingle();

    if (error) throw error;

    if (data && data.session_data) {
      console.log("Found session backup. Restoring local files...");
      const buffer = Buffer.from(data.session_data, "base64");
      fs.writeFileSync(sessionZipPath, buffer);
      
      const zip = new AdmZip(sessionZipPath);
      zip.extractAllTo(sessionDir, true);
      
      fs.unlinkSync(sessionZipPath);
      console.log("Session restored successfully.");
      return true;
    } else {
      console.log("No previous session backup found.");
      return false;
    }
  } catch (err) {
    console.error("Failed to restore session from Supabase:", err);
    return false;
  }
}

// Cross-platform helper to resolve Chrome executable path
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

// 4. Initialize WhatsApp Web Client
async function initWhatsApp(phoneNumber = null) {
  if (whatsappClient) {
    console.log("WhatsApp client is already active.");
    return;
  }

  clientStatus = "INITIALIZING";
  await loadSessionFromSupabase();

  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      executablePath: getChromePath() || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
    },
  });

  whatsappClient.on("qr", (qr) => {
    latestQr = qr;
    clientStatus = "PAIRING";
    console.log("WhatsApp QR generated.");
  });

  whatsappClient.on("authenticated", () => {
    console.log("WhatsApp authenticated.");
    clientStatus = "AUTHENTICATING";
  });

  whatsappClient.on("auth_failure", (msg) => {
    console.error("WhatsApp auth failure:", msg);
    clientStatus = "DISCONNECTED";
  });

  whatsappClient.on("ready", async () => {
    console.log("WhatsApp client ready.");
    clientStatus = "CONNECTED";
    lastStatusEmailSent = false;
    latestPairingCode = "";
    latestQr = "";

    // Save session in background
    setTimeout(saveSessionToSupabase, 10000);

    // Trigger catalog sync
    syncCatalog();
  });

  whatsappClient.on("disconnected", (reason) => {
    console.log("WhatsApp client was disconnected:", reason);
    clientStatus = "DISCONNECTED";
    whatsappClient = null;
  });

  try {
    whatsappClient.initialize();
  } catch (err) {
    console.error("Failed to initialize WhatsApp Web Client:", err);
    clientStatus = "DISCONNECTED";
    whatsappClient = null;
  }
}

// 5. Catalog Synchronization via wa-js
async function syncCatalog() {
  if (clientStatus !== "CONNECTED" || !whatsappClient) {
    console.warn("WhatsApp not connected. Cannot sync catalog.");
    return;
  }

  console.log("Starting catalog synchronization with Cloudinary...");
  try {
    const page = whatsappClient.pupPage;
    
    // Inject WA-JS if not already present
    await page.evaluate(() => {
      if (window.WPP) return;
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@wppconnect/wa-js@latest/dist/wppconnect-wa-js.js";
      document.head.appendChild(script);
    });

    // Wait for WPP to be loaded
    await page.waitForFunction(() => window.WPP && window.WPP.webpack && window.WPP.webpack.isReady, { timeout: 30000 });
    
    // Inject all Webpack modules
    await page.evaluate(() => {
      window.WPP.webpack.injectAll();
    });

    const myJid = await page.evaluate(() => window.WPP.conn.getMyJid());
    console.log("Connected JID:", myJid);

    // Fetch products
    const products = await page.evaluate(async (jid) => {
      try {
        return await window.WPP.catalog.getProducts(jid);
      } catch (err) {
        console.error("Failed to get products via WPP:", err);
        return [];
      }
    }, myJid);

    console.log(`Retrieved ${products.length} products from WhatsApp Business Catalog.`);

    for (const product of products) {
      // Find image links in product
      let imageUrl = "";
      if (product.imageUrls && product.imageUrls.length > 0) {
        imageUrl = product.imageUrls[0];
      } else if (product.mediaUrl) {
        imageUrl = product.mediaUrl;
      } else if (product.images && product.images.length > 0) {
        imageUrl = product.images[0].url;
      }

      if (!imageUrl) {
        console.warn(`Product ${product.id} (${product.name}) has no catalog image.`);
        continue;
      }

      // Check if product is already cached in database
      const { data: cachedItem } = await supabase
        .from("catalog_items")
        .select("id, cloudinary_url")
        .eq("id", product.id)
        .maybeSingle();

      if (cachedItem) {
        console.log(`Product ${product.id} is already cached. Skipping Cloudinary upload.`);
        continue;
      }

      console.log(`Downloading and syncing image for ${product.name}...`);
      
      // Download image from WhatsApp Page URL context
      const base64Image = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          return null;
        }
      }, imageUrl);

      if (!base64Image) {
        console.error(`Failed to download image for ${product.name}`);
        continue;
      }

      // Upload to Cloudinary
      const uploadRes = await cloudinary.uploader.upload(base64Image, {
        folder: "whatsapp_catalog",
        public_id: `product_${product.id}`,
        overwrite: true
      });

      console.log(`Uploaded image to Cloudinary: ${uploadRes.secure_url}`);

      // Upsert into Supabase
      const { error } = await supabase
        .from("catalog_items")
        .upsert({
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: product.price ? (product.price / 1000).toString() : "0", // WhatsApp prices are usually scaled by 1000
          cloudinary_url: uploadRes.secure_url,
          updated_at: new Date().toISOString()
        });

      if (error) console.error("Error saving product cache to Supabase:", error);
    }

    console.log("Catalog sync completed successfully.");
    
    // Log success entry
    await supabase.from("system_logs").insert({
      type: "CATALOG_SYNC",
      message: `Successfully synchronized ${products.length} products.`,
      status: "SUCCESS"
    });

  } catch (err) {
    console.error("Failed to sync catalog:", err);
    await supabase.from("system_logs").insert({
      type: "CATALOG_SYNC",
      message: `Failed catalog synchronization: ${err.message}`,
      status: "FAILURE"
    });
  }
}

// 6. Public Catalog Scraper Fallback (Zero-login method)
async function scrapePublicCatalog(phoneNumber) {
  console.log(`Starting stateless public scrape for wa.me/c/${phoneNumber}...`);
  let tempBrowser = null;
  try {
    // Launch a standalone Chromium instance
    const puppeteer = (await import("puppeteer")).default;
    tempBrowser = await puppeteer.launch({
      headless: true,
      executablePath: getChromePath() || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await tempBrowser.newPage();
    await page.goto(`https://wa.me/c/${phoneNumber}`, { waitUntil: "networkidle2" });

    // Wait for the dynamic catalog grid elements to render
    await page.waitForSelector("a[href*='/product/']", { timeout: 15000 });

    // Scrape items
    const scrapedProducts = await page.evaluate(() => {
      const items = [];
      const links = document.querySelectorAll("a[href*='/product/']");
      links.forEach((link) => {
        const urlObj = new URL(link.href);
        const productId = urlObj.pathname.split("/").pop();
        
        // Find children info
        const titleEl = link.querySelector("h3") || link.querySelector("span");
        const priceEl = link.querySelector("span"); // Typically price sibling
        const imgEl = link.querySelector("img");

        items.push({
          id: productId,
          name: titleEl ? titleEl.innerText.trim() : `Product ${productId}`,
          price: priceEl ? priceEl.innerText.trim() : "0",
          imageUrl: imgEl ? imgEl.src : ""
        });
      });
      return items;
    });

    console.log(`Publicly scraped ${scrapedProducts.length} items from wa.me/c/${phoneNumber}`);

    for (const item of scrapedProducts) {
      if (!item.imageUrl) continue;

      const { data: cached } = await supabase
        .from("catalog_items")
        .select("id")
        .eq("id", item.id)
        .maybeSingle();

      if (cached) continue;

      // Download public image URL context
      const imageRes = await fetch(item.imageUrl);
      const buffer = await imageRes.buffer();

      const base64Data = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      // Upload to Cloudinary
      const uploadRes = await cloudinary.uploader.upload(base64Data, {
        folder: "whatsapp_catalog",
        public_id: `scraped_${item.id}`,
        overwrite: true
      });

      // Save to cache
      await supabase.from("catalog_items").upsert({
        id: item.id,
        name: item.name,
        description: "Scraped from public WA.me catalog profile.",
        price: item.price.replace(/[^0-9.]/g, "") || "0",
        cloudinary_url: uploadRes.secure_url,
        updated_at: new Date().toISOString()
      });
    }

    await supabase.from("system_logs").insert({
      type: "CATALOG_SCRAPE",
      message: `Scraped public catalog for number ${phoneNumber}. Synced ${scrapedProducts.length} items.`,
      status: "SUCCESS"
    });

    return scrapedProducts;
  } catch (err) {
    console.error("Public catalog scraping failed:", err);
    await supabase.from("system_logs").insert({
      type: "CATALOG_SCRAPE",
      message: `Public catalog scrape failed for ${phoneNumber}: ${err.message}`,
      status: "FAILURE"
    });
    throw err;
  } finally {
    if (tempBrowser) await tempBrowser.close();
  }
}

// 7. 30-Second Connection Monitoring Heartbeat
setInterval(async () => {
  if (!whatsappClient) return;

  try {
    const isConnected = whatsappClient.info && whatsappClient.info.wid;
    
    if (!isConnected && clientStatus === "CONNECTED") {
      clientStatus = "DISCONNECTED";
      console.warn("WhatsApp Connection Lost!");
    }

    if (clientStatus !== "CONNECTED" && !lastStatusEmailSent) {
      console.log("Alert: WhatsApp Connection is broken. Sending relogin notification email...");
      
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
      const frontendLoginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/whatsapp`;

      const { data, error } = await resend.emails.send({
        from: "Ali CNC Alerts <onboarding@resend.dev>",
        to: adminEmail,
        subject: "🚨 Action Required: WhatsApp Connection Broken",
        html: `
          <h3>Your WhatsApp Business Connection is Broken</h3>
          <p>The system detected that the WhatsApp integration has disconnected at <b>${new Date().toLocaleString()}</b>.</p>
          <p>To reconnect, please visit your Admin dashboard and link the device using your phone number:</p>
          <a href="${frontendLoginUrl}" style="display:inline-block;padding:10px 20px;background:#0ea5e9;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Reconnect Device Now</a>
          <br/><br/>
          <p>Thank you,<br/>Ali CNC System Monitor</p>
        `
      });

      if (error) {
        console.error("Failed to send status email via Resend:", error);
      } else {
        console.log("Alert email sent successfully.");
        lastStatusEmailSent = true;
      }
    }
  } catch (err) {
    console.error("Error in WhatsApp connection checker interval:", err);
  }
}, 30000);

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
- WhatsApp Integration Status: ${clientStatus}

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
    doc.text(`WhatsApp Bridge Status: ${clientStatus}`);
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
  res.json({ status: "OK", serverTime: new Date().toISOString(), whatsapp: clientStatus });
});

// Request WhatsApp Pairing Code
app.post("/api/whatsapp/pair", authenticateApiKey, async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "Missing phoneNumber in request body" });
  }

  // Remove symbol spacing formatting (e.g. + or spaces)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");

  try {
    if (!whatsappClient) {
      await initWhatsApp();
    }

    console.log(`Requesting pairing code for: ${cleanNumber}`);
    
    // Wait dynamically until Puppeteer browser context is ready (up to 30 seconds)
    let pageReady = false;
    for (let i = 0; i < 60; i++) {
      if (whatsappClient && whatsappClient.pupPage) {
        pageReady = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!pageReady) {
      throw new Error("Timeout waiting for Puppeteer browser page to initialize.");
    }

    // Give Puppeteer a short moment to load the page structure before making the request
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const code = await whatsappClient.requestPairingCode(cleanNumber);
    latestPairingCode = code;
    
    res.json({ status: "PAIRING", code });
  } catch (err) {
    console.error("Pairing code generation failed:", err);
    res.status(500).json({ error: `Pairing failed: ${err.message}` });
  }
});

// Check WhatsApp connection status
app.get("/api/whatsapp/status", authenticateApiKey, (req, res) => {
  res.json({
    status: clientStatus,
    pairingCode: latestPairingCode,
    qr: latestQr
  });
});

// Manually trigger catalog sync
app.post("/api/whatsapp/sync", authenticateApiKey, async (req, res) => {
  if (clientStatus !== "CONNECTED") {
    return res.status(400).json({ error: "WhatsApp client is not connected" });
  }
  
  syncCatalog(); // Execute async in background
  res.json({ status: "SYNCING", message: "Catalog synchronization started." });
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

// Start Express Server & Autoload WhatsApp Client if session exists
app.listen(PORT, async () => {
  console.log(`Backend Server running on port ${PORT}`);
  
  // Autostart WhatsApp if there's a cached session
  try {
    const sessionRestored = await loadSessionFromSupabase();
    if (sessionRestored) {
      console.log("Restored session found. Booting WhatsApp automatically...");
      initWhatsApp();
    }
  } catch (e) {
    console.error("Autostart failed:", e);
  }
});
