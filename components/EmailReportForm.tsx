"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { AuditResult } from "@/types/audit";

interface EmailReportFormProps {
  auditResult: AuditResult;
}

interface SendReportResponse {
  success?: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailReportForm({ auditResult }: EmailReportFormProps) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEmailValid = EMAIL_PATTERN.test(email.trim());

  async function submitReport(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, auditResult })
      });
      const data = (await response.json()) as SendReportResponse;

      if (!response.ok || !data.success) {
        setError(data.error ?? "Unable to send your report. Please try again.");
        return;
      }

      setSentTo(email.trim());
    } catch {
      setError("Unable to send your report. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div className="mx-auto max-w-[860px] px-6 pb-16 text-center sm:px-12">
        <CheckCircle2 className="mx-auto h-8 w-8 text-[#00e87a]" aria-hidden="true" />
        <h2 className="mt-3 text-[14px] font-medium text-white">Report sent to {sentTo}!</h2>
        <p className="mt-2 text-[12px] text-[#888]">Check your inbox in the next few minutes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submitReport} className="mx-auto max-w-[860px] px-6 pb-16 sm:px-12">
      <div>
        <h2 className="mb-2 text-[22px] font-medium text-white">Get a personalized report by email</h2>
        <p className="mb-6 text-[14px] leading-[1.55] text-[#777]">We&apos;ll send your AuditAI findings and top recommendations.</p>
      </div>

      <label htmlFor="report-email" className="sr-only">
        Email
      </label>
      <input
        id="report-email"
        type="email"
        required
        placeholder="work@email.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError("");
        }}
        className="mb-[10px] h-[46px] w-full rounded-lg border-[0.5px] border-[#222] bg-[#111] px-4 text-[14px] text-[#ccc] transition-colors placeholder:text-[#444] focus:border-[#00e87a]"
      />

      {error ? (
        <p className="mb-[10px] rounded-md border-[0.5px] border-[#3d1515] bg-[#110a0a] px-3 py-2 text-[12px] text-[#ef4444]">
          {error} You can retry below.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !isEmailValid}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00e87a] p-[15px] text-[15px] font-semibold tracking-[0.01em] text-black transition-all duration-150 ease-in-out hover:-translate-y-px hover:bg-[#00d470] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {loading ? "Sending..." : "Send my report"}
      </button>
    </form>
  );
}
