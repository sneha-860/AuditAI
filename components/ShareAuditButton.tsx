"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function ShareAuditButton({ title, text }: { title: string; text: string }) {
  const [label, setLabel] = useState("Share");

  async function shareAudit() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setLabel("Copied");
      window.setTimeout(() => setLabel("Share"), 1600);
    } catch {
      setLabel("Unable to share");
      window.setTimeout(() => setLabel("Share"), 1600);
    }
  }

  return (
    <button
      type="button"
      onClick={shareAudit}
      className="inline-flex items-center justify-center rounded-md border-[0.5px] border-[#2a2a2a] bg-[#111] px-3 py-[7px] text-[11px] text-[#777] transition hover:bg-[#161616]"
      aria-label="Share this audit"
    >
      <Share2 className="mr-2 h-3 w-3" aria-hidden="true" />
      {label}
    </button>
  );
}
