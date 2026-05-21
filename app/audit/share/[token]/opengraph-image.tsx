import { ImageResponse } from "next/og";
import { getSharedAuditReport } from "@/lib/sharedAudit";
import { getSiteHost } from "@/lib/siteUrl";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

type SharedAuditImageProps = {
  params: Promise<{ token: string }>;
};

export default async function Image({ params }: SharedAuditImageProps) {
  const { token } = await params;
  const report = await getSharedAuditReport(token);
  const monthlySavings = Math.round(report?.totalMonthlySavings ?? 0);
  const annualSavings = monthlySavings * 12;
  const toolsAudited = report?.toolResults.length ?? 0;
  const siteHost = getSiteHost();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#0f0f0f",
          color: "#ffffff",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "46px 58px"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 78% 18%, rgba(0, 232, 122, 0.2), transparent 34%)"
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#00e87a",
                boxShadow: "0 0 24px rgba(0, 232, 122, 0.55)"
              }}
            />
            <div style={{ fontSize: 28, fontWeight: 700 }}>AuditAI</div>
          </div>
          <div style={{ fontSize: 22, color: "#666666" }}>{siteHost}</div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 58,
            zIndex: 1
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
            <div style={{ fontSize: 26, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00e87a", fontWeight: 700 }}>
              Personalized audit result
            </div>
            <div style={{ marginTop: 22, fontSize: 108, lineHeight: 0.95, color: "#00e87a", fontWeight: 850 }}>
              ${monthlySavings.toLocaleString()}
              <span style={{ fontSize: 46, color: "#b8b8b8" }}>/mo</span>
            </div>
            <div style={{ marginTop: 24, fontSize: 38, lineHeight: 1.25, color: "#ffffff", fontWeight: 750 }}>
              potential savings found
            </div>
            <div style={{ marginTop: 16, fontSize: 26, color: "#8f8f8f" }}>
              ${annualSavings.toLocaleString()}/year across {toolsAudited} AI tools
            </div>
          </div>

          <div
            style={{
              width: 330,
              border: "1px solid #243529",
              borderRadius: 24,
              background: "#111b15",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 18
            }}
          >
            <div style={{ fontSize: 22, color: "#8f8f8f" }}>Audit highlights</div>
            <Metric label="Monthly" value={`$${monthlySavings.toLocaleString()}`} />
            <Metric label="Annual" value={`$${annualSavings.toLocaleString()}`} />
            <Metric label="Tools" value={String(toolsAudited)} />
          </div>
        </div>
      </div>
    ),
    size
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        height: 72,
        border: "1px solid #262626",
        borderRadius: 14,
        background: "#0d0d0d",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px"
      }}
    >
      <div style={{ fontSize: 20, color: "#8f8f8f" }}>{label}</div>
      <div style={{ fontSize: 28, color: "#ffffff", fontWeight: 800 }}>{value}</div>
    </div>
  );
}
