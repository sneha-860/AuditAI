import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink, Sparkles, TrendingDown } from "lucide-react";
import { ShareAuditButton } from "@/components/ShareAuditButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSharedAuditReport, getSiteOrigin } from "@/lib/sharedAudit";
import { cn } from "@/lib/utils";
import type { AuditRecommendation, AuditReport, ToolResult } from "@/types";

type SharedAuditPageProps = {
  params: { token: string };
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function dollars(value: number): string {
  return currencyFormatter.format(value);
}

function scoreTone(score: number): string {
  if (score >= 85) {
    return "border-[#00ff88]/45 bg-[#00ff88]/15 text-[#00ff88]";
  }

  if (score >= 65) {
    return "border-yellow-400/45 bg-yellow-400/15 text-yellow-100";
  }

  return "border-red-400/45 bg-red-500/15 text-red-100";
}

function countOptimizations(report: AuditReport): number {
  return report.recommendations.filter((recommendation) => recommendation.monthlySavings > 0).length;
}

function topSaving(report: AuditReport): number {
  return Math.max(0, ...report.recommendations.map((recommendation) => recommendation.monthlySavings));
}

export async function generateMetadata({ params }: SharedAuditPageProps): Promise<Metadata> {
  const report = await getSharedAuditReport(params.token);

  if (!report) {
    return {
      title: "Audit link expired | Credex",
      description: "This audit link has expired or does not exist. Run your own free AI spend audit.",
      robots: { index: false, follow: false }
    };
  }

  const toolsAudited = report.toolResults.length;
  const optimizations = countOptimizations(report);
  const topSave = topSaving(report);
  const title = `I could save ${dollars(report.totalMonthlySavings)}/month on AI tools - here's my audit`;
  const description = `${toolsAudited} AI tools audited. ${optimizations} optimizations found. Top save: ${dollars(topSave)}/mo. Free audit at credex.rocks`;
  const siteOrigin = getSiteOrigin();
  const imageUrl = `${siteOrigin}/api/og?token=${encodeURIComponent(params.token)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteOrigin}/audit/share/${params.token}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Credex AI spend audit savings preview"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export default async function SharedAuditPage({ params }: SharedAuditPageProps) {
  const report = await getSharedAuditReport(params.token);

  if (!report) {
    return <InvalidAuditLink />;
  }

  const optimizations = countOptimizations(report);
  const shareTitle = `I could save ${dollars(report.totalMonthlySavings)}/month on AI tools`;
  const shareText = `${report.toolResults.length} tools audited, ${optimizations} optimizations found.`;

  return (
    <main id="main-content" className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,255,136,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_120px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="absolute bottom-5 right-6 text-xs font-medium text-white/25">Audit by credex.rocks</div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-1 text-sm font-semibold text-[#00ff88]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Public AI spend audit
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <ShareAuditButton title={shareTitle} text={shareText} />
            <Button asChild className="bg-[#00ff88] text-black hover:bg-[#00e67a]">
              <Link href="/">
                Run your own audit
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Total potential savings</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-normal text-white sm:text-7xl">
              {dollars(report.totalMonthlySavings)}
              <span className="text-3xl text-zinc-400 sm:text-5xl">/mo</span>
            </h1>
            <p className="mt-4 max-w-2xl text-xl leading-8 text-zinc-300">
              {dollars(report.totalAnnualSavings)}/year identified across {report.toolResults.length} AI tools, with{" "}
              {optimizations} optimization{optimizations === 1 ? "" : "s"} ready for review.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MetricCard label="Health score" value={`${report.healthScore}/100`} tone={scoreTone(report.healthScore)} />
            <MetricCard label="Current monthly spend" value={`${dollars(report.totalMonthlySpend)}/mo`} />
          </div>
        </div>

        <Card className="mt-8 border-white/10 bg-black/25">
          <CardContent className="p-5 sm:p-6">
            <p className="text-base italic leading-8 text-zinc-300">{report.summary}</p>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/10 bg-black/20">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-white">Recommendations</h2>
              </div>
              <div className="space-y-3">
                {report.recommendations.map((recommendation) => (
                  <RecommendationRow key={recommendation.id} recommendation={recommendation} />
                ))}
                {report.recommendations.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
                    No paid optimizations found. This stack already looks lean.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-white">Tools audited</h2>
              </div>
              <div className="grid gap-3">
                {report.toolResults.map((tool) => (
                  <ToolRow key={tool.toolId} tool={tool} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={cn("mt-2 inline-flex rounded-md border border-transparent px-3 py-1 text-3xl font-semibold text-white", tone)}>
        {value}
      </p>
    </div>
  );
}

function RecommendationRow({ recommendation }: { recommendation: AuditRecommendation }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{recommendation.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{recommendation.action}</p>
        </div>
        <p className="shrink-0 text-lg font-semibold text-[#00ff88]">{dollars(recommendation.monthlySavings)}/mo</p>
      </div>
    </div>
  );
}

function ToolRow({ tool }: { tool: ToolResult }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-white">
            {tool.toolName} {tool.planName}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{tool.recommendation}</p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">{tool.reason}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left sm:text-right">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Spend</p>
            <p className="mt-1 font-semibold text-white">{dollars(tool.currentSpend)}/mo</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Save</p>
            <p className="mt-1 font-semibold text-[#00ff88]">{dollars(tool.estimatedSavings)}/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvalidAuditLink() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-foreground">
      <Card className="max-w-lg border-white/10 bg-white/[0.04]">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-semibold text-white">This audit link has expired or does not exist.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Run your own free audit and get a fresh shareable report.</p>
          <Button asChild className="mt-6 bg-[#00ff88] text-black hover:bg-[#00e67a]">
            <Link href="/">
              Run your own free audit
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
