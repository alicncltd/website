import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";

// Load environment variables from the backend .env file
dotenv.config({ path: "c:\\Users\\Muhammad Ali\\Desktop\\alicnc\\backend\\.env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function generateB2BDescription(name, price) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return "Expert CAD/CAM design and high-precision CNC optimization tailored for commercial woodwork and engraving.";
  }
  
  try {
    const prompt = `You are a premier B2B copywriter for "Ali CNC Private Limited".
Write a highly professional, technically rich, B2B direct-response catalog description for a CNC product named "${name}" (Price: Rs. ${price}).
Focus on woodworking shop floor benefits: flawless edge finishes, vacuum table spatial efficiency, reducing machine cycle run times, router bit protection from thermal buildup, and watertight mechanical tolerances.
Keep the description direct, professional, and convincing for shop owners.
Return only a clean, well-formatted plain paragraph with NO markdown tags, NO headers, and NO styling. Keep it under 150 words.`;

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
    } else {
      console.error("Gemini API error status:", response.status, response.statusText);
    }
  } catch (e) {
    console.error("Gemini description generation failed:", e);
  }
  return `Expert high-precision CAD/CAM toolpath modeling and G-code engineering for "${name}". Optimized for maximum material yield and spindle efficiency.`;
}

async function syncCatalogFromSeed() {
  console.log("Starting local B2B catalog synchronization from seed database...");
  console.log("----------------------------------------");
  
  try {
    const seedPath = path.resolve("catalog_seed.json");
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed database not found at ${seedPath}`);
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    console.log(`Loaded ${seedData.length} B2B products from seed file.`);
    console.log("----------------------------------------");

    for (const item of seedData) {
      console.log(`Processing Product: "${item.name}" (Price: Rs. ${item.price})`);
      
      // Check if product already exists in Supabase
      const { data: cached } = await supabase
        .from("catalog_items")
        .select("id, name, description")
        .eq("id", item.id)
        .maybeSingle();

      if (cached) {
        console.log(`-> Product already cached in Supabase database.`);
        console.log(`-> Cached Description: "${cached.description}"`);
        console.log("----------------------------------------");
        continue;
      }

      console.log(`-> New product detected! Calling Gemini AI B2B copywriter...`);
      const finalDescription = await generateB2BDescription(item.name, item.price);
      console.log(`-> Gemini Generated Copy: "${finalDescription}"`);

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
      const { error } = await supabase.from("catalog_items").upsert({
        id: item.id,
        name: item.name,
        description: finalDescription,
        price: String(item.price),
        cloudinary_url: uploadRes.secure_url,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error(`-> Supabase upsert error:`, error);
      } else {
        console.log(`-> Successfully synced and cached in database!`);
      }
      console.log("----------------------------------------");
    }
    
    console.log("Local B2B catalog synchronization completed successfully!");
  } catch (err) {
    console.error("Local catalog synchronization failed:", err);
  }
}

syncCatalogFromSeed();
