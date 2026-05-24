import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.resolve();
const localesDir = path.join(__dirname, "../frontend/locales");
const enFilePath = path.join(localesDir, "en.json");

const SUPPORTED_LANGUAGES = [
  { code: "ur", name: "Urdu" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
];

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in environment.");
  process.exit(1);
}

async function translateProjectsFor(langCode, langName) {
  console.log(`Translating Projects block for ${langName} (${langCode})...`);
  const outPath = path.join(localesDir, `${langCode}.json`);
  
  if (!fs.existsSync(outPath)) {
    console.error(`Locale file does not exist: ${outPath}`);
    return;
  }

  // Load English source
  const enData = JSON.parse(fs.readFileSync(enFilePath, "utf8"));
  const sourcePayload = {
    nav_projects: enData.nav.projects,
    projects: enData.projects
  };

  const prompt = `You are a professional website translator. Translate the values in the following English JSON object to ${langName}.
- Keep the tone of the translations extremely humorous, self-aware, peak windscribe-style (funny yet highly technically competent).
- Do NOT translate or change any of the JSON keys (e.g. keep "nav_projects", "title_part1", "proj1_title", "proj1_url", etc. exactly as they are).
- Do NOT translate or modify any URLs. Keep the URL values EXACTLY identical.
- Do NOT translate proper nouns like "Ali CNC", "Raja Muhammad Ali Asghar", "Umer CNC", "CadCrowd", "Crunchbase", "Onshape", "Vectric", "TITAN-3M & 2M", "KakaoTalk", "Line", "WhatsApp", "Rawalpindi", "Pakistan".
- Make sure that technical terms like CRISPR, HHO, G-code, CAD/CAM, vector, 3D relief, .svgc, .svgv are spelled correctly and fit standard language conventions.
- Return ONLY the translated JSON object. No markdown code blocks, no trailing notes, no explanation. Just raw JSON.

English Source JSON:
${JSON.stringify(sourcePayload, null, 2)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const resJson = await response.json();
    const generatedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No text content returned from Gemini API");
    }

    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    // Parse and validate translation payload
    const parsedTranslation = JSON.parse(cleanedText);
    
    // Read current destination file
    const destData = JSON.parse(fs.readFileSync(outPath, "utf8"));
    
    // Merge new translations
    if (!destData.nav) destData.nav = {};
    destData.nav.projects = parsedTranslation.nav_projects;
    destData.projects = parsedTranslation.projects;

    // Save back
    fs.writeFileSync(outPath, JSON.stringify(destData, null, 2), "utf8");
    console.log(`✅ Successfully merged Projects translation for ${langCode}.json`);
  } catch (err) {
    console.error(`❌ Failed translating Projects for ${langCode}:`, err.message);
  }
}

async function main() {
  console.log("Starting targeted translation of Projects for all locales...");
  for (const lang of SUPPORTED_LANGUAGES) {
    await translateProjectsFor(lang.code, lang.name);
    // 2-second sleep to respect Gemini API rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.log("Projects translation process finished.");
}

main();
