import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const apiKey = process.env.BACKEND_API_KEY || "fallback_secret_api_key_123";

  try {
    const contentType = request.headers.get("content-type") || "";

    // Proxy the request to the backend
    const res = await fetch(`${backendUrl}/api/vectorize`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": contentType,
      },
      body: request.body,
      // @ts-ignore - duplex is required when sending a stream body in fetch
      duplex: "half",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    // Stream the binary response (.svgv file) back to the client
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": res.headers.get("Content-Disposition") || 'attachment; filename="vectorized.svgv"',
      },
    });
  } catch (err: any) {
    console.error("Error proxying vectorize SVGV:", err);
    return NextResponse.json({ error: `Backend unreachable: ${err.message}` }, { status: 502 });
  }
}
