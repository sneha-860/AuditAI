import { createHash, randomUUID } from "crypto";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeAuditReport } from "@/lib/auditPayload";
import { generateAuditSummary } from "@/lib/auditSummary";
import { corsPreflight, withCors } from "@/lib/cors";
import { formatDollars } from "@/lib/format";
import type { AuditReport } from "@/types";

/*
Abuse protection uses three layers:
1. Honeypot field: LeadCapture includes a visually hidden "website" input. Bots often fill it; humans should not.
2. IP rate limiting: Vercel's x-forwarded-for IP is limited through Vercel KV. Limit: 5/hour.
3. Minimum time check: LeadCapture sends visibleForMs from Zustand; submissions under 3 seconds are rejected.
*/

const AUDIT_TTL_SECONDS = 86400;
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "1 h")
});
const TOOL_IDS = ["cursor", "github-copilot", "claude", "chatgpt", "anthropic-api", "openai-api", "gemini", "windsurf"] as const;
const PRIMARY_USE_CASES = ["Coding", "Writing", "Data Analysis", "Research", "Mixed"] as const;
const COMPANY_STAGES = ["Solo/Freelance", "Early Startup (2-10)", "Growth (11-50)", "Scale (51+)"] as const;
const ROLES = ["Founder/CEO", "CTO/Engineering Lead", "Engineering Manager", "Developer", "Finance/Ops", "Other"] as const;

function toolInputSchema(toolId: (typeof TOOL_IDS)[number]) {
  return z
    .object({
      toolId: z.literal(toolId),
      enabled: z.boolean(),
      planId: z.string().min(1),
      seats: z.number().int().min(0),
      monthlySpend: z.number().min(0),
      avgTokensMonthly: z.number().int().min(0).optional()
    })
    .strict();
}

const auditInputSchema = z
  .object({
    tools: z
      .object({
        cursor: toolInputSchema("cursor"),
        "github-copilot": toolInputSchema("github-copilot"),
        claude: toolInputSchema("claude"),
        chatgpt: toolInputSchema("chatgpt"),
        "anthropic-api": toolInputSchema("anthropic-api"),
        "openai-api": toolInputSchema("openai-api"),
        gemini: toolInputSchema("gemini"),
        windsurf: toolInputSchema("windsurf")
      })
      .strict(),
    totalTeamSize: z.number().int().min(0),
    primaryUseCase: z.enum(PRIMARY_USE_CASES),
    companyStage: z.enum(COMPANY_STAGES)
  })
  .strict();

const toolResultSchema = z
  .object({
    toolId: z.enum(TOOL_IDS),
    toolName: z.string().min(1),
    planName: z.string().min(1).optional(),
    currentSpend: z.number().min(0),
    recommendedSpend: z.number().min(0),
    estimatedSavings: z.number().min(0),
    recommendation: z.string().min(1),
    status: z.enum(["optimal", "minor", "action"]).optional(),
    reason: z.string().min(1).optional()
  })
  .strict();

const recommendationSchema = z
  .object({
    id: z.string().min(1),
    category: z.enum(["plan-fit", "redundancy", "alternative", "credits", "usage", "status"]),
    toolIds: z.array(z.enum(TOOL_IDS)),
    title: z.string().min(1),
    action: z.string().min(1),
    currentCost: z.number().min(0),
    recommendedCost: z.number().min(0),
    monthlySavings: z.number().min(0),
    annualSavings: z.number().min(0),
    confidence: z.enum(["high", "medium", "low"]),
    reason: z.string().min(1),
    severity: z.enum(["good", "minor", "action"])
  })
  .strict();

const auditReportSchema = z
  .object({
    totalMonthlySpend: z.number().min(0),
    totalAnnualSpend: z.number().min(0),
    totalMonthlySavings: z.number().min(0),
    totalAnnualSavings: z.number().min(0),
    isHighValue: z.boolean(),
    healthScore: z.number().int().min(0).max(100),
    toolResults: z.array(toolResultSchema),
    recommendations: z.array(recommendationSchema),
    creditsOpportunity: z
      .object({
        eligible: z.boolean(),
        prominent: z.boolean(),
        tools: z.array(z.string().min(1)),
        message: z.string().min(1)
      })
      .strict()
      .optional(),
    summary: z.string()
  })
  .strict();

const leadRequestSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    companyName: z.string().trim().optional(),
    role: z.enum(ROLES).optional(),
    website: z.string().optional(),
    visibleForMs: z.number().int().min(0).optional(),
    input: auditInputSchema,
    report: auditReportSchema
  })
  .strict();

type LeadRequest = z.infer<typeof leadRequestSchema>;

export const OPTIONS = corsPreflight;

export const POST = withCors(async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = leadRequestSchema.safeParse(requestBody);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request payload.", validationErrors: parsedBody.error.flatten() }, { status: 400 });
  }

  const body: LeadRequest = parsedBody.data;
  const email = body.email;
  const honeypotTriggered = Boolean(body.website?.trim());
  const clientIp = getClientIp(request);

  const { success } = await ratelimit.limit(`audit:${clientIp}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests, try again later" }, { status: 429 });
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
  const shareToken = randomUUID();
  const shareUrl = `/audit/share/${shareToken}`;
  const ipHash = hashIp(clientIp);
  const isHighValue = report.isHighValue || report.totalMonthlySpend > 500;
  const summary = await generateAuditSummary({ input: body.input, report });
  const reportWithSummary: AuditReport = {
    ...report,
    summary
  };

  try {
    await kv.set(shareToken, reportWithSummary, { ex: AUDIT_TTL_SECONDS });
  } catch (error) {
    console.error("Failed to store audit in Vercel KV", error);
    return NextResponse.json({ error: "Unable to store audit report." }, { status: 500 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    const emailSent = await trySendAuditEmail({
      email,
      companyName: body.companyName,
      report: reportWithSummary,
      summary,
      shareUrl: absoluteUrl(request, shareUrl),
      isHighValue
    });

    return NextResponse.json({ ok: true, configured: false, emailSent, shareUrl });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
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

  const emailSent = await trySendAuditEmail({
    email,
    companyName: body.companyName,
    report: reportWithSummary,
    summary,
    shareUrl: absoluteUrl(request, shareUrl),
    isHighValue
  });

  return NextResponse.json({ ok: true, emailSent, shareUrl });
});

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

async function trySendAuditEmail(options: {
  email: string;
  companyName?: string;
  report: AuditReport;
  summary: string;
  shareUrl: string | null;
  isHighValue: boolean;
}): Promise<boolean> {
  try {
    return await sendAuditEmail(options);
  } catch (error) {
    console.error("Failed to send audit email", error);
    return false;
  }
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
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  const resend = new Resend(apiKey);
  const company = companyName?.trim() || "your team";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Credex <onboarding@resend.dev>",
    to: email,
    subject: `Your AI Spend Audit - ${company} saves ${formatDollars(report.totalMonthlySavings)}/month`,
    html: buildEmailHtml({ company, report, summary, shareUrl, isHighValue })
  });

  return true;
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
      <div style="max-width:640px;margin:0 auto;background:#111111;border:0.5px solid #1e1e1e;border-radius:8px;padding:28px;">
        <div style="font-size:22px;font-weight:500;color:#00e87a;">Credex</div>
        <h1 style="font-size:24px;margin:28px 0 8px;">Here's your audit summary</h1>
        <p style="line-height:1.7;color:#d4d4d4;">${escapeHtml(summary)}</p>
        <div style="margin:28px 0;padding:20px;border-radius:8px;background:#0d1f18;border:0.5px solid #1a4030;">
          <div style="font-size:14px;color:#9ca3af;">Total potential savings</div>
          <div style="font-size:36px;font-weight:500;color:#00e87a;">${formatDollars(report.totalMonthlySavings)}/month</div>
          <div style="font-size:16px;color:#d4d4d4;">${formatDollars(report.totalAnnualSavings)}/year</div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead>
            <tr>
              <th align="left" style="padding:10px;border-bottom:0.5px solid #333;color:#9ca3af;">Recommendation</th>
              <th align="right" style="padding:10px;border-bottom:0.5px solid #333;color:#9ca3af;">Savings</th>
            </tr>
          </thead>
          <tbody>
            ${topRecommendations
              .map(
                (rec) => `
                  <tr>
                    <td style="padding:12px 10px;border-bottom:0.5px solid #292929;color:#f5f5f5;">${escapeHtml(rec.action)}</td>
                    <td align="right" style="padding:12px 10px;border-bottom:0.5px solid #292929;color:#00e87a;">${formatDollars(rec.monthlySavings)}/mo</td>
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
            ? `<a href="${shareUrl}" style="display:inline-block;margin-top:18px;background:#00e87a;color:#0f0f0f;text-decoration:none;font-weight:500;padding:12px 16px;border-radius:6px;">Open shareable audit</a>`
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
