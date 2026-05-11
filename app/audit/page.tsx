"use client";

import { useMemo } from "react";
import { AuditResults } from "@/components/AuditResults";
import { useAuditStore } from "@/lib/store";

export default function AuditPage() {
  const tools = useAuditStore((state) => state.tools);
  const totalTeamSize = useAuditStore((state) => state.totalTeamSize);
  const primaryUseCase = useAuditStore((state) => state.primaryUseCase);
  const companyStage = useAuditStore((state) => state.companyStage);

  const auditInput = useMemo(
    () => ({
      tools,
      totalTeamSize,
      primaryUseCase,
      companyStage
    }),
    [tools, totalTeamSize, primaryUseCase, companyStage]
  );

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a] text-foreground">
      <AuditResults input={auditInput} />
    </main>
  );
}
