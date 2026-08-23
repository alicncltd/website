import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const apiKey = process.env.BACKEND_API_KEY || "fallback_secret_api_key_123";

  try {
    const res = await fetch(`${backendUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(6000), // Avoid infinite hangs
    });

    if (res.ok) {
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: `Server returned non-JSON response: ${text.substring(0, 300)}` };
      }
      return NextResponse.json(data, { status: res.status });
    }
    
    // Non-ok response, trigger serverless fallback directly
    throw new Error(`Status ${res.status}`);
  } catch (err: any) {
    console.warn(`Backend proxy GET failed for ${endpoint}. Running Serverless Fallback...`, err.message);
    
    // Serverless Fallback for News Briefings
    if (endpoint === "/api/admin/news-briefing") {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      
      let newsItems: any[] = [];
      if (supabaseUrl && supabaseKey) {
        try {
          const dbRes = await fetch(`${supabaseUrl}/rest/v1/aggregated_news?published_at=gte.${sixHoursAgo}&order=published_at.desc`, {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            }
          });
          if (dbRes.ok) {
            newsItems = await dbRes.json();
          }
        } catch (dbErr) {
          console.error("Direct Supabase fetch error:", dbErr);
        }
      }

      let summaryText = "No recent news found to summarize.";
      const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (geminiApiKey && newsItems.length > 0) {
        try {
          const newsFeedString = newsItems.slice(0, 15).map((n: any) => `[${n.source.toUpperCase()}] ${n.title}`).join("\n");
          const summaryPrompt = `Evaluate the following list of global geopolitical headlines from the last 6 hours:
${newsFeedString}
Provide a concise geopolitical intelligence digest. Summarize the macro trend and key headlines.`;
          
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: summaryPrompt }] }] })
            }
          );
          if (apiRes.ok) {
            const json = await apiRes.json();
            summaryText = json.candidates?.[0]?.content?.parts?.[0]?.text || summaryText;
          }
        } catch (sumErr: any) {
          summaryText = `Failed to generate AI briefing: ${sumErr.message}`;
        }
      }
      return NextResponse.json({ newsItems, summary: summaryText });
    }

    // Default Webhook empty log buffer
    if (endpoint === "/api/tools/webhook/events") {
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: `Backend unreachable: ${err.message}` }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const apiKey = process.env.BACKEND_API_KEY || "fallback_secret_api_key_123";

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  try {
    const res = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: `Server returned non-JSON response: ${text.substring(0, 300)}` };
      }
      return NextResponse.json(data, { status: res.status });
    }
    
    throw new Error(`Status ${res.status}`);
  } catch (err: any) {
    console.warn(`Backend proxy POST failed for ${endpoint}. Running Serverless Fallback...`, err.message);

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Serverless Fallback for AI Router
    if (endpoint === "/api/tools/router") {
      const start = Date.now();
      const { prompt, mode = "cost" } = body;
      
      let chosenModel = "gemini-2.5-flash";
      let modelLabel = "Gemini 2.5 Flash (Fast/Cheap)";
      if (mode === "quality" || (prompt.length > 100 && mode !== "cost")) {
        chosenModel = "gemini-2.5-pro";
        modelLabel = "Gemini 2.5 Pro (Complex Reasoning)";
      }

      let resultText = "Gemini API key is not configured in Vercel environment variables.";
      let cost = 0;

      if (geminiApiKey) {
        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
          );
          if (apiRes.ok) {
            const json = await apiRes.json();
            resultText = json.candidates?.[0]?.content?.parts?.[0]?.text || "Empty response.";
            const inputTokens = Math.ceil(prompt.length / 4);
            const outputTokens = Math.ceil(resultText.length / 4);
            const inRate = chosenModel.includes("pro") ? 1.25 : 0.075;
            const outRate = chosenModel.includes("pro") ? 0.30 : 0.30;
            cost = ((inputTokens * inRate) + (outputTokens * outRate)) / 1000000;
          } else {
            resultText = `Serverless Fallback API error: ${await apiRes.text()}`;
          }
        } catch (fetchErr: any) {
          resultText = `Serverless Fallback fetch error: ${fetchErr.message}`;
        }
      }

      return NextResponse.json({
        model: modelLabel,
        latency: Date.now() - start,
        cost: Number(cost.toFixed(6)),
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(resultText.length / 4),
        text: resultText
      });
    }

    // Serverless Fallback for Scraper
    if (endpoint === "/api/tools/scrape") {
      const { urls } = body;
      const parsedResults: any[] = [];

      for (const url of urls) {
        let title = "Parsed Page";
        let summary = "Scraped locally via Edge serverless.";
        let keyPoints = ["Parsed locally."];
        let sentiment = "NEUTRAL";

        try {
          const scraperRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
          if (scraperRes.ok) {
            const html = await scraperRes.text();
            const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
            title = titleMatch ? titleMatch[1].trim() : "Parsed Page";
            
            const scrapedText = html
              .replace(/<script[\s\S]*?<\/script>/gi, "")
              .replace(/<style[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .substring(0, 4000);

            if (geminiApiKey) {
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
                  body: JSON.stringify({ contents: [{ parts: [{ text: etlPrompt }] }] })
                }
              );
              if (apiRes.ok) {
                const json = await apiRes.json();
                const parsedText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                const jsonMatch = parsedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const data = JSON.parse(jsonMatch[0]);
                  title = data.title || title;
                  summary = data.summary || summary;
                  keyPoints = data.keyPoints || keyPoints;
                  sentiment = data.sentiment || sentiment;
                }
              }
            }
          }
        } catch (e: any) {
          summary = `Local crawler error: ${e.message}`;
        }

        parsedResults.push({
          url,
          status: "COMPLETED",
          data: { title, author: "Unknown", summary, keyPoints, sentiment }
        });
      }
      return NextResponse.json({ results: parsedResults });
    }

    // Serverless Fallback for EchoDesk Chat
    if (endpoint === "/api/tools/echodesk/chat") {
      const { prompt } = body;
      let text = "Welcome to Ali CNC™ support. Let me log your interest.";
      if (geminiApiKey) {
        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
          );
          if (apiRes.ok) {
            const json = await apiRes.json();
            text = json.candidates?.[0]?.content?.parts?.[0]?.text || text;
          }
        } catch {}
      }
      return NextResponse.json({ text });
    }

    // Serverless Fallback for EchoDesk Summary
    if (endpoint === "/api/tools/echodesk/summary") {
      const { transcript } = body;
      let summary = "Customer requested booking details. Verified address and logged to CRM.";
      if (geminiApiKey) {
        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Evaluate the following phone call transcript:\n${transcript.join("\n")}\nCompile a 2-sentence summary of the customer's issue, the outcome, and indicate if an appointment was booked.`
                  }]
                }]
              })
            }
          );
          if (apiRes.ok) {
            const json = await apiRes.json();
            summary = json.candidates?.[0]?.content?.parts?.[0]?.text || summary;
          }
        } catch {}
      }
      return NextResponse.json({ summary });
    }

    // Default Webhook Simulator fallback
    if (endpoint === "/api/tools/webhook/ingest") {
      const { eventId } = body;
      return NextResponse.json({ status: "PROCESSED", eventId, note: "Fallback local simulation processed." });
    }

    return NextResponse.json({ error: `Backend unreachable: ${err.message}` }, { status: 502 });
  }
}
