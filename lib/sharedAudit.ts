import { kv } from "@vercel/kv";
import type { AuditReport } from "@/types";

export async function getSharedAuditReport(token: string): Promise<AuditReport | null> {
  if (!token) {
    return null;
  }

  const report = await kv.get<AuditReport>(token);
  if (!report) {
    return null;
  }

  return report;
}
