import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const apiKey = process.env.BACKEND_API_KEY || "fallback_secret_api_key_123";

  try {
    const body = await request.json().catch(() => ({}));

    // Proxy the request to the backend
    const res = await fetch(`${backendUrl}/api/simulated`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    // Stream the binary response back to the client
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="simulated.svgv"',
      },
    });
  } catch (err: any) {
    console.error("Error proxying simulated SVGV:", err);
    return NextResponse.json({ error: `Backend unreachable: ${err.message}` }, { status: 502 });
  }
}
