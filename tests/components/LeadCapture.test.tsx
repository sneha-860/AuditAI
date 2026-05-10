import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LeadCapture } from "@/components/LeadCapture";
import type { AuditInput, AuditReport, ToolId, ToolInput } from "@/types";

const TOOL_IDS: ToolId[] = [
  "cursor",
  "github-copilot",
  "claude",
  "chatgpt",
  "anthropic-api",
  "openai-api",
  "gemini",
  "windsurf"
];

function disabledTool(toolId: ToolId): ToolInput {
  return {
    toolId,
    enabled: false,
    planId: toolId === "github-copilot" ? "individual" : "free",
    seats: 1,
    monthlySpend: 0
  };
}

const input: AuditInput = {
  tools: Object.fromEntries(TOOL_IDS.map((toolId) => [toolId, disabledTool(toolId)])) as Record<ToolId, ToolInput>,
  totalTeamSize: 1,
  primaryUseCase: "Writing",
  companyStage: "Solo/Freelance"
};

const report: AuditReport = {
  totalMonthlySpend: 20,
  totalAnnualSpend: 240,
  totalMonthlySavings: 0,
  totalAnnualSavings: 0,
  isHighValue: false,
  healthScore: 100,
  toolResults: [
    {
      toolId: "claude",
      toolName: "Claude",
      planName: "Pro",
      currentSpend: 20,
      recommendedSpend: 20,
      estimatedSavings: 0,
      recommendation: "Stay. Good fit.",
      status: "optimal"
    }
  ],
  recommendations: [],
  summary: "Claude Pro is a good fit."
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LeadCapture", () => {
  test("Honeypot field is in DOM but not visible", () => {
    render(<LeadCapture input={input} report={report} summary={report.summary} />);

    const honeypot = screen.getByLabelText("Website");
    expect(honeypot).toBeInTheDocument();
    expect(honeypot.parentElement).toHaveClass("hidden");
    expect(honeypot.parentElement).toHaveAttribute("aria-hidden", "true");
  });

  test("Submit disabled until email is valid", async () => {
    const user = userEvent.setup();
    render(<LeadCapture input={input} report={report} summary={report.summary} />);

    const submit = screen.getByRole("button", { name: /send my report/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    expect(submit).toBeDisabled();

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "founder@example.com");
    expect(submit).toBeEnabled();
  });

  test("Success state shows share URL after mock API call", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, shareUrl: "/audit/share/test-token" })
    } as Response);

    render(<LeadCapture input={input} report={report} summary={report.summary} />);

    await user.type(screen.getByLabelText("Email"), "founder@example.com");
    await user.click(screen.getByRole("button", { name: /send my report/i }));

    expect(await screen.findByText("Report sent")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Shareable audit URL")).toHaveValue("/audit/share/test-token"));
  });
});
