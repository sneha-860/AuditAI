import type { CompanyStage, Plan, PrimaryUseCase, Tool, ToolId } from "@/types";

export const ACCENT_GREEN = "#00e87a";

type PlanPricing = {
  monthly: number | null;
  annualMonthly: number | null;
};

export const PRICING = {
  cursor: {
    hobby: { monthly: 0, annualMonthly: 0 },
    pro: { monthly: 20, annualMonthly: 16 },
    business: { monthly: 40, annualMonthly: 40 },
    enterprise: { monthly: null, annualMonthly: null }
  },
  "github-copilot": {
    individual: { monthly: 10, annualMonthly: 8.33 },
    business: { monthly: 19, annualMonthly: 19 },
    enterprise: { monthly: 39, annualMonthly: 39 }
  },
  claude: {
    free: { monthly: 0, annualMonthly: 0 },
    pro: { monthly: 20, annualMonthly: 16.67 },
    max: { monthly: 100, annualMonthly: 100 },
    team: { monthly: 30, annualMonthly: 25 },
    enterprise: { monthly: 20, annualMonthly: 20 },
    "api-direct": { monthly: null, annualMonthly: null }
  },
  chatgpt: {
    plus: { monthly: 20, annualMonthly: 20 },
    pro: { monthly: 200, annualMonthly: 200 },
    team: { monthly: 30, annualMonthly: 25 },
    business: { monthly: 30, annualMonthly: 25 },
    enterprise: { monthly: null, annualMonthly: null },
    "api-direct": { monthly: null, annualMonthly: null }
  },
  "anthropic-api": {
    "monthly-spend": { monthly: null, annualMonthly: null }
  },
  "openai-api": {
    "monthly-spend": { monthly: null, annualMonthly: null }
  },
  gemini: {
    pro: { monthly: 0, annualMonthly: 0 },
    "ai-pro": { monthly: 19.99, annualMonthly: 19.99 },
    ultra: { monthly: 249.99, annualMonthly: 249.99 },
    api: { monthly: null, annualMonthly: null }
  },
  windsurf: {
    free: { monthly: 0, annualMonthly: 0 },
    pro: { monthly: 20, annualMonthly: 20 },
    max: { monthly: 200, annualMonthly: 200 },
    teams: { monthly: 40, annualMonthly: 40 },
    enterprise: { monthly: null, annualMonthly: null }
  }
} satisfies Record<ToolId, Record<string, PlanPricing>>;

export const TOOL_CAPABILITIES = {
  cursor: {
    strengths: ["coding", "autocomplete", "agentic editing", "IDE workflow"],
    weaknesses: ["writing", "research", "general chat"]
  },
  "github-copilot": {
    strengths: ["coding", "autocomplete", "GitHub workflow", "pull request assistance"],
    weaknesses: ["writing", "research", "non-GitHub workflows"]
  },
  claude: {
    strengths: ["writing", "research", "long-form analysis", "coding explanation"],
    weaknesses: ["IDE autocomplete", "native spreadsheet workflows"]
  },
  chatgpt: {
    strengths: ["writing", "data analysis", "mixed workflows", "general productivity"],
    weaknesses: ["IDE-native coding", "very long-form drafting"]
  },
  "anthropic-api": {
    strengths: ["API", "long-context apps", "agentic workloads", "research products"],
    weaknesses: ["seat-based collaboration", "nontechnical users"]
  },
  "openai-api": {
    strengths: ["API", "agentic apps", "data analysis products", "multimodal workflows"],
    weaknesses: ["seat-based collaboration", "nontechnical users"]
  },
  gemini: {
    strengths: ["workspace", "research", "Google apps", "multimodal workflows"],
    weaknesses: ["IDE autocomplete", "developer seat management"]
  },
  windsurf: {
    strengths: ["coding", "agentic editing", "autocomplete", "budget coding workflows"],
    weaknesses: ["writing", "research", "non-IDE work"]
  }
} satisfies Record<ToolId, { strengths: string[]; weaknesses: string[] }>;

function pricingFor(toolId: ToolId, planId: string): PlanPricing {
  const toolPricing = PRICING[toolId] as Record<string, PlanPricing>;
  return toolPricing[planId] ?? Object.values(toolPricing)[0];
}

function plan(toolId: ToolId, id: string, name: string, billingModel: Plan["billingModel"], description?: string): Plan {
  const price = pricingFor(toolId, id);

  return {
    id,
    name,
    monthlyPrice: price.monthly,
    annualMonthly: price.annualMonthly,
    billingModel,
    description
  };
}

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    shortName: "Cursor",
    category: "coding",
    plans: [
      plan("cursor", "hobby", "Hobby", "free"),
      plan("cursor", "pro", "Pro", "per-seat"),
      plan("cursor", "business", "Business", "per-seat"),
      plan("cursor", "enterprise", "Enterprise", "custom", "Custom pricing; estimate manually if known.")
    ]
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    shortName: "Copilot",
    category: "coding",
    plans: [
      plan("github-copilot", "individual", "Individual", "per-seat"),
      plan("github-copilot", "business", "Business", "per-seat"),
      plan("github-copilot", "enterprise", "Enterprise", "per-seat")
    ]
  },
  {
    id: "claude",
    name: "Claude",
    shortName: "Claude",
    category: "assistant",
    plans: [
      plan("claude", "free", "Free", "free"),
      plan("claude", "pro", "Pro", "per-seat"),
      plan("claude", "max", "Max", "per-seat"),
      plan("claude", "team", "Team", "per-seat"),
      plan("claude", "enterprise", "Enterprise", "custom", "Self-serve Enterprise lists a platform seat plus usage billing; edit spend if needed."),
      plan("claude", "api-direct", "API Direct", "api")
    ]
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    shortName: "ChatGPT",
    category: "assistant",
    plans: [
      plan("chatgpt", "plus", "Plus", "per-seat"),
      plan("chatgpt", "team", "Business", "per-seat", "OpenAI now presents this tier as Business; stored as team for compatibility."),
      plan("chatgpt", "enterprise", "Enterprise", "custom"),
      plan("chatgpt", "api-direct", "API Direct", "api")
    ]
  },
  {
    id: "anthropic-api",
    name: "Anthropic API Direct",
    shortName: "Anthropic API",
    category: "api",
    plans: [plan("anthropic-api", "monthly-spend", "Monthly spend", "api")]
  },
  {
    id: "openai-api",
    name: "OpenAI API Direct",
    shortName: "OpenAI API",
    category: "api",
    plans: [plan("openai-api", "monthly-spend", "Monthly spend", "api")]
  },
  {
    id: "gemini",
    name: "Gemini",
    shortName: "Gemini",
    category: "workspace",
    plans: [
      plan("gemini", "pro", "Pro", "included", "Included with eligible Google Workspace / Google account access."),
      plan("gemini", "ultra", "Ultra", "per-seat"),
      plan("gemini", "api", "API", "api")
    ]
  },
  {
    id: "windsurf",
    name: "Windsurf",
    shortName: "Windsurf",
    category: "coding",
    plans: [
      plan("windsurf", "free", "Free", "free"),
      plan("windsurf", "pro", "Pro", "per-seat"),
      plan("windsurf", "teams", "Teams", "per-seat")
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
  const foundPlan = TOOL_MAP[toolId].plans.find((candidate) => candidate.id === planId);
  return foundPlan ?? TOOL_MAP[toolId].plans[0];
}

export function getPlanMonthlyPrice(toolId: ToolId, planId: string): number | null {
  return pricingFor(toolId, planId).monthly;
}

export function calculateMonthlySpend(toolId: ToolId, planId: string, seats: number): number {
  const monthly = getPlanMonthlyPrice(toolId, planId);

  if (monthly === null) {
    return 0;
  }

  return Number((monthly * Math.max(1, seats)).toFixed(2));
}
