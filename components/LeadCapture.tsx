"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditStore } from "@/lib/store";
import type { AuditInput, AuditReport } from "@/types";

const ROLES = ["Founder/CEO", "CTO/Engineering Lead", "Engineering Manager", "Developer", "Finance/Ops", "Other"];

export function LeadCapture({ input, report, summary }: { input: AuditInput; report: AuditReport; summary: string }) {
  const markLeadCaptureVisible = useAuditStore((state) => state.markLeadCaptureVisible);
  const getLeadCaptureVisibleForMs = useAuditStore((state) => state.getLeadCaptureVisibleForMs);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("Founder/CEO");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy Link");
  const isHighSavings = report.totalMonthlySavings > 200;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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
        body: JSON.stringify({ email, companyName, role, website, visibleForMs: getLeadCaptureVisibleForMs(), input, report: { ...report, summary } })
      });
      const data = (await response.json()) as { error?: string; shareUrl?: string | null };
      if (!response.ok) {
        setError(data.error ?? "Unable to send your report. Please try again.");
        return;
      }
      setSubmitted(true);
      setShareUrl(data.shareUrl ?? "");
    } catch {
      setError("Unable to send your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    const absoluteUrl = `${window.location.origin}${shareUrl}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setCopyLabel("Copied ✓");
    window.setTimeout(() => setCopyLabel("Copy Link"), 2000);
  }

  if (submitted) {
    const absoluteUrl = shareUrl && typeof window !== "undefined" ? `${window.location.origin}${shareUrl}` : "";
    return (
      <div className="mx-auto max-w-[860px] px-6 pb-16 text-center sm:px-12">
        <CheckCircle2 className="mx-auto h-8 w-8 text-[#00e87a]" aria-hidden="true" />
        <p className="sr-only">Report sent</p>
        <h2 className="mt-3 text-[14px] font-medium text-white">Report sent to {email}</h2>
        <p className="mt-2 text-[12px] text-[#888]">Check your inbox in the next few minutes.</p>
        {shareUrl ? (
          <div className="mt-5 text-left">
            <p className="mb-2 text-[12px] font-medium text-white">Share your audit</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="share-url" className="sr-only">
                Shareable audit URL
              </label>
              <input
                id="share-url"
                readOnly
                value={absoluteUrl}
                className="h-[46px] flex-1 rounded-lg border-[0.5px] border-[#222] bg-[#111] px-4 font-mono text-[13px] text-[#ccc]"
              />
              <button type="button" onClick={copyLink} className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg border-[0.5px] border-[#2a2a2a] bg-[#111] px-4 text-[12px] text-[#777] transition-colors hover:bg-[#161616]">
                <Copy className="h-3 w-3" aria-hidden="true" />
                {copyLabel}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submitLead} className="mx-auto max-w-[860px] px-6 pb-16 sm:px-12">
      <div>
        <h2 className="mb-2 text-[22px] font-medium text-white">Get this report by email</h2>
        <p className="mb-6 text-[14px] leading-[1.55] text-[#777]">We&apos;ll alert you when better options appear for your stack.</p>
        {isHighSavings ? <p className="-mt-4 mb-5 text-[13px] text-[#00e87a]/85">A Credex advisor will reach out within 24hrs about discounted credits.</p> : null}
      </div>

      <label htmlFor="lead-email" className="sr-only">
        Email
      </label>
      <input
        id="lead-email"
        type="email"
        required
        placeholder="work@email.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mb-[10px] h-[46px] w-full rounded-lg border-[0.5px] border-[#222] bg-[#111] px-4 text-[14px] text-[#ccc] transition-colors placeholder:text-[#444] focus:border-[#00e87a]"
      />

      <div className="mb-[10px] grid gap-[10px] sm:grid-cols-2">
        <label htmlFor="lead-company" className="sr-only">
          Company
        </label>
        <input
          id="lead-company"
          type="text"
          placeholder="Company name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          className="h-[46px] w-full rounded-lg border-[0.5px] border-[#222] bg-[#111] px-4 text-[14px] text-[#ccc] transition-colors placeholder:text-[#444] focus:border-[#00e87a]"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="Role" className="h-[46px] rounded-lg border-[0.5px] border-[#222] bg-[#111] px-4 text-[14px] text-[#ccc] transition-colors focus:border-[#00e87a]">
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

      <label htmlFor="website" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }} aria-hidden="true">
        Website
      </label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
        aria-hidden="true"
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border-[0.5px] border-[#1a1a1a] bg-[#0d0d0d] px-[14px] py-[10px] text-[11px] text-[#555]">
        <Lock className="h-3 w-3 shrink-0 text-[#444]" aria-hidden="true" />
        No spam. Unsubscribe anytime. Identifying details stripped from public links.
      </div>

      {error ? <p className="mb-[10px] rounded-md border-[0.5px] border-[#3d1515] bg-[#110a0a] px-3 py-2 text-[12px] text-[#ef4444]">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting || !isEmailValid}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00e87a] p-[15px] text-[15px] font-semibold tracking-[0.01em] text-black transition-all duration-150 ease-in-out hover:-translate-y-px hover:bg-[#00d470] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Sending..." : "Send My Report →"}
      </button>
    </form>
  );
}
