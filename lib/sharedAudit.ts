import { createClient } from "@supabase/supabase-js";
import type { AuditReport } from "@/types";

export function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://credex.rocks";
}

export async function getSharedAuditReport(token: string): Promise<AuditReport | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!token || !supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from("leads").select("audit_data").eq("share_token", token).single();

  if (error || !data?.audit_data) {
    return null;
  }

  return data.audit_data as AuditReport;
}
