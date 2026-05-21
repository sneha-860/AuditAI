const DEFAULT_ALLOWED_ORIGIN = "https://audit-ai-gamma.vercel.app";

type ApiHandler = (request: Request) => Response | Promise<Response>;

function getAllowedOrigin(): string {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_ALLOWED_ORIGIN;
  return /^https?:\/\//i.test(origin) ? origin.replace(/\/$/, "") : `https://${origin.replace(/\/$/, "")}`;
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

export function corsPreflight(): Response {
  return new Response(null, {
    status: 200,
    headers: corsHeaders()
  });
}

export function withCors(handler: ApiHandler): ApiHandler {
  return async (request: Request) => {
    const response = await handler(request);

    for (const [key, value] of Object.entries(corsHeaders())) {
      response.headers.set(key, value);
    }

    return response;
  };
}
