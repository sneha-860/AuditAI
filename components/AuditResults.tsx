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
  if (score < 40) return { color: "#ef4444" };
  if (score < 70) return { color: "#f59e0b" };
  return { color: "#22c55e" };
}

function cardTone(status: ToolResult["status"]) {
  if (status === "action") return { accent: "#ef4444", action: "Drop", prefix: "→", actionColor: "text-[#f87171]", save: "text-[#ef4444]" };
  if (status === "minor") return { accent: "#f59e0b", action: "Change", prefix: "→", actionColor: "text-[#fbbf24]", save: "text-[#f59e0b]" };
  return { accent: "#22c55e", action: "Optimal", prefix: "✓", actionColor: "text-[#4ade80]", save: "text-[#22c55e]" };
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
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-[900px]">
      <div className="flex items-center justify-between border-b-[0.5px] border-[#1a1a1a] px-6 py-[14px] sm:px-12">
        <Link href="/#spend-form" className="text-[13px] text-[#555] no-underline transition-colors duration-150 hover:text-[#aaa]">
          ← Edit inputs
        </Link>
        <span className="text-[12px] text-[#444]">Audit results</span>
      </div>

      <section className="w-full border-b-[0.5px] border-[#1a3326] bg-[linear-gradient(180deg,#0c1f16_0%,#080808_100%)] px-6 py-12 text-center sm:px-12 sm:pb-11 sm:pt-[52px]">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#00e87a]/75">Monthly savings opportunity</p>
        <h1 className="mb-3 mt-3 text-[56px] font-semibold leading-none tracking-[-2px] text-[#00e87a] sm:text-[80px]">
          <CountUp value={report.totalMonthlySavings} />
        </h1>
        <p className="mb-5 text-[15px] text-[#666]">
          That&apos;s <span className="font-medium text-[#ccc]">{formatDollars(report.totalAnnualSavings)}/year</span> left on the table
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[12px] text-[#777]">Spend health:</span>
          <span className="h-[5px] w-[120px] rounded-[3px] bg-[#1a1a1a]">
            <motion.span
              className="block h-full rounded-[3px]"
              style={{ backgroundColor: score.color }}
              initial={reduced ? false : { width: 0 }}
              animate={{ width: `${report.healthScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </span>
          <span className="text-[13px] font-semibold" style={{ color: score.color }}>
            {report.healthScore} / 100
          </span>
        </div>
      </section>

      <section className="border-b-[0.5px] border-[#1a1a1a] px-6 py-6 sm:px-12">
        <div className="mb-3 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.12em] text-[#666]">
          <span className="h-[6px] w-[6px] rounded-full bg-[#8b5cf6]" aria-hidden="true" />
          AI-generated summary
        </div>
        {summaryLoading ? (
          <div className="space-y-2" aria-label="Loading AI summary">
            <div className="audit-pulse h-3 w-full rounded bg-[#1a1a1a]" />
            <div className="audit-pulse h-3 w-full rounded bg-[#1a1a1a]" />
            <div className="audit-pulse h-3 w-[70%] rounded bg-[#1a1a1a]" />
          </div>
        ) : (
          <p className="max-w-[680px] text-[13px] italic leading-[1.7] text-[#bbb]">{summary}</p>
        )}
      </section>

      <section className="flex flex-col gap-[10px] px-6 pb-8 pt-6 sm:px-12">
        <p className="mb-[6px] text-[10px] font-medium uppercase tracking-[0.1em] text-[#666]">Per-tool breakdown</p>
        {report.toolResults.map((tool, index) => (
          <ToolCard key={tool.toolId} tool={tool} index={index} />
        ))}
      </section>

      {report.totalMonthlySavings > 200 ? (
        <section className="mx-6 mb-5 flex flex-col gap-4 rounded-[10px] border-[0.5px] border-[#1a4030] bg-[#0d1f18] px-5 py-5 sm:mx-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#00e87a]/80">Credex partner savings{report.totalMonthlySavings > 500 ? " · High-value account" : ""}</p>
            <h2 className="mt-1 text-[15px] font-medium text-white">Get an additional 15-30% off</h2>
            <p className="mt-1 text-[12px] text-[#888]">Discounted credits for tools you already use</p>
          </div>
          <a
            href="#lead-capture"
            className={cn(
              "rounded-md bg-[#00e87a] text-center font-semibold text-black transition-all duration-150 ease-in-out hover:-translate-y-px hover:bg-[#00d470]",
              report.totalMonthlySavings > 500 ? "px-5 py-[10px] text-[13px]" : "px-[14px] py-2 text-[11px]"
            )}
          >
            Book a call &rarr;
          </a>
        </section>
      ) : report.totalMonthlySavings < 100 ? (
        <section className="relative mx-6 mb-5 overflow-hidden rounded-[10px] border-[0.5px] border-[#133322] bg-[#0a110d] px-6 py-5 sm:mx-12">
          <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#22c55e]" aria-hidden="true" />
          <div className="flex items-start gap-[14px]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[0.5px] border-[#1a4030] bg-[#0f2a1e] text-[14px] text-[#4ade80]" aria-hidden="true">
              ✓
            </span>
            <div>
              <h2 className="mb-1 text-[15px] font-medium text-[#eee]">You&apos;re spending well.</h2>
              <p className="mb-[6px] text-[13px] text-[#4ade80]/80">Your AI stack looks optimized.</p>
              <p className="text-[12px] text-[#888]">Sign up below — we&apos;ll alert you when better options appear.</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-6 mb-10 mt-2 h-px bg-[linear-gradient(90deg,transparent_0%,#1e1e1e_20%,#1e1e1e_80%,transparent_100%)] sm:mx-12" />

      <section id="lead-capture">
        <LeadCapture input={input} report={report} summary={summary || report.summary} />
      </section>
    </motion.section>
  );
}

function ToolCard({ tool, index }: { tool: ToolResult; index: number }) {
  const style = cardTone(tool.status);
  const annual = tool.estimatedSavings * 12;
  const validZeroSpendPlan = ["Free", "Hobby", "Pro"].includes(tool.planName ?? "");
  const showPlanMissing = tool.currentSpend === 0 && !validZeroSpendPlan;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative w-full overflow-hidden rounded-[10px] border-[0.5px] border-[#1e1e1e] bg-[#0d0d0d] px-5 pb-4 pt-[18px] transition-colors duration-150 hover:border-[#2a2a2a]"
    >
      <span className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-[3px]" style={{ backgroundColor: style.accent }} aria-hidden="true" />
      <div className="mb-[10px] flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium text-[#eee]">{tool.toolName}</h2>
        {showPlanMissing ? (
          <p className="text-[13px] text-[#f59e0b]">Plan not selected</p>
        ) : (
          <p className="text-[13px] text-[#666]">{formatDollars(tool.currentSpend)}/mo</p>
        )}
      </div>
      <p className={cn("mb-[6px] text-[12px] font-medium", style.actionColor)}>
        {style.prefix} {style.action}
        <span className="font-normal text-[#999]"> — {tool.status === "optimal" ? "keep" : tool.recommendation}</span>
      </p>
      {tool.estimatedSavings > 0 ? (
        <p className={cn("mb-[10px] text-[13px] font-semibold", style.save)}>
          Save {formatDollars(tool.estimatedSavings)}/mo <span className="mx-[6px] text-[#444]">·</span> {formatDollars(annual)}/yr
        </p>
      ) : null}
      <p className="border-t-[0.5px] border-[#1a1a1a] pt-[10px] text-[11px] leading-[1.6] text-[#888]">{tool.reason}</p>
    </motion.article>
  );
}
