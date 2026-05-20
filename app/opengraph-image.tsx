import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#0f0f0f",
          color: "#ffffff",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 20% 10%, rgba(0, 232, 122, 0.18), transparent 32%)"
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 46,
            left: 58,
            display: "flex",
            alignItems: "center",
            gap: 14
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#00e87a",
              boxShadow: "0 0 24px rgba(0, 232, 122, 0.55)"
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 0 }}>AuditAI</div>
        </div>

        <div
          style={{
            width: "58%",
            padding: "140px 0 0 58px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1
          }}
        >
          <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 800, letterSpacing: 0, maxWidth: 650 }}>
            Stop Overpaying for AI Tools
          </div>
          <div style={{ marginTop: 28, fontSize: 30, lineHeight: 1.35, color: "#b8b8b8" }}>
            Free 60-second audit for startups
          </div>
        </div>

        <div
          style={{
            width: "42%",
            padding: "118px 58px 0 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            zIndex: 1
          }}
        >
          <div
            style={{
              border: "1px solid #243529",
              background: "#111b15",
              borderRadius: 22,
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 22,
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)"
            }}
          >
            <div style={{ fontSize: 46, lineHeight: 1, fontWeight: 800, color: "#00e87a" }}>
              $2,400/yr wasted →
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ToolRow label="✦ Cursor" />
              <ToolRow label="* Claude" />
              <ToolRow label="◎ Copilot" />
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 58,
            bottom: 42,
            fontSize: 22,
            color: "#666666"
          }}
        >
          auditai.vercel.app
        </div>
      </div>
    ),
    size
  );
}

function ToolRow({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #262626",
        borderRadius: 14,
        background: "#0d0d0d",
        padding: "0 18px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ fontSize: 25, color: "#e8e8e8", fontWeight: 650 }}>{label}</div>
      <div style={{ fontSize: 20, color: "#ef4444", fontWeight: 800 }}>×</div>
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: 28,
          height: 3,
          background: "#ef4444",
          transform: "rotate(-4deg)",
          opacity: 0.9
        }}
      />
    </div>
  );
}
