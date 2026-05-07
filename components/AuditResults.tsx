"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Mail, TrendingDown, TriangleAlert } from "lucide-react";
import { LeadCapture } from "@/components/LeadCapture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeSpend } from "@/lib/auditEngine";
import { cn } from "@/lib/utils";
import type { AuditInput, ToolResult } from "@/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function dollars(value: number): string {
  return currencyFormatter.format(value);
}

function scoreTone(score: number): { label: string; className: string } {
  if (score >= 85) {
    return { label: "Green", className: "border-[#00ff88]/40 bg-[#00ff88]/15 text-[#00ff88]" };
  }

  if (score >= 65) {
    return { label: "Yellow", className: "border-yellow-400/40 bg-yellow-400/15 text-yellow-200" };
  }

  return { label: "Red", className: "border-red-400/40 bg-red-500/15 text-red-200" };
}

function resultStyle(status: ToolResult["status"]) {
  if (status === "action") {
    return {
      border: "border-red-400/55",
      icon: <TriangleAlert className="h-5 w-5 text-red-300" aria-hidden="true" />,
      badge: "bg-red-500/15 text-red-200"
    };
  }

  if (status === "minor") {
    return {
      border: "border-yellow-400/55",
      icon: <TrendingDown className="h-5 w-5 text-yellow-200" aria-hidden="true" />,
      badge: "bg-yellow-400/15 text-yellow-100"
    };
  }

  return {
    border: "border-[#00ff88]/45",
    icon: <CheckCircle2 className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />,
    badge: "bg-[#00ff88]/15 text-[#00ff88]"
  };
}

export function AuditResults({ input }: { input: AuditInput }) {
  const report = useMemo(() => analyzeSpend(input), [input]);
  const score = scoreTone(report.healthScore);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [shareLabel, setShareLabel] = useState("Share My Audit");

  useEffect(() => {
    let cancelled = false;

    async function summarize() {
      setSummaryLoading(true);
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            fallbackSummary: report.summary,
            prompt: `Summarize this AI spend audit in under 100 words, finance-literate and specific: ${JSON.stringify({
              spend: report.totalMonthlySpend,
              savings: report.totalMonthlySavings,
              score: report.healthScore,
              recommendations: report.recommendations.slice(0, 5).map((rec) => rec.reason)
            })}`
          })
        });
        const data = (await response.json()) as { summary?: string };
        if (!cancelled) {
          setSummary(data.summary?.trim() || report.summary);
        }
      } catch {
        if (!cancelled) {
          setSummary(report.summary);
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    }

    void summarize();

    return () => {
      cancelled = true;
    };
  }, [report]);

  async function copyShareUrl() {
    const url = typeof window === "undefined" ? "" : window.location.href;
    await navigator.clipboard.writeText(url);
    setShareLabel("Copied");
    window.setTimeout(() => setShareLabel("Share My Audit"), 1600);
  }

  return (
    <section className="mx-auto max-w-6xl space-y-5">
      <Card className="overflow-hidden border-[#00ff88]/35 bg-[#00ff88]/10 shadow-[0_0_60px_rgba(0,255,136,0.08)]">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#00ff88]">AI spend audit</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              You could save {dollars(report.totalMonthlySavings)}/mo
            </h1>
            <p className="mt-4 text-xl text-zinc-300">
              {dollars(report.totalAnnualSavings)}/year in deterministic, finance-reviewable optimizations.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-5">
            <p className="text-sm text-muted-foreground">Health Score</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-5xl font-semibold text-white">{report.healthScore}</span>
              <span className="pb-2 text-xl text-zinc-400">/100</span>
            </div>
            <div className={cn("mt-4 inline-flex rounded-md border px-3 py-1 text-sm font-semibold", score.className)}>
              {score.label} status
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardContent className="p-5 sm:p-6">
          {summaryLoading ? (
            <div className="space-y-3" aria-label="Loading AI summary">
              <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-7/12 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <p className="text-base italic leading-8 text-zinc-300">{summary}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-white">Per-tool breakdown</h2>
        <Button type="button" variant="secondary" onClick={copyShareUrl} className="border border-white/10">
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          {shareLabel}
        </Button>
      </div>

      <div className="grid gap-4">
        {report.toolResults.map((tool, index) => {
          const style = resultStyle(tool.status);

          return (
            <motion.div
              key={tool.toolId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.35, ease: "easeOut" }}
            >
              <Card className={cn("border bg-white/[0.035]", style.border)}>
                <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      {style.icon}
                      <h3 className="text-lg font-semibold text-white">
                        {tool.toolName} {tool.planName}
                      </h3>
                      <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", style.badge)}>
                        {tool.estimatedSavings > 0 ? `Save ${dollars(tool.estimatedSavings)}/mo` : "Good fit"}
                      </span>
                    </div>
                    <p className="mt-3 text-base font-medium text-zinc-100">→ {tool.recommendation}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">Reason: {tool.reason}</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/20 px-4 py-3 text-right">
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-semibold text-white">{dollars(tool.currentSpend)}/mo</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {report.creditsOpportunity?.prominent ? (
        <Card className="border-[#00ff88]/45 bg-[#00ff88]/10">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Capture even more savings</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{report.creditsOpportunity.message}</p>
            </div>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00e67a]">Book a consultation</Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />
            Get this report by email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeadCapture />
        </CardContent>
      </Card>
    </section>
  );
}
