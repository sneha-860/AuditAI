import type { Metadata } from "next";
import Link from "next/link";
import { Link2Off } from "lucide-react";
import { ShareAuditButton } from "@/components/ShareAuditButton";
import { getSharedAuditReport } from "@/lib/sharedAudit";
import { formatDollars } from "@/lib/format";
import { getSiteOrigin } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";
import type { AuditReport, ToolResult } from "@/types";

type SharedAuditPageProps = {
  params: Promise<{ token: string }>;
};

function countOptimizations(report: AuditReport): number {
  return report.recommendations.filter((recommendation) => recommendation.monthlySavings > 0).length;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export async function generateMetadata({ params }: SharedAuditPageProps): Promise<Metadata> {
  const { token } = await params;
  const report = await getSharedAuditReport(token);
  if (!report) {
    return { title: "Audit not found | AuditAI", description: "This audit has expired or doesn't exist.", robots: { index: false, follow: false } };
  }
  const siteOrigin = getSiteOrigin();
  const savings = Math.round(report.totalMonthlySavings);
  const title = `I could save $${savings}/month on AI tools`;
  const description = `${report.toolResults.length} AI tools audited. $${savings}/month in potential savings found.`;
  const imageUrl = `${siteOrigin}/audit/share/${token}/opengraph-image`;
  return {
    title,
    description,
    openGraph: {
      title,
      description: `${report.toolResults.length} tools audited. Free audit at AuditAI.`,
      type: "website",
      url: `${siteOrigin}/audit/share/${token}`,
      siteName: "AuditAI",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] }
  };
}

export default async function SharedAuditPage({ params }: SharedAuditPageProps) {
  const { token } = await params;
  const report = await getSharedAuditReport(token);
  if (!report) return <InvalidAuditLink />;

  const verified = "May 2026";

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[900px]">
        <section className="flex flex-col gap-3 border-b-[0.5px] border-[#1a1a1a] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[14px] font-medium text-white">AI Spend Audit Report</h1>
            <p className="mt-1 text-[10px] text-[#444]">
              {report.toolResults.length} tools audited &middot; Verified {verified}
            </p>
          </div>
          <ShareAuditButton title={`AI spend audit: ${formatDollars(report.totalMonthlySavings)}/month savings found`} text={`${report.toolResults.length} tools audited.`} />
        </section>

        <section className="px-6 py-9 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#00e87a]/75">Potential monthly savings</p>
          <p className="mt-3 text-[48px] font-medium leading-none text-[#00e87a]">{formatDollars(report.totalMonthlySavings)}</p>
          <p className="mt-3 text-[16px] text-[#777]">{formatDollars(report.totalAnnualSavings)}/year</p>
          <p className="mt-4 inline-flex items-center gap-2 text-[12px] text-[#777]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: scoreColor(report.healthScore) }} aria-hidden="true" />
            Spend health: {report.healthScore}/100
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-[6px]">
            {report.toolResults.map((tool) => (
              <span key={tool.toolId} className="rounded-full border-[0.5px] border-[#1e1e1e] bg-[#111] px-[10px] py-[3px] text-[9px] text-[#666]">
                <span className={tool.status === "optimal" ? "text-[#22c55e]" : tool.status === "action" ? "text-[#ef4444]" : "text-[#f59e0b]"}>
                  {tool.status === "optimal" ? "✓" : tool.status === "action" ? "✕" : "↓"}
                </span>{" "}
                {tool.toolName}
              </span>
            ))}
          </div>
        </section>

        <section className="border-t-[0.5px] border-[#1a1a1a] px-6 py-5">
          <p className="mb-4 pt-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#555]">Findings</p>
          <div className="space-y-2">
            {report.toolResults.map((tool) => (
              <ToolCard key={tool.toolId} tool={tool} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 px-6 py-[14px] text-[9px] text-[#444] sm:flex-row sm:items-center sm:justify-between">
          <p>Audit by credex.rocks &middot; Pricing verified May 2026</p>
          <Link href="/" className="text-[10px] text-[#00e87a]/75">
            Run your own free audit &rarr;
          </Link>
        </section>
      </div>
    </main>
  );
}

function ToolCard({ tool }: { tool: ToolResult }) {
  const action = tool.status === "action";
  const minor = tool.status === "minor";
  const cls = action ? "border-[#3d1515] bg-[#110a0a]" : minor ? "border-[#302510] bg-[#110f07]" : "border-[#133322] bg-[#0a110d]";
  const text = action ? "text-[#f87171]" : minor ? "text-[#fbbf24]" : "text-[#4ade80]";
  const save = action ? "text-[#ef4444]" : "text-[#f59e0b]";
  return (
    <article className={cn("rounded-lg border-[0.5px] px-[14px] py-3", cls)}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[14px] font-medium text-[#eee]">{tool.toolName}</h2>
        <p className="text-[13px] text-[#777]">{formatDollars(tool.currentSpend)}/mo</p>
      </div>
      <p className={cn("mt-2 text-[12px] font-medium", text)}>
        {action ? "→ Drop" : minor ? "→ Change" : "✓ Optimal"} - {tool.status === "optimal" ? "keep" : tool.recommendation}
      </p>
      {tool.estimatedSavings > 0 ? (
        <p className={cn("mt-2 text-[12px] font-semibold", save)}>
          Save {formatDollars(tool.estimatedSavings)}/mo &middot; {formatDollars(tool.estimatedSavings * 12)}/yr
        </p>
      ) : null}
      <p className="mt-1 text-[11px] leading-[1.55] text-[#666]">{tool.reason}</p>
    </article>
  );
}

function InvalidAuditLink() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-20 text-white">
      <div className="max-w-md text-center">
        <Link2Off className="mx-auto mb-5 h-12 w-12 text-[#444]" aria-hidden="true" />
        <h1 className="text-[18px] font-medium text-white">Audit not found</h1>
        <p className="mt-3 text-[14px] leading-[1.6] text-[#888]">This audit has expired or doesn&apos;t exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-[#00e87a] px-5 py-3 text-[13px] font-semibold text-black">
          Create a new audit &rarr;
        </Link>
      </div>
    </main>
  );
}
