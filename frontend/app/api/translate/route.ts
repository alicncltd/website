import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Mapping helper to resolve full language names using built-in Intl
function getLanguageName(code: string): string {
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
    return displayNames.of(code) || code;
  } catch (e) {
    return code;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang")?.toLowerCase() || "en";

  const localesDir = path.join(process.cwd(), "locales");
  const enFilePath = path.join(localesDir, "en.json");
  const cacheDir = path.join(localesDir, "cache");
  const cacheFilePath = path.join(cacheDir, `${lang}.json`);

  // 1. If English, return original English translation directly
  if (lang === "en") {
    try {
      const enData = fs.readFileSync(enFilePath, "utf8");
      return NextResponse.json(JSON.parse(enData));
    } catch (err) {
      console.error("Error reading en.json", err);
      return NextResponse.json({ error: "Source locale not found" }, { status: 500 });
    }
  }

  // 2. Check if a static pre-translated file exists
  const staticFilePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(staticFilePath)) {
    try {
      const staticData = fs.readFileSync(staticFilePath, "utf8");
      return NextResponse.json(JSON.parse(staticData));
    } catch (err) {
      console.error(`Error reading static translation for ${lang}`, err);
    }
  }

  // 3. Check if dynamic cache exists
  if (fs.existsSync(cacheFilePath)) {
    try {
      const cachedData = fs.readFileSync(cacheFilePath, "utf8");
      return NextResponse.json(JSON.parse(cachedData));
    } catch (err) {
      console.error(`Error reading cached translation for ${lang}`, err);
    }
  }

  // 3. Translate using Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("GEMINI_API_KEY is not configured. Falling back to English.");
    // Fallback: return English content
    try {
      const enData = fs.readFileSync(enFilePath, "utf8");
      return NextResponse.json(JSON.parse(enData));
    } catch (err) {
      return NextResponse.json({ error: "No API Key configured and English file missing" }, { status: 500 });
    }
  }

  try {
    const enDataStr = fs.readFileSync(enFilePath, "utf8");
    const enData = JSON.parse(enDataStr);
    const targetLanguageName = getLanguageName(lang);

    const prompt = `You are a professional website translator. Translate the values in the following JSON object from English to ${targetLanguageName}. 
- Do NOT translate or change any of the JSON keys (e.g. keep "nav", "hero", "services.title_part1" as they are).
- Do NOT translate proper nouns like "Ali CNC Pakistan", "Raja Muhammad Ali Asghar", "Umer CNC", "CadCrowd", "Crunchbase", "Onshape", "Vectric", "Vectric Aspire", "TITAN-3M & 2M", "KakaoTalk", "Line", "WhatsApp", "Rawalpindi", "Punjab".
- Keep the tone professional, premium, and industrial.
- Ensure the values are fully translated into natural-sounding ${targetLanguageName}.
- Return ONLY the translated JSON. No markdown code blocks, no trailing notes, no explanation. Just raw JSON.

English JSON:
${enDataStr}`;

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

    // Clean up potential markdown code block markers in case Gemini ignored responseMimeType
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    // Validate that it's valid JSON before saving to cache
    const translatedJson = JSON.parse(cleanedText);

    // Save to cache
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(translatedJson, null, 2), "utf8");

    return NextResponse.json(translatedJson);
  } catch (err: any) {
    console.error(`Failed to translate to ${lang}:`, err);
    // Safe fallback to English rather than breaking the application interface
    try {
      const enData = fs.readFileSync(enFilePath, "utf8");
      return NextResponse.json(JSON.parse(enData));
    } catch (fallbackErr) {
      return NextResponse.json(
        { error: "Translation failed and source locale could not be read" },
        { status: 500 }
      );
    }
  }
}
