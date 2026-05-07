import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { fallbackSummary?: string; prompt?: string };
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ summary: body.fallbackSummary ?? "Your deterministic audit summary is ready." }, { status: 200 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: body.prompt ?? "Summarize this AI spend audit."
        }
      ]
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Unable to summarize audit." }, { status: response.status });
  }

  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  return NextResponse.json({ summary: data.content?.[0]?.text ?? "" });
}
