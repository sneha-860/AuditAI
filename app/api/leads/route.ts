import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sanitizeAuditReport } from "@/lib/auditPayload";
import { generateAuditSummary } from "@/lib/auditSummary";
import type { AuditInput, AuditReport } from "@/types";

/*
Abuse protection uses three layers:
1. Honeypot field: LeadCapture includes a visually hidden "website" input. Bots often fill it; humans should not.
2. IP rate limiting: the request IP is SHA-256 hashed before storage, then Supabase counts submissions in the past hour. Limit: 5/hour.
3. Minimum time check: LeadCapture sends visibleForMs from Zustand; submissions under 3 seconds are rejected.
*/

type LeadRequest = {
  email?: string;
  companyName?: string;
  role?: string;
  website?: string;
  visibleForMs?: number;
  input?: AuditInput;
  report?: AuditReport;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: LeadRequest;

  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const honeypotTriggered = Boolean(body.website?.trim());

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!body.input || !body.report) {
    return NextResponse.json({ error: "Audit data is required." }, { status: 400 });
  }

  const report = sanitizeAuditReport(body.report);
  if (!report) {
    return NextResponse.json({ error: "A valid audit report is required." }, { status: 400 });
  }

  if ((body.visibleForMs ?? 0) < 3000) {
    return NextResponse.json({ error: "Please wait a moment before submitting." }, { status: 429 });
  }

  if (honeypotTriggered) {
    return NextResponse.json({ ok: true, filtered: true }, { status: 202 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const shareToken = nanoid(10);
  const shareUrl = `/audit/share/${shareToken}`;
  const ipHash = hashIp(getClientIp(request));
  const isHighValue = report.totalMonthlySavings > 500;
  const summary = await generateAuditSummary({ input: body.input, report });
  const reportWithSummary: AuditReport = {
    ...report,
    summary
  };

  if (!supabaseUrl || !serviceRoleKey) {
    await sendAuditEmail({
      email,
      companyName: body.companyName,
      report: reportWithSummary,
      summary,
      shareUrl: null,
      isHighValue
    });

    return NextResponse.json({ ok: true, configured: false, shareUrl: null }, { status: 202 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const { error } = await supabase.from("leads").insert({
    email,
    company_name: body.companyName?.trim() || null,
    role: body.role || null,
    team_size: body.input.totalTeamSize,
    audit_data: reportWithSummary,
    total_monthly_savings: report.totalMonthlySavings,
    is_high_value: isHighValue,
    share_token: shareToken,
    ip_hash: ipHash,
    honeypot_triggered: false
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendAuditEmail({
    email,
    companyName: body.companyName,
    report: reportWithSummary,
    summary,
    shareUrl: absoluteUrl(request, shareUrl),
    isHighValue
  });

  return NextResponse.json({ ok: true, shareUrl });
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "credex-local-dev";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function absoluteUrl(request: Request, path: string): string {
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  return `${origin}${path}`;
}

async function sendAuditEmail({
  email,
  companyName,
  report,
  summary,
  shareUrl,
  isHighValue
}: {
  email: string;
  companyName?: string;
  report: AuditReport;
  summary: string;
  shareUrl: string | null;
  isHighValue: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return;
  }

  const resend = new Resend(apiKey);
  const company = companyName?.trim() || "your team";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Credex <onboarding@resend.dev>",
    to: email,
    subject: `Your AI Spend Audit - ${company} saves $${report.totalMonthlySavings}/month`,
    html: buildEmailHtml({ company, report, summary, shareUrl, isHighValue })
  });
}

function buildEmailHtml({
  company,
  report,
  summary,
  shareUrl,
  isHighValue
}: {
  company: string;
  report: AuditReport;
  summary: string;
  shareUrl: string | null;
  isHighValue: boolean;
}): string {
  const topRecommendations = report.recommendations
    .filter((recommendation) => recommendation.monthlySavings > 0)
    .slice(0, 3);

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0f0f0f;color:#f5f5f5;padding:28px;">
      <div style="max-width:640px;margin:0 auto;background:#171717;border:1px solid #2f2f2f;border-radius:8px;padding:28px;">
        <div style="font-size:22px;font-weight:700;color:#00ff88;">Credex</div>
        <h1 style="font-size:24px;margin:28px 0 8px;">Here's your audit summary</h1>
        <p style="line-height:1.7;color:#d4d4d4;">${escapeHtml(summary)}</p>
        <div style="margin:28px 0;padding:20px;border-radius:8px;background:#00ff881a;border:1px solid #00ff8866;">
          <div style="font-size:14px;color:#9ca3af;">Total potential savings</div>
          <div style="font-size:36px;font-weight:800;color:#00ff88;">$${report.totalMonthlySavings}/month</div>
          <div style="font-size:16px;color:#d4d4d4;">$${report.totalAnnualSavings}/year</div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead>
            <tr>
              <th align="left" style="padding:10px;border-bottom:1px solid #333;color:#9ca3af;">Recommendation</th>
              <th align="right" style="padding:10px;border-bottom:1px solid #333;color:#9ca3af;">Savings</th>
            </tr>
          </thead>
          <tbody>
            ${topRecommendations
              .map(
                (rec) => `
                  <tr>
                    <td style="padding:12px 10px;border-bottom:1px solid #292929;color:#f5f5f5;">${escapeHtml(rec.action)}</td>
                    <td align="right" style="padding:12px 10px;border-bottom:1px solid #292929;color:#00ff88;">$${rec.monthlySavings}/mo</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <p style="line-height:1.7;color:#d4d4d4;margin-top:24px;">
          ${
            isHighValue
              ? "A Credex advisor will reach out within 24 hours about capturing even more savings through discounted credits."
              : "We'll notify you when new optimizations apply to your stack."
          }
        </p>
        ${
          shareUrl
            ? `<a href="${shareUrl}" style="display:inline-block;margin-top:18px;background:#00ff88;color:#0f0f0f;text-decoration:none;font-weight:700;padding:12px 16px;border-radius:6px;">Open shareable audit</a>`
            : ""
        }
        <p style="font-size:12px;color:#9ca3af;margin-top:28px;">Sent for ${escapeHtml(company)}.</p>
      </div>
    </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
