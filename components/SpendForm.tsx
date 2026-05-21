"use client";

import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bot, Braces, Github, Keyboard, Loader2, MessageCircle, Sparkles, Waves, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuditValidation } from "@/hooks/useAuditValidation";
import { cn } from "@/lib/utils";
import { calculateMonthlySpend, COMPANY_STAGES, PRIMARY_USE_CASES, TOOLS, getPlan } from "@/lib/pricing";
import { useAuditStore } from "@/lib/store";
import { useAuditResultsStore } from "@/store/auditStore";
import type { AuditInput, ToolId, ToolInput } from "@/types";

const ICONS: Record<ToolId, string> = {
  cursor: "",
  "github-copilot": "◎",
  claude: "*",
  chatgpt: "◯",
  "anthropic-api": "⚡",
  "openai-api": "⚡",
  gemini: "✦",
  windsurf: "≋"
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function numberFromInput(value: string): number {
  return value.trim() === "" ? 0 : Number(value);
}

function toolIcon(toolId: ToolId): React.ReactNode {
  switch (toolId) {
    case "cursor":
      return <Keyboard className="h-4 w-4" />;
    case "github-copilot":
      return <Github className="h-4 w-4" />;
    case "claude":
      return <MessageCircle className="h-4 w-4" />;
    case "chatgpt":
      return <Bot className="h-4 w-4" />;
    case "anthropic-api":
      return <Zap className="h-4 w-4" />;
    case "openai-api":
      return <Braces className="h-4 w-4" />;
    case "gemini":
      return <Sparkles className="h-4 w-4" />;
    case "windsurf":
      return <Waves className="h-4 w-4" />;
  }
}

export function SpendForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [shakeTools, setShakeTools] = useState(false);
  const toolSelectorRef = useRef<HTMLDivElement>(null);
  const {
    tools,
    totalTeamSize,
    primaryUseCase,
    companyStage,
    setToolEnabled,
    setToolPlan,
    setToolSeats,
    setToolMonthlySpend,
    setAuditInput,
    setTotalTeamSize,
    setPrimaryUseCase,
    setCompanyStage
  } = useAuditStore();
  const runAudit = useAuditResultsStore((state) => state.runAudit);
  const auditInput = useMemo(
    () => ({ tools, totalTeamSize, primaryUseCase, companyStage }),
    [tools, totalTeamSize, primaryUseCase, companyStage]
  );
  const { isValid, errors, hasOnlyFreeTools, validate } = useAuditValidation(auditInput);

  const enabledTools = useMemo(() => Object.values(tools).filter((tool) => tool.enabled), [tools]);
  const totalMonthlySpend = enabledTools.reduce((sum, tool) => sum + tool.monthlySpend, 0);

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate(auditInput)) {
      setSubmitting(false);
      setHasAttemptedSubmit(true);

      if (errors.tools) {
        toolSelectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setShakeTools(false);
        window.setTimeout(() => setShakeTools(true), 0);
        window.setTimeout(() => setShakeTools(false), 400);
      }

      return;
    }

    setSubmitting(true);
    try {
      runAudit(auditInput);
      router.push("/audit");
    } catch {
      setSubmitting(false);
    }
  }

  function tryExampleStartup() {
    const exampleInput = createExampleAuditInput(auditInput);

    setSubmitting(true);
    try {
      setAuditInput(exampleInput);
      runAudit(exampleInput);
      router.push("/audit");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <form id="spend-form" onSubmit={submitForm} className="mx-auto w-full max-w-[920px] scroll-mt-24 rounded-lg border-[0.5px] border-[#252525] bg-[#101010] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b-[0.5px] border-[#242424] pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#00e87a]">60-second audit</p>
          <h3 className="mt-2 text-[18px] font-semibold text-white">Select your AI tools</h3>
        </div>
        <p className="text-[13px] text-[#777]">
          Current total: <span className="text-[15px] font-semibold text-[#00e87a]">{money.format(totalMonthlySpend)}</span><span className="text-[13px] text-[#555]">/mo</span>
        </p>
      </div>

      <div className="mb-2 hidden items-center gap-3 border-b-[0.5px] border-[#202020] px-4 pb-2 min-[720px]:flex">
        <span className="w-9 shrink-0" />
        <span className="w-7 shrink-0" />
        <span className="w-[140px] shrink-0 text-[9px] uppercase tracking-[0.1em] text-[#666]">Tool</span>
        <span className="min-w-0 flex-1 text-[9px] uppercase tracking-[0.1em] text-[#666]">Plan</span>
        <span className="w-[52px] shrink-0 text-center text-[9px] uppercase tracking-[0.1em] text-[#666]">Seats</span>
        <span className="w-[60px] shrink-0 text-right text-[9px] uppercase tracking-[0.1em] text-[#666]">$/mo</span>
      </div>

      <div
        ref={toolSelectorRef}
        className={cn(
          "space-y-2 rounded-lg transition",
          hasAttemptedSubmit && errors.tools && "border border-[#ef4444] p-2 shadow-[0_0_0_1px_rgba(239,68,68,0.35)]",
          shakeTools && "audit-shake"
        )}
      >
        {TOOLS.map((tool) => {
          const state = tools[tool.id];
          const selectedPlan = getPlan(tool.id, state.planId);
          const isApiOnly = tool.category === "api" || selectedPlan.billingModel === "api";
          const spendInputId = `${tool.id}-monthly-spend`;
          const seatsInputId = `${tool.id}-seats`;

          return (
            <div
              key={tool.id}
              className={cn(
                "min-h-[56px] overflow-hidden rounded-lg px-4 py-3 transition",
                state.enabled
                  ? "border border-[#1a4030] bg-[#0b1c14] shadow-[inset_0_0_0_1px_#0d2a1e]"
                  : "border-[0.5px] border-[#242424] bg-[#141414]"
              )}
            >
              <div className="flex w-full flex-row items-center gap-3 min-[380px]:min-w-[640px] max-[379px]:flex-col max-[379px]:items-stretch">
                <Switch
                  checked={state.enabled}
                  onCheckedChange={(checked) => setToolEnabled(tool.id, checked)}
                  role="switch"
                  aria-checked={state.enabled}
                  aria-label={`Enable ${tool.name}`}
                  className="h-6 min-h-6 w-11 min-w-11 border-[0.5px] border-[#2a2a2a] bg-[#222] data-[state=checked]:border-[#00e87a] data-[state=checked]:bg-[#00e87a] max-[379px]:self-start [&>span]:h-5 [&>span]:w-5 [&>span]:bg-[#777] [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=checked]:bg-white"
                />
                <div className={cn("flex min-w-0 flex-1 flex-row items-center gap-3 max-[379px]:w-full max-[379px]:flex-col max-[379px]:items-stretch", !state.enabled && "[&_*]:pointer-events-none")}>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-[0.5px] border-[#242424] bg-[#1a1a1a] text-center text-[14px]", state.enabled ? "text-[#00e87a]" : "text-[#4a4a4a]")} aria-hidden="true">
                    {toolIcon(tool.id)}
                  </span>
                  <span className={cn("w-[140px] shrink-0 text-[14px] font-medium max-[379px]:w-full", state.enabled ? "text-white" : "text-[#aaa]")}>{tool.name}</span>

                  {isApiOnly ? (
                    <>
                      <span className="min-w-0 flex-1 max-[379px]:hidden" />
                      <label htmlFor={spendInputId} className="shrink-0 text-[11px] text-[#888] max-[379px]:w-full">
                        Monthly spend ($)
                      </label>
                      <input
                        id={spendInputId}
                        type="number"
                        min={0}
                        value={state.monthlySpend}
                        onChange={(event) => setToolMonthlySpend(tool.id, numberFromInput(event.target.value))}
                        disabled={!state.enabled}
                        className={cn(
                          "h-11 min-h-11 w-20 min-w-11 shrink-0 rounded-md border px-2 text-right text-[13px] max-[379px]:w-full max-[379px]:text-left",
                          state.enabled
                            ? "border-[#00e87a] bg-[#0f2a1e] font-medium text-[#00e87a]"
                            : "pointer-events-none border-[#161616] bg-[#111] text-[#2a2a2a]"
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <Select value={state.planId || tool.plans[0].id} onValueChange={(planId) => setToolPlan(tool.id, planId)} disabled={!state.enabled}>
                          <SelectTrigger
                            aria-label={`${tool.name} plan`}
                            className={cn(
                              "h-11 min-h-11 w-full rounded-md px-[10px] py-0 text-[12px]",
                              state.enabled
                                ? "border border-[#00e87a] bg-[#0f2a1e] font-medium text-[#00e87a]"
                                : "pointer-events-none border-[0.5px] border-[#161616] bg-[#1a1a1a] text-[#666] opacity-30"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tool.plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <label className="sr-only" htmlFor={seatsInputId}>
                        {tool.name} seats
                      </label>
                      <div className="flex w-[52px] shrink-0 items-center justify-center max-[379px]:w-full max-[379px]:justify-start">
                        <input
                          id={seatsInputId}
                          type="number"
                          min={1}
                          title={`${state.seats} seat${state.seats === 1 ? "" : "s"}`}
                          value={state.seats}
                          onChange={(event) => setToolSeats(tool.id, numberFromInput(event.target.value))}
                          disabled={!state.enabled}
                          className={cn(
                            "h-11 min-h-11 w-[52px] min-w-11 rounded-md px-1 text-center text-[12px] max-[379px]:w-full max-[379px]:text-left",
                            state.enabled
                              ? "border border-[#00e87a] bg-[#0f2a1e] font-medium text-[#00e87a]"
                              : "pointer-events-none border-[0.5px] border-[#161616] bg-[#1a1a1a] text-[#2a2a2a]"
                          )}
                        />
                      </div>
                      <div className="flex w-[60px] shrink-0 items-baseline justify-end max-[379px]:w-full max-[379px]:justify-start">
                        {state.enabled ? (
                          <>
                            <span className="text-[13px] font-semibold text-[#00e87a]">${Math.round(state.monthlySpend)}</span>
                            <span className="ml-[2px] text-[10px] text-[#666]">/mo</span>
                          </>
                        ) : (
                          <span className="text-[13px] text-[#2a2a2a]">—</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hasAttemptedSubmit && errors.tools ? <p className="mt-2 text-[12px] text-[#ef4444]">{errors.tools}</p> : null}
      {hasOnlyFreeTools ? (
        <div className="mt-3 rounded-md border-[0.5px] border-[#4a3511] bg-[#151106] px-3 py-2 text-[12px] text-[#fbbf24]">
          All your selected tools are free &mdash; add paid tools to find savings
        </div>
      ) : null}

      <div className="mt-8 border-t-[0.5px] border-[#1a1a1a] pt-3">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#777]">Your team</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label="Team size" htmlFor="team-size" error={errors.teamSize}>
            <input
              id="team-size"
              type="number"
              min={1}
              value={totalTeamSize === 0 ? "" : totalTeamSize}
              onChange={(event) => setTotalTeamSize(numberFromInput(event.target.value))}
              className="w-full bg-transparent text-[14px] text-[#aaa]"
            />
          </Field>
          <Field label="Primary use">
            <Select value={primaryUseCase} onValueChange={setPrimaryUseCase}>
              <SelectTrigger aria-label="Primary use" className="h-auto border-0 bg-transparent p-0 text-[14px] text-[#aaa]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_USE_CASES.map((useCase) => (
                  <SelectItem key={useCase} value={useCase}>
                    {useCase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Company stage">
            <Select value={companyStage} onValueChange={setCompanyStage}>
              <SelectTrigger aria-label="Company stage" className="h-auto border-0 bg-transparent p-0 text-[14px] text-[#aaa]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <span className="group relative block" title={!isValid ? "Select at least one tool" : undefined}>
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex min-h-11 min-w-11 w-full items-center justify-center gap-2 rounded-[10px] p-4 text-[15px] font-semibold transition",
              !submitting
                ? "bg-[#00e87a] text-black hover:brightness-110"
                : "cursor-not-allowed bg-[#2a2a2a] text-[#777]"
            )}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Analyzing..." : "Calculate My Savings"}
          </button>
          {hasAttemptedSubmit && !isValid ? (
            <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border-[0.5px] border-[#2a2a2a] bg-[#111] px-3 py-2 text-[11px] text-[#ddd] shadow-lg group-hover:block">
              Select at least one tool
            </span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={tryExampleStartup}
          disabled={submitting}
          className="min-h-11 min-w-11 rounded-[10px] border-[0.5px] border-[#2a2a2a] bg-[#111] px-5 py-4 text-[13px] font-medium text-[#ddd] transition hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Try with example startup &rarr;
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={cn("flex h-16 flex-col justify-center rounded-md border-[0.5px] bg-[#111] px-4 py-3", error ? "border-[#ef4444]" : "border-[#1e1e1e]")}>
        <span className="mb-1 block text-[10px] uppercase tracking-[0.08em] text-[#666]">{label}</span>
        {children}
      </label>
      {error ? <p className="mt-2 text-[12px] text-[#ef4444]">{error}</p> : null}
    </div>
  );
}

function createExampleAuditInput(current: AuditInput): AuditInput {
  const tools = TOOLS.reduce<Record<ToolId, ToolInput>>((acc, tool) => {
    acc[tool.id] = {
      ...current.tools[tool.id],
      toolId: tool.id,
      enabled: false,
      seats: 1,
      monthlySpend: calculateMonthlySpend(tool.id, current.tools[tool.id].planId, 1)
    };
    return acc;
  }, {} as Record<ToolId, ToolInput>);

  tools.cursor = paidTool("cursor", "pro", 5);
  tools.claude = paidTool("claude", "pro", 10);
  tools.chatgpt = paidTool("chatgpt", "plus", 10);
  tools["anthropic-api"] = {
    ...tools["anthropic-api"],
    enabled: true,
    planId: "monthly-spend",
    seats: 1,
    monthlySpend: 300
  };

  return {
    tools,
    totalTeamSize: 10,
    primaryUseCase: "Mixed",
    companyStage: "Growth (11-50)"
  };
}

function paidTool(toolId: ToolId, planId: string, seats: number): ToolInput {
  return {
    toolId,
    enabled: true,
    planId,
    seats,
    monthlySpend: calculateMonthlySpend(toolId, planId, seats),
    avgTokensMonthly: 0
  };
}
