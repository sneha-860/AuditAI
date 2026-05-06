export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export type BillingModel = "per-seat" | "included" | "custom" | "api" | "free";

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  billingModel: BillingModel;
  description?: string;
}

export interface Tool {
  id: ToolId;
  name: string;
  shortName: string;
  category: "coding" | "assistant" | "api" | "workspace";
  plans: Plan[];
}

export type PrimaryUseCase = "Coding" | "Writing" | "Data Analysis" | "Research" | "Mixed";

export type CompanyStage =
  | "Solo/Freelance"
  | "Early Startup (2-10)"
  | "Growth (11-50)"
  | "Scale (51+)";

export interface ToolInput {
  toolId: ToolId;
  enabled: boolean;
  planId: string;
  seats: number;
  monthlySpend: number;
  avgTokensMonthly?: number;
}

export interface AuditInput {
  tools: Record<ToolId, ToolInput>;
  totalTeamSize: number;
  primaryUseCase: PrimaryUseCase;
  companyStage: CompanyStage;
}

export interface ToolResult {
  toolId: ToolId;
  toolName: string;
  currentSpend: number;
  recommendedSpend: number;
  estimatedSavings: number;
  recommendation: string;
}

export interface AuditResult {
  totalMonthlySpend: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  toolResults: ToolResult[];
  summary: string;
}

export interface Lead {
  id?: string;
  email: string;
  companyName?: string;
  name?: string;
  auditInput: AuditInput;
  auditResult?: AuditResult;
  createdAt?: string;
}
