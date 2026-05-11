"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { COMPANY_STAGES, PRIMARY_USE_CASES, TOOLS, getPlan } from "@/lib/pricing";
import { useAuditStore } from "@/lib/store";
import type { ToolId } from "@/types";

type FieldErrors = Partial<Record<string, string>>;

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

export function SpendForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const {
    tools,
    totalTeamSize,
    primaryUseCase,
    companyStage,
    setToolEnabled,
    setToolPlan,
    setToolSeats,
    setToolMonthlySpend,
    setTotalTeamSize,
    setPrimaryUseCase,
    setCompanyStage
  } = useAuditStore();

  const enabledTools = useMemo(() => Object.values(tools).filter((tool) => tool.enabled), [tools]);
  const totalMonthlySpend = enabledTools.reduce((sum, tool) => sum + tool.monthlySpend, 0);

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enabledTools.length === 0) {
      setErrors({ tools: "Enable at least one AI tool to calculate savings." });
      return;
    }
    setSubmitting(true);
    router.push("/audit");
  }

  return (
    <form id="spend-form" onSubmit={submitForm} className="content-wrapper scroll-mt-24">
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b-[0.5px] border-[#1a1a1a] pb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#777]">60-second audit</p>
        <p className="text-[13px] text-[#777]">
          Current total: <span className="text-[15px] font-semibold text-[#00e87a]">{money.format(totalMonthlySpend)}</span><span className="text-[13px] text-[#555]">/mo</span>
        </p>
      </div>

      {errors.tools ? <p className="mb-3 rounded-md border-[0.5px] border-[#3d1515] bg-[#110a0a] px-3 py-2 text-[12px] text-[#ef4444]">{errors.tools}</p> : null}

      <div className="mb-2 hidden items-center gap-3 border-b-[0.5px] border-[#1a1a1a] px-4 pb-2 min-[720px]:flex">
        <span className="w-9 shrink-0" />
        <span className="w-7 shrink-0" />
        <span className="w-[140px] shrink-0 text-[9px] uppercase tracking-[0.1em] text-[#666]">Tool</span>
        <span className="min-w-0 flex-1 text-[9px] uppercase tracking-[0.1em] text-[#666]">Plan</span>
        <span className="w-[52px] shrink-0 text-center text-[9px] uppercase tracking-[0.1em] text-[#666]">Seats</span>
        <span className="w-[60px] shrink-0 text-right text-[9px] uppercase tracking-[0.1em] text-[#666]">$/mo</span>
      </div>

      <div className="space-y-2">
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
                "min-h-[52px] overflow-x-auto rounded-lg px-4 py-3 transition",
                state.enabled
                  ? "border border-[#1a4030] bg-[#0a1f15] shadow-[inset_0_0_0_1px_#0d2a1e]"
                  : "border-[0.5px] border-[#1e1e1e] bg-[#111]"
              )}
            >
              <div className="flex w-full min-w-[640px] flex-row items-center gap-3">
                <Switch
                  checked={state.enabled}
                  onCheckedChange={(checked) => {
                    setToolEnabled(tool.id, checked);
                    setErrors({});
                  }}
                  role="switch"
                  aria-checked={state.enabled}
                  aria-label={`Enable ${tool.name}`}
                  className="h-5 w-9 border-0 bg-[#222] data-[state=checked]:bg-[#00e87a] [&>span]:h-4 [&>span]:w-4 [&>span]:bg-[#555] [&>span]:data-[state=checked]:translate-x-4 [&>span]:data-[state=checked]:bg-white"
                />
                <div className={cn("flex min-w-0 flex-1 flex-row items-center gap-3", !state.enabled && "[&_*]:pointer-events-none")}>
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1a1a1a] text-center text-[14px]", state.enabled ? "text-[#00e87a]" : "text-[#333]")} aria-hidden="true">
                    {tool.id === "cursor" ? <Keyboard className="h-4 w-4" /> : ICONS[tool.id]}
                  </span>
                  <span className={cn("w-[140px] shrink-0 text-[14px] font-medium", state.enabled ? "text-white" : "text-[#aaa]")}>{tool.name}</span>

                  {isApiOnly ? (
                    <>
                      <span className="min-w-0 flex-1" />
                      <label htmlFor={spendInputId} className="shrink-0 text-[11px] text-[#888]">
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
                          "h-[34px] w-20 shrink-0 rounded-md border px-2 text-right text-[13px]",
                          state.enabled
                            ? "border-[#00e87a] bg-[#0f2a1e] font-medium text-[#00e87a]"
                            : "border-[#2a2a2a] bg-[#1a1a1a] text-[#666]"
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
                              "h-[34px] w-full rounded-md px-[10px] py-0 text-[12px]",
                              state.enabled
                                ? "border border-[#00e87a] bg-[#0f2a1e] font-medium text-[#00e87a]"
                                : "border-[0.5px] border-[#2a2a2a] bg-[#1a1a1a] text-[#666]"
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
                      <div className="flex w-[52px] shrink-0 items-center justify-center">
                        <input
                          id={seatsInputId}
                          type="number"
                          min={1}
                          title={`${state.seats} seat${state.seats === 1 ? "" : "s"}`}
                          value={state.seats}
                          onChange={(event) => setToolSeats(tool.id, numberFromInput(event.target.value))}
                          disabled={!state.enabled}
                          className={cn(
                            "h-[34px] w-[52px] rounded-md px-1 text-center text-[12px]",
                            state.enabled
                              ? "border border-[#00e87a] bg-[#0f2a1e] font-medium text-[#00e87a]"
                              : "border-[0.5px] border-[#2a2a2a] bg-[#1a1a1a] text-[#666]"
                          )}
                        />
                      </div>
                      <div className="flex w-[60px] shrink-0 items-baseline justify-end">
                        <span className={cn("text-[13px] font-medium", state.enabled ? "text-[#00e87a]" : "text-[#666]")}>
                          ${Math.round(state.monthlySpend)}
                        </span>
                        <span className="ml-[2px] text-[10px] text-[#666]">/mo</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t-[0.5px] border-[#1a1a1a] pt-3">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#777]">Your team</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label="Team size" htmlFor="team-size">
            <input id="team-size" type="number" min={1} value={totalTeamSize} onChange={(event) => setTotalTeamSize(numberFromInput(event.target.value))} className="w-full bg-transparent text-[14px] text-[#aaa]" />
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

      <button type="submit" disabled={enabledTools.length === 0 || submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#00e87a] p-4 text-[15px] font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Analyzing..." : "Calculate My Savings"}
      </button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex h-16 flex-col justify-center rounded-md border-[0.5px] border-[#1e1e1e] bg-[#111] px-4 py-3">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.08em] text-[#666]">{label}</span>
      {children}
    </label>
  );
}
