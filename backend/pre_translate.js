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

function getLanguageName(code) {
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
    return displayNames.of(code) || code;
  } catch (e) {
    return code;
  }
}

async function translateTo(langCode, langName) {
  console.log(`Translating to ${langName} (${langCode})...`);
  const outPath = path.join(localesDir, `${langCode}.json`);
  
  if (fs.existsSync(outPath)) {
    console.log(`- Already exists at ${outPath}. Skipping.`);
    return;
  }

  const enDataStr = fs.readFileSync(enFilePath, "utf8");

  const prompt = `You are a professional website translator. Translate the values in the following JSON object from English to ${langName}. 
- Do NOT translate or change any of the JSON keys (e.g. keep "nav", "hero", "services.title_part1" as they are).
- Do NOT translate proper nouns like "Ali CNC Pakistan", "Raja Muhammad Ali Asghar", "Umer CNC", "CadCrowd", "Crunchbase", "Onshape", "Vectric", "Vectric Aspire", "TITAN-3M & 2M", "KakaoTalk", "Line", "WhatsApp", "Rawalpindi", "Punjab".
- Keep the tone professional, premium, and industrial.
- Ensure the values are fully translated into natural-sounding ${langName}.
- Return ONLY the translated JSON. No markdown code blocks, no trailing notes, no explanation. Just raw JSON.

English JSON:
${enDataStr}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

    // Validate JSON
    const parsed = JSON.parse(cleanedText);
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), "utf8");
    console.log(`✅ Successfully translated and saved ${langCode}.json`);
  } catch (err) {
    console.error(`❌ Failed translating to ${langCode}:`, err.message);
  }
}

async function main() {
  console.log("Starting static pre-translation for supported languages...");
  for (const lang of SUPPORTED_LANGUAGES) {
    await translateTo(lang.code, lang.name);
    // Add brief delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.log("Static pre-translation complete.");
}

main();
