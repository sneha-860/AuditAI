"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditStore } from "@/lib/store";
import type { AuditInput, AuditReport } from "@/types";

const ROLES = ["Founder/CEO", "CTO/Engineering Lead", "Engineering Manager", "Developer", "Finance/Ops", "Other"];

export function LeadCapture({
  input,
  report,
  summary
}: {
  input: AuditInput;
  report: AuditReport;
  summary: string;
}) {
  const markLeadCaptureVisible = useAuditStore((state) => state.markLeadCaptureVisible);
  const getLeadCaptureVisibleForMs = useAuditStore((state) => state.getLeadCaptureVisibleForMs);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("Founder/CEO");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy Link");
  const isHighSavings = report.totalMonthlySavings > 500;

  useEffect(() => {
    markLeadCaptureVisible();
  }, [markLeadCaptureVisible]);

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          companyName,
          role,
          website,
          visibleForMs: getLeadCaptureVisibleForMs(),
          input,
          report: {
            ...report,
            summary
          }
        })
      });
      const data = (await response.json()) as { error?: string; shareUrl?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to send your report. Please try again.");
        return;
      }

      setShareUrl(data.shareUrl ?? "");
    } catch {
      setError("Unable to send your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) {
      return;
    }

    const absoluteUrl = `${window.location.origin}${shareUrl}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy Link"), 1600);
  }

  if (shareUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-[#00ff88]/35 bg-[#00ff88]/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#00ff88]" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-white">Report sent</h3>
            <p className="mt-1 text-sm text-zinc-300">Your shareable audit link is ready.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input readOnly value={shareUrl} aria-label="Shareable audit URL" />
          <Button type="button" onClick={copyLink} className="bg-[#00ff88] text-black hover:bg-[#00e67a]">
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            {copyLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submitLead} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Get this report by email</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          We&apos;ll also notify you when better options for your stack appear.
          {isHighSavings ? " A Credex advisor will also reach out about discounted credits." : ""}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          type="email"
          required
          placeholder="work@email.com"
          aria-label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          type="text"
          placeholder="Company name"
          aria-label="Company name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="Role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((roleOption) => (
              <SelectItem key={roleOption} value={roleOption}>
                {roleOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {error ? <p className="rounded-md border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      <Button type="submit" disabled={submitting} className="w-full bg-[#00ff88] text-black hover:bg-[#00e67a] sm:w-auto">
        {submitting ? "Sending..." : "Send My Report"}
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
