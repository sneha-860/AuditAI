"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, Mail, Sparkles, TriangleAlert } from "lucide-react";
import { EmailReportForm } from "@/components/EmailReportForm";
import { formatDollars } from "@/lib/format";
import { useAuditResultsStore, type AuditResult } from "@/store/auditStore";
import type { AuditInput, AuditReport, AuditRecommendation, ToolId, ToolResult } from "@/types";
import type { AuditResult as EmailAuditResult } from "@/types/audit";

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatDollars(display)}</>;
}

export function AuditResults() {
  const router = useRouter();
  const input = useAuditResultsStore((state) => state.input);
  const result = useAuditResultsStore((state) => state.result);
  const startOver = useAuditResultsStore((state) => state.startOver);
  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [aiSummary, setAiSummary] = useState<{ key: string; text: string } | null>(null);
  const emailAuditResult = useMemo(() => (result ? toEmailAuditResult(result) : null), [result]);
  const summaryPayload = useMemo(() => {
    if (!input || !result) return null;

    const report = toAuditReport(result);
    const key = `${result.totalSpend}-${result.savings}-${result.toolCount}-${result.recommendations.length}-${result.overlaps.length}`;

    return { input, report, key };
  }, [input, result]);

  useEffect(() => {
    if (!summaryPayload) return;

    const controller = new AbortController();

    fetch("/api/summarize", {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: summaryPayload.input, report: summaryPayload.report })
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Summary unavailable"))))
      .then((data: { summary?: string }) => setAiSummary({ key: summaryPayload.key, text: data.summary ?? summaryPayload.report.summary }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setAiSummary({ key: summaryPayload.key, text: summaryPayload.report.summary });
        }
      });

    return () => controller.abort();
  }, [summaryPayload]);

  async function copyShareableLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleStartOver() {
    startOver();
    router.push("/#spend-form");
  }

  if (!result) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-[760px] items-center justify-center px-6 text-center sm:px-12">
        <div className="rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#111] px-6 py-8">
          <h1 className="text-[20px] font-medium text-white">Run an audit to see your savings</h1>
          <p className="mt-3 text-[13px] leading-[1.6] text-[#888]">Add at least one AI tool, then calculate your savings.</p>
          <button type="button" onClick={handleStartOver} className="mt-6 rounded-md bg-[#00e87a] px-5 py-3 text-[13px] font-semibold text-black transition hover:brightness-110">
            Start over
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[980px] px-6 pb-16 pt-10 sm:px-10">
      <div className="relative overflow-hidden rounded-lg border-[0.5px] border-[#1a4030] bg-[#0b1711] px-5 py-9 text-center shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:px-8 sm:py-12">
        <div className="absolute inset-0 bg-[linear-gradient(#123024_1px,transparent_1px),linear-gradient(90deg,#123024_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.18]" aria-hidden="true" />
        <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border-[0.5px] border-[#1a4030] bg-[#0d1f18] px-3 py-[7px] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00e87a]">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Audit results
        </p>
        {result.savings > 0 ? (
          <h1 className="mx-auto mt-5 max-w-[760px] text-[38px] font-semibold leading-[1.05] text-[#00e87a] sm:text-[64px]">
            You could save <CountUp value={result.savings} />
            <span className="mt-2 block text-[22px] leading-tight text-white sm:text-[34px]">per month</span>
          </h1>
        ) : (
          <h1 className="mx-auto mt-5 max-w-[640px] text-[30px] font-semibold leading-tight text-[#00e87a] sm:text-[46px]">No savings found - your stack looks optimised!</h1>
        )}
        <p className="mx-auto mt-5 max-w-[560px] text-[14px] leading-[1.7] text-[#93a39b]">
          Based on your selected tools, plans, and team size. Review the highest-confidence actions below.
        </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border-[0.5px] border-[#242424] bg-[#111] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777]">Current spend</p>
          <p className="mt-3 text-[26px] font-semibold text-white">
            {formatDollars(result.totalSpend)}
            <span className="text-[15px] font-medium text-[#777]">/month across {result.toolCount} tools</span>
          </p>
        </article>

        <article className="rounded-lg border-[0.5px] border-[#1a4030] bg-[#0d1f18] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00e87a]">Annual savings</p>
          <p className="mt-3 text-[26px] font-semibold text-white">That&apos;s {formatDollars(result.annualSavings)}/year</p>
        </article>
      </div>

      {result.overlaps.length > 0 ? (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#999]">
            <TriangleAlert className="h-4 w-4 text-[#fbbf24]" aria-hidden="true" />
            Overlap warnings
          </h2>
          <div className="mt-3 space-y-3">
            {result.overlaps.map((overlap) => (
              <article key={overlap.id} className="grid gap-3 rounded-lg border-[0.5px] border-[#4a3511] bg-[#151106] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-[15px] font-semibold text-[#fbbf24]">{overlap.message}</p>
                  <p className="mt-2 text-[12px] text-[#9b8f70]">Compare actual usage before renewing both tools.</p>
                </div>
                {overlap.monthlySaving > 0 ? <p className="rounded-md bg-[#241a05] px-3 py-2 text-[13px] font-semibold text-[#fbbf24]">{formatDollars(overlap.monthlySaving)}/mo</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {result.recommendations.length > 0 ? (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#999]">
            <CheckCircle2 className="h-4 w-4 text-[#00e87a]" aria-hidden="true" />
            Recommendations
          </h2>
          <div className="mt-3 divide-y divide-[#202020] overflow-hidden rounded-lg border-[0.5px] border-[#242424] bg-[#111]">
            {result.recommendations.map((recommendation) => (
              <article key={`${recommendation.toolName}-${recommendation.action}`} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-[16px] font-semibold text-white">{recommendation.toolName}</p>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">{recommendation.action}</p>
                </div>
                <p className="rounded-md border-[0.5px] border-[#1a4030] bg-[#0d1f18] px-3 py-2 text-[14px] font-semibold text-[#00e87a]">Save {formatDollars(recommendation.monthlySaving)}/mo</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-lg border-[0.5px] border-[#1a4030] bg-[#0d1f18] p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border-[0.5px] border-[#1a4030] bg-[#10291d]">
            <Sparkles className="h-4 w-4 text-[#00e87a]" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#00e87a]">AI summary</h2>
            
          </div>
        </div>
        <p className="mt-4 text-[14px] leading-[1.75] text-[#d9e7df]">
          {aiSummary && summaryPayload && aiSummary.key === summaryPayload.key ? aiSummary.text : "Writing a concise CFO-style summary of your audit..."}
        </p>
      </section>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setShowEmailForm((current) => !current)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#00e87a] px-4 py-3 text-[13px] font-semibold text-black transition hover:brightness-110">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Send report to email
        </button>
        <button type="button" onClick={copyShareableLink} className="inline-flex items-center justify-center gap-2 rounded-md border-[0.5px] border-[#2a2a2a] bg-[#111] px-4 py-3 text-[13px] font-medium text-[#ddd] transition hover:bg-[#161616]">
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied link" : "Copy shareable link"}
        </button>
        <button type="button" onClick={handleStartOver} className="inline-flex items-center justify-center gap-2 rounded-md border-[0.5px] border-[#2a2a2a] bg-[#111] px-4 py-3 text-[13px] font-medium text-[#ddd] transition hover:bg-[#161616]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Start over
        </button>
      </div>

      {showEmailForm && emailAuditResult ? (
        <div className="mt-7 rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#0d0d0d] pt-6">
          <EmailReportForm auditResult={emailAuditResult} />
        </div>
      ) : null}
    </section>
  );
}

function toAuditReport(result: AuditResult): AuditReport {
  const recommendations = result.recommendations.map<AuditRecommendation>((recommendation, index) => ({
    id: `result-rec-${index}`,
    category: "redundancy",
    toolIds: [],
    title: recommendation.action,
    action: recommendation.action,
    currentCost: recommendation.monthlySaving,
    recommendedCost: 0,
    monthlySavings: recommendation.monthlySaving,
    annualSavings: recommendation.monthlySaving * 12,
    confidence: "high",
    reason: `${recommendation.toolName}: ${recommendation.action}`,
    severity: recommendation.monthlySaving > 0 ? "action" : "minor"
  }));

  const fallbackToolResult: ToolResult = {
    toolId: "cursor",
    toolName: "AI stack",
    currentSpend: result.totalSpend,
    recommendedSpend: result.totalSpend,
    estimatedSavings: result.savings,
    recommendation: result.savings > 0 ? "Review savings opportunities" : "No major savings opportunities found",
    status: result.savings > 0 ? "minor" : "optimal",
    reason: "Summary of the current audit result."
  };

  const toolResults = result.recommendations.length > 0
    ? result.recommendations.map<ToolResult>((recommendation, index) => ({
      toolId: `recommendation-${index}` as ToolId,
      toolName: recommendation.toolName,
      currentSpend: recommendation.monthlySaving,
      recommendedSpend: 0,
      estimatedSavings: recommendation.monthlySaving,
      recommendation: recommendation.action,
      status: recommendation.monthlySaving > 0 ? "action" : "minor",
      reason: `${recommendation.action} to reduce duplicate AI spend.`
    }))
    : [fallbackToolResult];

  return {
    totalMonthlySpend: result.totalSpend,
    totalAnnualSpend: result.totalSpend * 12,
    totalMonthlySavings: result.savings,
    totalAnnualSavings: result.annualSavings,
    isHighValue: result.totalSpend > 500,
    healthScore: result.savings > 0 ? 78 : 92,
    toolResults,
    recommendations,
    summary: buildLocalSummary(result)
  };
}

function buildLocalSummary(result: AuditResult): string {
  const topRecommendation = result.recommendations[0]?.action ?? "reviewing your current AI stack";

  if (result.savings <= 0) {
    return `Your team is spending ${formatDollars(result.totalSpend)}/month across ${result.toolCount} AI tools. The audit did not find a clear immediate saving, so keep monitoring seat usage and renewals before adding more tools.`;
  }

  return `Your team is spending ${formatDollars(result.totalSpend)}/month across ${result.toolCount} AI tools. The audit found ${formatDollars(result.savings)}/month (${formatDollars(result.annualSavings)}/year) in potential savings, led by ${topRecommendation}. Review the recommendation and remove duplicated spend before the next renewal.`;
}

function toEmailAuditResult(result: AuditResult): EmailAuditResult {
  return {
    totalSpend: result.totalSpend,
    potentialSavings: result.savings,
    recommendations: result.recommendations.map((recommendation) => ({
      title: recommendation.action,
      description: `${recommendation.toolName}: ${formatDollars(recommendation.monthlySaving)}/month saving`,
      savingsPerMonth: recommendation.monthlySaving
    })),
    overlaps: result.overlaps.map((overlap) => ({
      tools: overlap.toolNames,
      description: overlap.message,
      savingsPerMonth: overlap.monthlySaving
    }))
  };
}
