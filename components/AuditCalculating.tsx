"use client";

import { useEffect, useState } from "react";

const MIN_DISPLAY_MS = 800;
const PHASE_INTERVAL_MS = 250;

const PHASES = [
  "Analyzing your AI stack...",
  "Checking for tool overlaps...",
  "Calculating your savings..."
];

type AuditCalculatingProps = {
  onComplete: () => void;
};

export function AuditCalculating({ onComplete }: AuditCalculatingProps) {
  const [phase, setPhase] = useState(0);
  const [progressStarted, setProgressStarted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setProgressStarted(true));
    const phaseTimers = PHASES.slice(1).map((_, index) =>
      window.setTimeout(() => setPhase(index + 1), PHASE_INTERVAL_MS * (index + 1))
    );
    const completeTimer = window.setTimeout(onComplete, MIN_DISPLAY_MS);

    return () => {
      window.cancelAnimationFrame(frame);
      phaseTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col items-center justify-center px-6 text-center sm:px-12">
      <div className="w-full rounded-lg border-[0.5px] border-[#1e1e1e] bg-[#111] px-5 py-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-[0.5px] border-[#1a4030] bg-[#0d1f18] text-[22px] text-[#00e87a] animate-pulse">
          ✦
        </div>

        <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#00e87a]/80">Running audit</p>
        <h1 className="mt-3 min-h-[32px] text-[22px] font-medium text-white">{PHASES[phase]}</h1>

        <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#1a1a1a]" aria-label="Audit progress">
          <div
            className="h-full rounded-full bg-[#00e87a] transition-[width] duration-[800ms] ease-out"
            style={{ width: progressStarted ? "100%" : "0%" }}
          />
        </div>
      </div>
    </section>
  );
}
