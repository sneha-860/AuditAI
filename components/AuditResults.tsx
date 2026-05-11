"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { analyzeSpend } from "@/lib/auditEngine";
import { formatDollars } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LeadCapture } from "@/components/LeadCapture";
import type { AuditInput, ToolResult } from "@/types";

function tone(score: number) {
  if (score >= 80) return { color: "#22c55e" };
  if (score >= 50) return { color: "#f59e0b" };
  return { color: "#ef4444" };
}

function cardTone(status: ToolResult["status"]) {
  if (status === "action") return { wrap: "border-[#3d1515] border-l-[#ef4444] bg-[#110a0a]", action: "Drop", prefix: "→", color: "text-[#f87171]", save: "text-[#ef4444]" };
  if (status === "minor") return { wrap: "border-[#302510] border-l-[#f59e0b] bg-[#110f07]", action: "Change", prefix: "→", color: "text-[#fbbf24]", save: "text-[#f59e0b]" };
  return { wrap: "border-[#133322] border-l-[#22c55e] bg-[#0a110d]", action: "Optimal", prefix: "✓", color: "text-[#4ade80]", save: "text-[#22c55e]" };
}

function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1200);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, value]);

  return <>{formatDollars(reduced ? value : display)}</>;
}

export function AuditResults({ input }: { input: AuditInput }) {
  const report = useMemo(() => analyzeSpend(input), [input]);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const confettiShown = useRef(false);
  const reduced = useReducedMotion();
  const score = tone(report.healthScore);

  useEffect(() => {
    let cancelled = false;
    async function summarize() {
      setSummaryLoading(true);
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ input, report })
        });
        const data = (await response.json()) as { summary?: string };
        if (!cancelled) setSummary(data.summary?.trim() || report.summary);
      } catch {
        if (!cancelled) setSummary(report.summary);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }
    void summarize();
    return () => {
      cancelled = true;
    };
  }, [input, report]);

  useEffect(() => {
    if (reduced || confettiShown.current || report.totalMonthlySavings <= 200) return;
    confettiShown.current = true;
    void import("canvas-confetti").then(({ default: confetti }) => {
      confetti({ particleCount: 90, spread: 68, origin: { y: 0.18 }, colors: ["#00e87a", "#ffffff", "#8b5cf6"] });
    });
  }, [reduced, report.totalMonthlySavings]);

  if (report.toolResults.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-[900px] items-center justify-center px-6 sm:px-12">
        <div className="rounded-xl border-[0.5px] border-[#1e1e1e] bg-[#111] p-8 text-center">
          <h1 className="text-[18px] font-medium text-white">Add at least one AI tool to run an audit</h1>
          <p className="mt-3 text-[12px] leading-[1.6] text-[#aaa]">The audit needs one enabled tool to calculate spend and savings.</p>
          <Link className="mt-6 inline-flex rounded-lg bg-[#00e87a] px-5 py-3 text-[13px] font-semibold text-black" href="/#spend-form">
            Back to audit form
          </Link>
        </div>
      </section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-[900px] px-6 sm:px-12">
      <div className="border-b-[0.5px] border-[#1a1a1a] py-3">
        <Link href="/#spend-form" className="inline-flex items-center gap-[6px] text-[12px] text-[#666] transition-colors hover:text-[#aaa]">
          ← Edit inputs
        </Link>
      </div>

      <section className="w-full rounded-none border-b-[0.5px] border-[#1a3326] bg-gradient-to-b from-[#0d1f18] to-[#0a0a0a] px-6 pb-7 pt-8 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#00e87a]/75">Monthly savings opportunity</p>
        <h1 className="mt-3 text-[34px] font-medium text-[#00e87a] lg:text-[48px]">
          <CountUp value={report.totalMonthlySavings} />
        </h1>
        <p className="mt-2 text-[14px] text-[#777]">
          That&apos;s <span className="font-medium text-[#ccc]">{formatDollars(report.totalAnnualSavings)}/year</span> left on the table
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-[12px] text-[#777]">Spend health:</span>
          <span className="h-1 w-20 rounded-sm bg-[#1a1a1a]">
            <motion.span
              className="block h-full rounded-sm"
              style={{ backgroundColor: score.color }}
              initial={reduced ? false : { width: 0 }}
              animate={{ width: `${report.healthScore}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </span>
          <span className="text-[13px] font-semibold" style={{ color: score.color }}>
            {report.healthScore} / 100
          </span>
        </div>
      </section>

      <section className="border-y-[0.5px] border-[#1a1a1a] px-6 py-[18px]">
        <div className="mb-3 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.1em] text-[#555]">
          <span className="h-[5px] w-[5px] rounded-full bg-[#8b5cf6]" aria-hidden="true" />
          AI-generated summary
        </div>
        {summaryLoading ? (
          <div className="space-y-2" aria-label="Loading AI summary">
            <div className="audit-pulse h-3 w-full rounded bg-[#1a1a1a]" />
            <div className="audit-pulse h-3 w-full rounded bg-[#1a1a1a]" />
            <div className="audit-pulse h-3 w-[70%] rounded bg-[#1a1a1a]" />
          </div>
        ) : (
          <p className="max-w-[600px] text-[13px] italic leading-[1.75] text-[#888]">{summary}</p>
        )}
      </section>

      <section className="px-6 pb-5 pt-6">
        <p className="mb-4 pt-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#555]">Per-tool breakdown</p>
        <div className="space-y-2">
          {report.toolResults.map((tool, index) => {
            const style = cardTone(tool.status);
            const annual = tool.estimatedSavings * 12;
            const validZeroSpendPlan = ["Free", "Hobby", "Pro"].includes(tool.planName ?? "");
            const showPlanMissing = tool.currentSpend === 0 && !validZeroSpendPlan;
            return (
              <motion.article
                key={tool.toolId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className={cn("w-full rounded-lg border-[0.5px] border-l-[3px] px-[14px] py-3", style.wrap)}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[14px] font-medium text-[#eee]">{tool.toolName}</h2>
                  {showPlanMissing ? (
                    <p className="text-[12px] text-[#f59e0b]">Plan not selected</p>
                  ) : (
                    <p className="text-[13px] text-[#777]">{formatDollars(tool.currentSpend)}/mo</p>
                  )}
                </div>
                <p className={cn("mt-2 text-[12px] font-medium", style.color)}>
                  {style.prefix} {style.action} {tool.status === "optimal" ? "- keep" : `- ${tool.recommendation}`}
                </p>
                {tool.estimatedSavings > 0 ? (
                  <p className={cn("mt-2 text-[12px] font-semibold", style.save)}>
                    Save {formatDollars(tool.estimatedSavings)}/mo &middot; {formatDollars(annual)}/yr
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] leading-[1.55] text-[#666]">{tool.reason}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      {report.totalMonthlySavings > 200 ? (
        <section className="mx-6 mb-5 flex flex-col gap-4 rounded-lg border-[0.5px] border-[#1a4030] bg-[#0d1f18] px-4 py-[14px] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#00e87a]/80">Credex partner savings{report.totalMonthlySavings > 500 ? " · High-value account" : ""}</p>
            <h2 className="mt-1 text-[15px] font-medium text-white">Get an additional 15-30% off</h2>
            <p className="mt-1 text-[12px] text-[#888]">Discounted credits for tools you already use</p>
          </div>
          <a
            href="#lead-capture"
            className={cn(
              "rounded-md bg-[#00e87a] text-center font-semibold text-black",
              report.totalMonthlySavings > 500 ? "px-5 py-[10px] text-[13px]" : "px-[14px] py-2 text-[11px]"
            )}
          >
            Book a call &rarr;
          </a>
        </section>
      ) : report.totalMonthlySavings < 100 ? (
        <section className="mx-6 mb-5 rounded-lg border-[0.5px] border-[#1a2a20] bg-[#0a0f0d] px-4 py-[14px]">
          <h2 className="text-[13px] font-medium text-[#aaa]">You&apos;re spending well. Your AI stack looks optimized.</h2>
          <p className="mt-1 text-[11px] text-[#666]">Sign up below - we&apos;ll alert you when better options appear.</p>
        </section>
      ) : null}

      <section id="lead-capture" className="border-t-[0.5px] border-[#1a1a1a] px-6 py-5">
        <LeadCapture input={input} report={report} summary={summary || report.summary} />
      </section>
    </motion.section>
  );
}
