"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmailReportForm } from "@/components/EmailReportForm";
import { formatDollars } from "@/lib/format";
import { useAuditResultsStore, type AuditResult } from "@/store/auditStore";
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
  const result = useAuditResultsStore((state) => state.result);
  const startOver = useAuditResultsStore((state) => state.startOver);
  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const emailAuditResult = useMemo(() => (result ? toEmailAuditResult(result) : null), [result]);

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
    <section className="mx-auto max-w-[900px] px-6 pb-14 pt-8 sm:px-12">
      <div className="rounded-lg border-[0.5px] border-[#1a4030] bg-[#0b1711] px-5 py-8 text-center sm:px-8 sm:py-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#00e87a]/75">Audit results</p>
        {result.savings > 0 ? (
          <h1 className="mx-auto mt-3 max-w-[720px] text-[36px] font-semibold leading-tight text-[#00e87a] sm:text-[58px]">
            You could save <CountUp value={result.savings} />
            <span className="block text-[22px] leading-tight sm:text-[34px]">/month</span>
          </h1>
        ) : (
          <h1 className="mx-auto mt-3 max-w-[640px] text-[30px] font-semibold leading-tight text-[#00e87a] sm:text-[46px]">No savings found - your stack looks optimised!</h1>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#111] p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#666]">Current spend</p>
          <p className="mt-3 text-[26px] font-semibold text-white">
            {formatDollars(result.totalSpend)}
            <span className="text-[15px] font-medium text-[#777]">/month across {result.toolCount} tools</span>
          </p>
        </article>

        <article className="rounded-lg border-[0.5px] border-[#1a4030] bg-[#0d1f18] p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#00e87a]/75">Annual savings</p>
          <p className="mt-3 text-[26px] font-semibold text-white">That&apos;s {formatDollars(result.annualSavings)}/year</p>
        </article>
      </div>

      {result.overlaps.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#777]">Overlap warnings</h2>
          <div className="mt-3 space-y-3">
            {result.overlaps.map((overlap) => (
              <article key={overlap.id} className="rounded-lg border-[0.5px] border-[#4a3511] bg-[#151106] p-4">
                <p className="text-[14px] font-medium text-[#fbbf24]">{overlap.message}</p>
                {overlap.monthlySaving > 0 ? <p className="mt-2 text-[12px] text-[#aaa]">Potential saving: {formatDollars(overlap.monthlySaving)}/month</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {result.recommendations.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#777]">Recommendations</h2>
          <div className="mt-3 divide-y divide-[#1a1a1a] overflow-hidden rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#111]">
            {result.recommendations.map((recommendation) => (
              <article key={`${recommendation.toolName}-${recommendation.action}`} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-[15px] font-medium text-white">{recommendation.toolName}</p>
                  <p className="mt-1 text-[12px] text-[#888]">{recommendation.action}</p>
                </div>
                <p className="text-[14px] font-semibold text-[#00e87a]">Save {formatDollars(recommendation.monthlySaving)}/month</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setShowEmailForm((current) => !current)} className="rounded-md bg-[#00e87a] px-4 py-3 text-[13px] font-semibold text-black transition hover:brightness-110">
          Send report to email
        </button>
        <button type="button" onClick={copyShareableLink} className="rounded-md border-[0.5px] border-[#2a2a2a] bg-[#111] px-4 py-3 text-[13px] font-medium text-[#ddd] transition hover:bg-[#161616]">
          {copied ? "Copied link" : "Copy shareable link"}
        </button>
        <button type="button" onClick={handleStartOver} className="rounded-md border-[0.5px] border-[#2a2a2a] bg-[#111] px-4 py-3 text-[13px] font-medium text-[#ddd] transition hover:bg-[#161616]">
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
