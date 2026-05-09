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

function compactAnnual(value: number): string {
  if (value >= 1000) {
    return `$${Math.round(value / 1000).toLocaleString("en-US")}k/year`;
  }

  return `${dollars(value)}/year`;
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
            background: "#0f0f0f",
            color: "#f5f5f5",
            fontFamily: "Inter, Arial, sans-serif",
            padding: 72
          }}
        >
          <div style={{ color: "#00ff88", fontSize: 34, fontWeight: 700 }}>AI Spend Audit</div>
          <div style={{ marginTop: 32, fontSize: 68, fontWeight: 800 }}>Run your own audit</div>
          <div style={{ marginTop: 20, color: "#a1a1aa", fontSize: 30 }}>credex.rocks</div>
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
          background: "#0f0f0f",
          color: "#f5f5f5",
          fontFamily: "Inter, Arial, sans-serif",
          padding: 64
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
          <div style={{ color: "#00ff88", fontWeight: 800 }}>AI Spend Audit</div>
          <div style={{ color: "#a1a1aa", fontWeight: 600 }}>credex.rocks</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ color: "#a1a1aa", fontSize: 30, fontWeight: 700 }}>Potential savings</div>
          <div style={{ marginTop: 18, color: "#00ff88", fontSize: 126, fontWeight: 900, letterSpacing: 0 }}>
            Save {dollars(report.totalMonthlySavings)}/mo
          </div>
          <div style={{ marginTop: 8, color: "#f5f5f5", fontSize: 42, fontWeight: 700 }}>
            ({compactAnnual(report.totalAnnualSavings)})
          </div>
          <div
            style={{
              marginTop: 30,
              border: "2px solid rgba(0,255,136,0.45)",
              background: "rgba(0,255,136,0.12)",
              borderRadius: 12,
              color: "#00ff88",
              padding: "12px 22px",
              fontSize: 30,
              fontWeight: 800
            }}
          >
            Health score {report.healthScore}/100
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", color: "#d4d4d8", fontSize: 32, fontWeight: 700 }}>
          {report.toolResults.length} tools audited · {optimizations} optimizations found
        </div>
      </div>
    ),
    size
  );
}
