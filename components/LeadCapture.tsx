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
  const isHighSavings = report.totalMonthlySavings > 500;
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
      <div className="text-center">
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
                className="h-[38px] flex-1 rounded-md border-[0.5px] border-[#1e1e1e] bg-[#111] px-3 font-mono text-[11px] text-[#aaa]"
              />
              <button type="button" onClick={copyLink} className="inline-flex h-[38px] items-center justify-center gap-2 rounded-md border-[0.5px] border-[#2a2a2a] bg-[#111] px-3 text-[11px] text-[#777] hover:bg-[#161616]">
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
    <form onSubmit={submitLead} className="space-y-[14px]">
      <div>
        <h2 className="text-[17px] font-medium text-white">Get this report by email</h2>
        <p className="mt-2 text-[13px] text-[#888]">We&apos;ll alert you when better options appear for your stack.</p>
        {isHighSavings ? <p className="mt-2 text-[12px] text-[#00e87a]/85">A Credex advisor will reach out within 24hrs about discounted credits.</p> : null}
      </div>

      <div className="space-y-2">
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
          className="h-[38px] w-full rounded-md border-[0.5px] border-[#1e1e1e] bg-[#111] px-3 text-[13px] text-[#ccc] placeholder:text-[#444] focus:border-[#00e87a]"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <label htmlFor="lead-company" className="sr-only">
            Company
          </label>
          <input
            id="lead-company"
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="h-[38px] w-full rounded-md border-[0.5px] border-[#1e1e1e] bg-[#111] px-3 text-[13px] text-[#ccc] placeholder:text-[#444] focus:border-[#00e87a]"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger aria-label="Role" className="h-[38px] rounded-md border-[0.5px] border-[#1e1e1e] bg-[#111] px-3 text-[13px] text-[#ccc]">
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

      <div className="flex items-center gap-2 rounded-md border-[0.5px] border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2 text-[11px] text-[#555]">
        <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
        No spam. Unsubscribe anytime. Identifying details stripped from public links.
      </div>

      {error ? <p className="rounded-md border-[0.5px] border-[#3d1515] bg-[#110a0a] px-3 py-2 text-[12px] text-[#ef4444]">{error}</p> : null}

      <button type="submit" disabled={submitting || !isEmailValid} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00e87a] p-3 text-[14px] font-semibold text-black disabled:opacity-40">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Sending..." : "Send My Report →"}
      </button>
    </form>
  );
}
