import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import type { AuditReport } from "@/types";

export default async function SharedAuditPage({ params }: { params: { token: string } }) {
  const report = await getSharedReport(params.token);

  if (!report) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-5">
        <Card className="overflow-hidden border-[#00ff88]/35 bg-[#00ff88]/10">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#00ff88]">Shared Credex audit</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">
              Potential savings: ${report.totalMonthlySavings}/mo
            </h1>
            <p className="mt-3 text-lg text-zinc-300">${report.totalAnnualSavings}/year identified</p>
            <p className="mt-5 max-w-3xl text-sm italic leading-7 text-zinc-300">{report.summary}</p>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {report.toolResults.map((tool) => (
            <Card key={tool.toolId} className="border-white/10 bg-white/[0.04]">
              <CardContent className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {tool.toolName} {tool.planName}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-300">{tool.recommendation}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{tool.reason}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-zinc-500">Savings</p>
                    <p className="text-2xl font-semibold text-[#00ff88]">${tool.estimatedSavings}/mo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

async function getSharedReport(token: string): Promise<AuditReport | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from("leads").select("audit_data").eq("share_token", token).single();

  if (error || !data?.audit_data) {
    return null;
  }

  return data.audit_data as AuditReport;
}
