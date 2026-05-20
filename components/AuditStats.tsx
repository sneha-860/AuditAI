"use client";

import { useEffect, useState } from "react";
import { getAuditStats, type AuditStats as StoredAuditStats } from "@/lib/auditStats";

interface AnimatedAuditStats {
  count: number;
  totalSavings: number;
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function AuditStats() {
  const [stats, setStats] = useState<StoredAuditStats>({ count: 0, totalSavings: 0, avgSavings: 0 });
  const [animatedStats, setAnimatedStats] = useState<AnimatedAuditStats>({ count: 0, totalSavings: 0 });

  useEffect(() => {
    const nextStats = getAuditStats();

    let animationFrame = 0;
    const startedAt = performance.now();
    const durationMs = 800;

    function animateFrame(now: number): void {
      setStats(nextStats);

      if (nextStats.count === 0) {
        return;
      }

      const progress = Math.min(1, (now - startedAt) / durationMs);
      const easedProgress = easeOutCubic(progress);

      setAnimatedStats({
        count: Math.round(nextStats.count * easedProgress),
        totalSavings: Math.round(nextStats.totalSavings * easedProgress)
      });

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animateFrame);
      }
    }

    animationFrame = window.requestAnimationFrame(animateFrame);

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  if (stats.count === 0) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-[#666]">
        <span>Free</span>
        <span className="text-[16px] text-[#444]" aria-hidden="true">&middot;</span>
        <span>No signup</span>
        <span className="text-[16px] text-[#444]" aria-hidden="true">&middot;</span>
        <span>Instant results</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13px]">
      <span>
        <span className="font-medium text-[#ccc]">{animatedStats.count.toLocaleString("en-US")}</span>
        <span className="text-[#666]"> audits run</span>
      </span>
      <span className="text-[16px] text-[#444]" aria-hidden="true">&middot;</span>
      <span>
        <span className="font-medium text-[#ccc]">{money.format(animatedStats.totalSavings)}</span>
        <span className="text-[#666]"> in savings found</span>
      </span>
    </div>
  );
}
