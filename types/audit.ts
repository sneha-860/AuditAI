import type { ToolId } from "@/types";

export interface ToolSelection {
  toolId: ToolId | string;
  toolName?: string;
  planName?: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  tools: ToolSelection[];
  teamSize: number;
  primaryUse: string;
  companyStage: string;
}

export interface Recommendation {
  title: string;
  description: string;
  savingsPerMonth: number;
}

export interface ToolOverlap {
  tools: string[];
  description: string;
  savingsPerMonth: number;
}

export interface AuditResult {
  totalSpend: number;
  potentialSavings: number;
  recommendations: Recommendation[];
  overlaps: ToolOverlap[];
}
