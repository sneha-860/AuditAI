"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { COMPANY_STAGES, PRIMARY_USE_CASES, TOOLS, getPlan } from "@/lib/pricing";
import { useAuditStore } from "@/lib/store";
import type { ToolId } from "@/types";

type FieldErrors = Partial<Record<string, string>>;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

function numberFromInput(value: string): number {
  if (value.trim() === "") {
    return 0;
  }

  return Number(value);
}

function planLabel(toolId: ToolId, planId: string): string {
  const plan = getPlan(toolId, planId);

  if (plan.monthlyPrice === null) {
    return plan.description ? `${plan.name} · ${plan.description}` : plan.name;
  }

  if (plan.billingModel === "included") {
    return `${plan.name} · included`;
  }

  if (plan.monthlyPrice === 0) {
    return `${plan.name} · free`;
  }

  return `${plan.name} · ${currencyFormatter.format(plan.monthlyPrice)}/user/mo`;
}

export function SpendForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});

  const {
    tools,
    totalTeamSize,
    primaryUseCase,
    companyStage,
    setToolEnabled,
    setToolPlan,
    setToolSeats,
    setToolMonthlySpend,
    setToolAvgTokensMonthly,
    setTotalTeamSize,
    setPrimaryUseCase,
    setCompanyStage
  } = useAuditStore();

  const enabledTools = useMemo(() => Object.values(tools).filter((tool) => tool.enabled), [tools]);
  const totalMonthlySpend = enabledTools.reduce((sum, tool) => sum + tool.monthlySpend, 0);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (enabledTools.length === 0) {
      nextErrors.tools = "Enable at least one AI tool to calculate savings.";
    }

    Object.values(tools).forEach((tool) => {
      if (!tool.enabled) {
        return;
      }

      if (tool.seats < 1) {
        nextErrors[`${tool.toolId}.seats`] = "Seats must be at least 1.";
      }

      if (tool.monthlySpend < 0 || Number.isNaN(tool.monthlySpend)) {
        nextErrors[`${tool.toolId}.monthlySpend`] = "Monthly spend must be 0 or higher.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validate()) {
      router.push("/audit");
    }
  }

  return (
    <form id="spend-form" onSubmit={submitForm} className="mx-auto w-full max-w-6xl scroll-mt-8 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">60-second audit</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">Add your AI stack</h2>
        </div>
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Current total: <span className="font-semibold">{currencyFormatter.format(totalMonthlySpend)}/mo</span>
        </div>
      </div>

      {errors.tools ? <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{errors.tools}</p> : null}

      <div className="grid gap-4">
        {TOOLS.map((tool) => {
          const toolState = tools[tool.id];
          const selectedPlan = getPlan(tool.id, toolState.planId);
          const isManualSpend =
            selectedPlan.monthlyPrice === null ||
            selectedPlan.billingModel === "api" ||
            selectedPlan.billingModel === "custom";
          const showTokens = selectedPlan.billingModel === "api" || tool.category === "api";

          return (
            <Card
              key={tool.id}
              className={cn(
                "overflow-hidden border-white/10 bg-white/[0.035] transition-colors",
                toolState.enabled ? "shadow-[0_0_0_1px_rgba(0,255,136,0.12)]" : "opacity-55"
              )}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(160px,1.1fr)_minmax(180px,1.3fr)_110px_minmax(140px,0.9fr)] lg:items-start">
                  <div className="flex items-center justify-between gap-4 lg:justify-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <BadgeDollarSign className="h-4 w-4 text-primary" aria-hidden="true" />
                        <h3 className="text-base font-semibold text-foreground">{tool.name}</h3>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{tool.category}</p>
                    </div>
                    <Switch
                      checked={toolState.enabled}
                      onCheckedChange={(checked) => {
                        setToolEnabled(tool.id, checked);
                        setErrors((current) => ({ ...current, tools: undefined }));
                      }}
                      aria-label={`Enable ${tool.name}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor={`${tool.id}-plan`}>
                      Plan
                    </label>
                    <Select
                      value={toolState.planId}
                      onValueChange={(planId) => setToolPlan(tool.id, planId)}
                      disabled={!toolState.enabled}
                    >
                      <SelectTrigger id={`${tool.id}-plan`}>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {tool.plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {planLabel(tool.id, plan.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPlan.description ? <p className="text-xs text-muted-foreground">{selectedPlan.description}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor={`${tool.id}-seats`}>
                      Seats
                    </label>
                    <Input
                      id={`${tool.id}-seats`}
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={toolState.seats}
                      onChange={(event) => setToolSeats(tool.id, numberFromInput(event.target.value))}
                      disabled={!toolState.enabled}
                    />
                    {errors[`${tool.id}.seats`] ? <p className="text-xs text-destructive">{errors[`${tool.id}.seats`]}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor={`${tool.id}-spend`}>
                      Monthly spend
                    </label>
                    <Input
                      id={`${tool.id}-spend`}
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={toolState.monthlySpend}
                      onChange={(event) => setToolMonthlySpend(tool.id, numberFromInput(event.target.value))}
                      disabled={!toolState.enabled || !isManualSpend}
                    />
                    {errors[`${tool.id}.monthlySpend`] ? <p className="text-xs text-destructive">{errors[`${tool.id}.monthlySpend`]}</p> : null}
                  </div>
                </div>

                {showTokens ? (
                  <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:max-w-sm">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor={`${tool.id}-tokens`}>
                      Avg tokens/month
                    </label>
                    <Input
                      id={`${tool.id}-tokens`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={toolState.avgTokensMonthly ?? 0}
                      onChange={(event) => setToolAvgTokensMonthly(tool.id, numberFromInput(event.target.value))}
                      disabled={!toolState.enabled}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/10 bg-white/[0.045]">
        <CardHeader>
          <CardTitle>Company context</CardTitle>
          <CardDescription>Used to benchmark overlap, seat waste, and plan fit.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="team-size">
              Total team size
            </label>
            <Input
              id="team-size"
              type="number"
              min={1}
              value={totalTeamSize}
              onChange={(event) => setTotalTeamSize(numberFromInput(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Primary use case</label>
            <Select value={primaryUseCase} onValueChange={setPrimaryUseCase}>
              <SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Company stage</label>
            <Select value={companyStage} onValueChange={setCompanyStage}>
              <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-primary">🔒 No signup required. We show you savings first.</p>
        <Button type="submit" size="lg" className="w-full bg-[#00ff88] text-black hover:bg-[#00e67a] sm:w-auto">
          Calculate My Savings
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
