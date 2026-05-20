"use client";

import { useCallback, useMemo } from "react";
import { getPlanMonthlyPrice } from "@/lib/pricing";
import type { AuditInput, ToolInput } from "@/types";

export type AuditValidationErrors = {
  tools?: string;
  teamSize?: string;
};

type AuditValidationResult = {
  errors: AuditValidationErrors;
  hasAnySelectedTool: boolean;
  hasOnlyFreeTools: boolean;
  isValid: boolean;
};

export function getAuditValidationResult(input: AuditInput): AuditValidationResult {
  const selectedTools = Object.values(input.tools).filter(isSelectedTool);
  const hasAnySelectedTool = selectedTools.length > 0;
  const hasPaidTool = selectedTools.some((tool) => getToolSpend(tool) > 0);
  const hasOnlyFreeTools = hasAnySelectedTool && !hasPaidTool;
  const errors: AuditValidationErrors = {};

  if (!hasAnySelectedTool) {
    errors.tools = "Select at least one paid tool to run your audit";
  }

  if (input.totalTeamSize <= 0) {
    errors.teamSize = "Enter your team size";
  }

  return {
    errors,
    hasAnySelectedTool,
    hasOnlyFreeTools,
    isValid: Object.keys(errors).length === 0
  };
}

export function useAuditValidation(input?: AuditInput) {
  const result = useMemo(() => (input ? getAuditValidationResult(input) : null), [input]);
  const validate = useCallback((nextInput: AuditInput): boolean => getAuditValidationResult(nextInput).isValid, []);

  return {
    isValid: result?.isValid ?? false,
    errors: result?.errors ?? {},
    hasOnlyFreeTools: result?.hasOnlyFreeTools ?? false,
    validate
  };
}

function isSelectedTool(tool: ToolInput): boolean {
  if (!tool.enabled) return false;

  const price = getPlanMonthlyPrice(tool.toolId, tool.planId);
  if (price === null) {
    return tool.monthlySpend > 0;
  }

  return tool.seats > 0;
}

function getToolSpend(tool: ToolInput): number {
  const price = getPlanMonthlyPrice(tool.toolId, tool.planId);

  if (price === null) {
    return Math.max(0, tool.monthlySpend);
  }

  return Math.max(0, price * Math.max(0, tool.seats));
}
