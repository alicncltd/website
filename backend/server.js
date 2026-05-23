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
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable",
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
          <p>Thank you,<br/>Ali CNC Pakistan System Monitor</p>
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

// 8. Daily Gemini AI Website Health Auditor & PDF Generator
async function runDailyHealthCheck() {
  console.log("Running Daily Gemini Website Health Audit...");
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    // Fetch frontend layout status
    let frontendStatus = "Unknown";
    try {
      const res = await fetch(frontendUrl);
      frontendStatus = res.ok ? "Healthy (200 OK)" : `Error (${res.status})`;
    } catch (e) {
      frontendStatus = `Failed to Reach (${e.message})`;
    }

    // Fetch recent database logs
    const { data: logs } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    const logsSummary = logs && logs.length > 0 
      ? JSON.stringify(logs, null, 2)
      : "No system logs recorded.";

    // Send context to Gemini for analysis
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let auditSummary = "Gemini Auditor not configured.";

    if (geminiApiKey) {
      const prompt = `You are an automated website auditor. Review the following system status and recent logs for "Ali CNC Pakistan".
Frontend URL Status: ${frontendStatus}
Recent Logs:
${logsSummary}

Please write a professional website audit assessment. Identify any system errors, catalog sync failures, or warnings. Provide recommendations if there are issues. Return only a clean, well-formatted response with no markdown tags.`;

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

    // Write PDF layout
    doc.fontSize(22).fillColor("#0ea5e9").text("Ali CNC Pakistan", { align: "center" });
    doc.fontSize(16).fillColor("#0f172a").text("Daily AI Health Audit Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#475569").text(`Generated: ${new Date().toLocaleString()}`, { align: "right" });
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("1. Overall System Status");
    doc.fontSize(11).fillColor("#0f172a").text(`Frontend URL: ${frontendUrl}`);
    doc.text(`Frontend Accessibility: ${frontendStatus}`);
    doc.text(`WhatsApp Bridge Status: ${clientStatus}`);
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("2. AI Auditor Assessment (Gemini)");
    doc.fontSize(10).fillColor("#334155").text(auditSummary);
    doc.moveDown();

    doc.fontSize(14).fillColor("#0ea5e9").text("3. Recent System Logs");
    doc.fontSize(8).fillColor("#0f172a").text(logsSummary);

    doc.end();

    const pdfBuffer = await pdfPromise;

    // Send email report
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const { error: mailErr } = await resend.emails.send({
      from: "Ali CNC Auditor <onboarding@resend.dev>",
      to: adminEmail,
      subject: `Daily AI Audit Report - ${new Date().toLocaleDateString()}`,
      html: `<p>Please find attached the daily system health and logs assessment for Ali CNC Pakistan, compiled via Gemini AI.</p>`,
      attachments: [
        {
          filename: `ali_cnc_audit_${new Date().toISOString().slice(0,10)}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    if (mailErr) console.error("Error sending daily report:", mailErr);
    else console.log("Daily health report emailed successfully.");

  } catch (err) {
    console.error("Failed to run daily health check:", err);
  }
}

// Cron scheduler for daily checks (every midnight)
cron.schedule("0 0 * * *", runDailyHealthCheck);

// 9. API Routes Configuration

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
    
    // Give Puppeteer a moment to load page structure before pairing request
    await new Promise((resolve) => setTimeout(resolve, 5000));

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
