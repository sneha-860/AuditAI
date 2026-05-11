import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import { getSharedAuditReport } from "@/lib/sharedAudit";
import type { AuditReport } from "@/types";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630
};

function dollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function countOptimizations(report: AuditReport): number {
  return report.recommendations.filter((recommendation) => recommendation.monthlySavings > 0).length;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const report = await getSharedAuditReport(token);

  if (!report) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#f5f5f5",
            fontFamily: "Inter, Arial, sans-serif",
            padding: 72
          }}
        >
          <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 500 }}>AuditAI</div>
          <div style={{ marginTop: 32, fontSize: 68, fontWeight: 500 }}>Run your own audit</div>
          <div style={{ marginTop: 20, color: "#444444", fontSize: 30 }}>credex.rocks</div>
        </div>
      ),
      size
    );
  }

  const optimizations = countOptimizations(report);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "Inter, Arial, sans-serif",
          padding: 64
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 500 }}>AuditAI</div>
          <div style={{ color: "#444444", fontSize: 14, fontWeight: 400 }}>credex.rocks</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ color: "#00e87a", opacity: 0.75, fontSize: 14, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Potential savings</div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#00e87a", fontSize: 80, fontWeight: 500, letterSpacing: 0 }}>{dollars(report.totalMonthlySavings)}</span>
            <span style={{ color: "#555555", fontSize: 32, fontWeight: 400, marginLeft: 12 }}>/month</span>
          </div>
          <div style={{ marginTop: 8, color: "#444444", fontSize: 24, fontWeight: 400 }}>
            ({dollars(report.totalAnnualSavings)}/year)
          </div>
          <div
            style={{
              marginTop: 30,
              border: "0.5px solid #1e1e1e",
              background: "#111111",
              borderRadius: 999,
              color: "#aaaaaa",
              padding: "10px 18px",
              fontSize: 18,
              fontWeight: 400,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: report.healthScore > 70 ? "#22c55e" : report.healthScore > 40 ? "#f59e0b" : "#ef4444" }} />
            Spend health: {report.healthScore}/100
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", color: "#444444", fontSize: 16, fontWeight: 400 }}>
          {report.toolResults.length} tools audited · {optimizations} optimizations found
        </div>
      </div>
    ),
    size
  );
}
