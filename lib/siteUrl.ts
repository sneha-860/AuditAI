const PRODUCTION_URL = "https://audit-ai-gamma.vercel.app";

function normalizeOrigin(url: string): string {
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/$/, "");
}

export function getSiteOrigin(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;

  if (configuredUrl) {
    return normalizeOrigin(configuredUrl);
  }

  if (process.env.VERCEL_URL) {
    return normalizeOrigin(process.env.VERCEL_URL);
  }

  return PRODUCTION_URL;
}

export function getSiteHost(): string {
  return new URL(getSiteOrigin()).host;
}
