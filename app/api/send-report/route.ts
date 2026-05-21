import { Resend } from "resend";
import { NextResponse } from "next/server";
import { corsPreflight, withCors } from "@/lib/cors";
import type { AuditResult, Recommendation } from "@/types/audit";

interface SendReportRequest {
  email?: string;
  auditResult?: AuditResult;
}

interface SendReportResponse {
  success: true;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export const OPTIONS = corsPreflight;

export const POST = withCors(async function POST(request: Request): Promise<NextResponse<SendReportResponse | { error: string }>> {
  let body: SendReportRequest;

  try {
    body = (await request.json()) as SendReportRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!isAuditResult(body.auditResult)) {
    return NextResponse.json({ error: "A valid audit result is required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return NextResponse.json({ error: "Email delivery is not configured." }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const auditResult = body.auditResult;

  try {
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: `Your AuditAI report: save ${dollars.format(auditResult.potentialSavings)}/month`,
      html: buildEmailHtml(auditResult)
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send AuditAI report", error);
    return NextResponse.json({ error: "Unable to send report. Please try again." }, { status: 500 });
  }
});

function isAuditResult(value: unknown): value is AuditResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuditResult>;

  return (
    isFiniteNumber(candidate.totalSpend) &&
    isFiniteNumber(candidate.potentialSavings) &&
    Array.isArray(candidate.recommendations) &&
    Array.isArray(candidate.overlaps)
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function buildEmailHtml(auditResult: AuditResult): string {
  const topRecommendations = getTopRecommendations(auditResult);

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#111111;border:1px solid #242424;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;">
                <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">Audit<span style="color:#00e87a;">AI</span></div>
                <p style="margin:8px 0 0;color:#8a8a8a;font-size:13px;line-height:20px;">Your AI spend audit report</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1f18;border:1px solid #1a4030;border-radius:8px;">
                  <tr>
                    <td style="padding:22px;">
                      <p style="margin:0 0 6px;color:#9ca3af;font-size:13px;">You could save</p>
                      <h1 style="margin:0;color:#00e87a;font-size:36px;line-height:42px;font-weight:700;">${dollars.format(auditResult.potentialSavings)}/month</h1>
                      <p style="margin:10px 0 0;color:#d4d4d4;font-size:14px;line-height:22px;">Current estimated AI spend: ${dollars.format(auditResult.totalSpend)}/month</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <h2 style="margin:0 0 12px;color:#ffffff;font-size:16px;line-height:24px;">Top recommendations</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th align="left" style="padding:10px;border-bottom:1px solid #2a2a2a;color:#9ca3af;font-size:12px;font-weight:700;">Recommendation</th>
                      <th align="right" style="padding:10px;border-bottom:1px solid #2a2a2a;color:#9ca3af;font-size:12px;font-weight:700;">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topRecommendations.map(recommendationRow).join("")}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 28px;border-top:1px solid #242424;color:#777777;font-size:12px;line-height:20px;">
                Powered by AuditAI &middot; <a href="#" style="color:#777777;text-decoration:underline;">Unsubscribe</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getTopRecommendations(auditResult: AuditResult): Recommendation[] {
  const recommendations = auditResult.recommendations
    .filter((recommendation) => recommendation.savingsPerMonth > 0)
    .sort((a, b) => b.savingsPerMonth - a.savingsPerMonth)
    .slice(0, 3);

  if (recommendations.length > 0) {
    return recommendations;
  }

  return [
    {
      title: "Your AI stack looks efficient",
      description: "No major savings opportunities were detected from this audit.",
      savingsPerMonth: 0
    }
  ];
}

function recommendationRow(recommendation: Recommendation): string {
  return `
    <tr>
      <td style="padding:12px 10px;border-bottom:1px solid #242424;">
        <div style="color:#f5f5f5;font-size:14px;line-height:20px;font-weight:700;">${escapeHtml(recommendation.title)}</div>
        <div style="margin-top:4px;color:#9ca3af;font-size:12px;line-height:18px;">${escapeHtml(recommendation.description)}</div>
      </td>
      <td align="right" style="padding:12px 10px;border-bottom:1px solid #242424;color:#00e87a;font-size:14px;line-height:20px;font-weight:700;white-space:nowrap;">${dollars.format(recommendation.savingsPerMonth)}/mo</td>
    </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
