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
    <main id="main-content" className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <AuditResults input={auditInput} />
    </main>
  );
}
