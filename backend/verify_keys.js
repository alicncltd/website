import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

console.log("==================================================");
console.log("            API KEYS VERIFICATION SCRIPT          ");
console.log("==================================================");

async function verifySupabase() {
  console.log("\n[1/4] Verifying Supabase connection...");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("❌ Failed: Supabase URL or Service Role Key missing in .env");
    return false;
  }

  try {
    const supabase = createClient(url, serviceKey);
    // Try to perform a select check on whatsapp_sessions table
    const { data, error } = await supabase
      .from("whatsapp_sessions")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }
    console.log("✅ Success: Connected to Supabase and queried tables successfully.");
    return true;
  } catch (err) {
    console.error("❌ Failed: Supabase check failed:", err.message);
    return false;
  }
}

async function verifyCloudinary() {
  console.log("\n[2/4] Verifying Cloudinary configuration...");
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!name || !key || !secret) {
    console.error("❌ Failed: Cloudinary credentials missing in .env");
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: name,
      api_key: key,
      api_secret: secret
    });

    // Run resource query to verify authorization
    const result = await cloudinary.api.ping();
    if (result && result.status === "ok") {
      console.log("✅ Success: Cloudinary credentials are valid (Ping OK).");
      return true;
    } else {
      throw new Error("Invalid ping response.");
    }
  } catch (err) {
    console.error("❌ Failed: Cloudinary configuration invalid:", err.message);
    return false;
  }
}

async function verifyResend() {
  console.log("\n[3/4] Verifying Resend API key...");
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.startsWith("your_")) {
    console.error("❌ Failed: Resend API key missing in .env");
    return false;
  }

  try {
    // We send a direct GET request to Resend API endpoint to verify key authorization
    const res = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      console.log("✅ Success: Resend API Key is valid and authorized.");
      return true;
    } else {
      const errText = await res.text();
      if (errText.includes("restricted_api_key") || errText.includes("only send emails")) {
        console.log("✅ Success: Resend API Key is valid (Active Send-Only permissions).");
        return true;
      }
      throw new Error(`Auth failed (${res.status}): ${errText}`);
    }
  } catch (err) {
    console.error("❌ Failed: Resend check failed:", err.message);
    return false;
  }
}

async function verifyGemini() {
  console.log("\n[4/4] Verifying Google Gemini API key...");
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.startsWith("your_")) {
    console.error("❌ Failed: Gemini API key missing in .env");
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with the word 'PONG'." }] }]
        })
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      const answer = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log(`✅ Success: Gemini API responds correctly. Output: "${answer}"`);
      return true;
    } else {
      const errText = await response.text();
      throw new Error(`API error (${response.status}): ${errText}`);
    }
  } catch (err) {
    console.error("❌ Failed: Gemini check failed:", err.message);
    return false;
  }
}

async function main() {
  const supabaseOk = await verifySupabase();
  const cloudinaryOk = await verifyCloudinary();
  const resendOk = await verifyResend();
  const geminiOk = await verifyGemini();

  console.log("\n==================================================");
  console.log("                SUMMARY OF RESULTS                ");
  console.log("==================================================");
  console.log(`Supabase Connection:  ${supabaseOk ? "PASS" : "FAIL"}`);
  console.log(`Cloudinary API:       ${cloudinaryOk ? "PASS" : "FAIL"}`);
  console.log(`Resend Email API:     ${resendOk ? "PASS" : "FAIL"}`);
  console.log(`Gemini AI API:        ${geminiOk ? "PASS" : "FAIL"}`);
  console.log("==================================================");

  if (supabaseOk && cloudinaryOk && resendOk && geminiOk) {
    console.log("🎉 ALL API KEYS ARE CORRECT AND FULLY FUNCTIONAL!");
  } else {
    console.error("⚠️ SOME KEYS FAILED VERIFICATION. Please check configuration details.");
  }
}

main();
