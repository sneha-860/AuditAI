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
  annualMonthly?: number | null;
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
  planName?: string;
  currentSpend: number;
  recommendedSpend: number;
  estimatedSavings: number;
  recommendation: string;
  status?: "optimal" | "minor" | "action";
  reason?: string;
}

export type RecommendationCategory =
  | "plan-fit"
  | "redundancy"
  | "alternative"
  | "credits"
  | "usage"
  | "status";

export type RecommendationConfidence = "high" | "medium" | "low";

export interface AuditRecommendation {
  id: string;
  category: RecommendationCategory;
  toolIds: ToolId[];
  title: string;
  action: string;
  currentCost: number;
  recommendedCost: number;
  monthlySavings: number;
  annualSavings: number;
  confidence: RecommendationConfidence;
  reason: string;
  severity: "good" | "minor" | "action";
}

export interface CreditsOpportunity {
  eligible: boolean;
  prominent: boolean;
  tools: string[];
  message: string;
}

export interface AuditReport {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  healthScore: number;
  toolResults: ToolResult[];
  recommendations: AuditRecommendation[];
  creditsOpportunity?: CreditsOpportunity;
  summary: string;
}

export type AuditResult = AuditReport;

export interface Lead {
  id?: string;
  email: string;
  companyName?: string;
  name?: string;
  role?: string;
  teamSize?: number;
  auditInput: AuditInput;
  auditResult?: AuditResult;
  auditData?: AuditReport;
  shareToken?: string;
  shareUrl?: string;
  createdAt?: string;
}
