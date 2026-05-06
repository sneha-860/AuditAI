import type { CompanyStage, Plan, PrimaryUseCase, Tool, ToolId } from "@/types";

export const ACCENT_GREEN = "#00ff88";

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    shortName: "Cursor",
    category: "coding",
    plans: [
      { id: "hobby", name: "Hobby", monthlyPrice: 0, billingModel: "free" },
      { id: "pro", name: "Pro", monthlyPrice: 20, billingModel: "per-seat" },
      { id: "business", name: "Business", monthlyPrice: 40, billingModel: "per-seat" },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPrice: 40,
        billingModel: "custom",
        description: "Estimated at Business pricing until custom terms are known."
      }
    ]
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    shortName: "Copilot",
    category: "coding",
    plans: [
      { id: "individual", name: "Individual", monthlyPrice: 10, billingModel: "per-seat" },
      { id: "business", name: "Business", monthlyPrice: 19, billingModel: "per-seat" },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 39, billingModel: "per-seat" }
    ]
  },
  {
    id: "claude",
    name: "Claude",
    shortName: "Claude",
    category: "assistant",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingModel: "free" },
      { id: "pro", name: "Pro", monthlyPrice: 20, billingModel: "per-seat" },
      { id: "max", name: "Max", monthlyPrice: 100, billingModel: "per-seat" },
      { id: "team", name: "Team", monthlyPrice: 30, billingModel: "per-seat" },
      { id: "enterprise", name: "Enterprise", monthlyPrice: null, billingModel: "custom" },
      { id: "api-direct", name: "API Direct", monthlyPrice: null, billingModel: "api" }
    ]
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    shortName: "ChatGPT",
    category: "assistant",
    plans: [
      { id: "plus", name: "Plus", monthlyPrice: 20, billingModel: "per-seat" },
      { id: "team", name: "Team", monthlyPrice: 30, billingModel: "per-seat" },
      { id: "enterprise", name: "Enterprise", monthlyPrice: null, billingModel: "custom" },
      { id: "api-direct", name: "API Direct", monthlyPrice: null, billingModel: "api" }
    ]
  },
  {
    id: "anthropic-api",
    name: "Anthropic API Direct",
    shortName: "Anthropic API",
    category: "api",
    plans: [{ id: "monthly-spend", name: "Monthly spend", monthlyPrice: null, billingModel: "api" }]
  },
  {
    id: "openai-api",
    name: "OpenAI API Direct",
    shortName: "OpenAI API",
    category: "api",
    plans: [{ id: "monthly-spend", name: "Monthly spend", monthlyPrice: null, billingModel: "api" }]
  },
  {
    id: "gemini",
    name: "Gemini",
    shortName: "Gemini",
    category: "workspace",
    plans: [
      { id: "pro", name: "Pro", monthlyPrice: 0, billingModel: "included", description: "Included with Workspace" },
      { id: "ultra", name: "Ultra", monthlyPrice: 19.99, billingModel: "per-seat" },
      { id: "api", name: "API", monthlyPrice: null, billingModel: "api" }
    ]
  },
  {
    id: "windsurf",
    name: "Windsurf",
    shortName: "Windsurf",
    category: "coding",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingModel: "free" },
      { id: "pro", name: "Pro", monthlyPrice: 15, billingModel: "per-seat" },
      { id: "teams", name: "Teams", monthlyPrice: 35, billingModel: "per-seat" }
    ]
  }
];

export const TOOL_MAP = TOOLS.reduce<Record<ToolId, Tool>>((acc, tool) => {
  acc[tool.id] = tool;
  return acc;
}, {} as Record<ToolId, Tool>);

export const PRIMARY_USE_CASES: PrimaryUseCase[] = ["Coding", "Writing", "Data Analysis", "Research", "Mixed"];

export const COMPANY_STAGES: CompanyStage[] = [
  "Solo/Freelance",
  "Early Startup (2-10)",
  "Growth (11-50)",
  "Scale (51+)"
];

export function getPlan(toolId: ToolId, planId: string): Plan {
  const plan = TOOL_MAP[toolId].plans.find((candidate) => candidate.id === planId);
  if (!plan) {
    return TOOL_MAP[toolId].plans[0];
  }

  return plan;
}

export function calculateMonthlySpend(toolId: ToolId, planId: string, seats: number): number {
  const plan = getPlan(toolId, planId);

  if (plan.monthlyPrice === null) {
    return 0;
  }

  return Number((plan.monthlyPrice * Math.max(1, seats)).toFixed(2));
}
