"use client";

import { useMemo } from "react";
import { AuditResults } from "@/components/AuditResults";
import { LeadCapture } from "@/components/LeadCapture";
import { ShareCard } from "@/components/ShareCard";
import { Card, CardContent } from "@/components/ui/card";
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
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <AuditResults input={auditInput} />
        <Card className="border-white/10 bg-white/[0.04]">
          <CardContent className="space-y-4 p-5">
            <LeadCapture />
            <ShareCard />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
