import { calculateAudit } from "@/lib/auditEngine";
import type { AuditInput } from "@/types";

export function AuditResults({ input }: { input: AuditInput }) {
  const result = calculateAudit(input);

  return (
    <section className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-3xl font-semibold">Your AI spend audit</h1>
      <p className="text-muted-foreground">
        Estimated savings: <span className="font-semibold text-primary">${result.estimatedMonthlySavings}/mo</span>
      </p>
    </section>
  );
}
