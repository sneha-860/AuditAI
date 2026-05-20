"use client";

import { AuditCalculating } from "@/components/AuditCalculating";
import { AuditResults } from "@/components/AuditResults";
import { useAuditResultsStore } from "@/store/auditStore";

export default function AuditPage() {
  const status = useAuditResultsStore((state) => state.status);
  const completeAudit = useAuditResultsStore((state) => state.completeAudit);

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a] text-foreground">
      {status === "calculating" ? <AuditCalculating onComplete={completeAudit} /> : <AuditResults />}
    </main>
  );
}
