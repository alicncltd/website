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
import ws from "ws";
import os from "os";

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

      // Enrich catalog description with Gemini B2B copywriter
      let finalDescription = "Expert B2B CAD/CAM and high-precision CNC optimization.";
      try {
        finalDescription = await generateB2BDescription(item.name, item.price);
      } catch (e) {
        console.error("Gemini catalog enrichment failed:", e);
      }

      // Save to cache
      await supabase.from("catalog_items").upsert({
        id: item.id,
        name: item.name,
        description: finalDescription,
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

// Start Express Server & Autoload Stateless Catalog Seeding
app.listen(PORT, async () => {
  console.log(`Backend Server running on port ${PORT}`);
  
  // Seed the catalog by running stateless scrape on start in the background
  console.log("Auto-seeding catalog from public WA catalog...");
  scrapePublicCatalog("923440708494").catch(err => {
    console.error("Initial catalog auto-seeding failed:", err);
  });
});
