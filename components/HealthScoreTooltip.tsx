"use client";

import { HelpCircle } from "lucide-react";

export function HealthScoreTooltip() {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="What the health score means"
        className="rounded-full text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]"
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="pointer-events-none absolute right-0 top-7 z-20 hidden w-64 rounded-md border border-white/10 bg-zinc-950 p-3 text-left text-xs leading-5 text-zinc-300 shadow-xl group-hover:block group-focus-within:block">
        The health score weighs plan fit, redundant tools, likely unused seats, and whether API usage is being bought efficiently.
      </span>
    </span>
  );
}
