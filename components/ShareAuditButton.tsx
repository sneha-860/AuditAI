"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Button type="button" variant="secondary" onClick={shareAudit} className="border border-white/10" aria-label="Share this audit">
      <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
