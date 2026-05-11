import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const savings = searchParams.get("savings");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "48px",
            right: "48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#00e87a"
              }}
            />
            <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: 500 }}>AuditAI</span>
          </div>
          <span style={{ color: "#444444", fontSize: "16px" }}>credex.rocks</span>
        </div>

        <div
          style={{
            fontSize: "16px",
            color: "#00e87a",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "20px"
          }}
        >
          {savings ? "Monthly savings opportunity" : "AI Spend Audit"}
        </div>

        <div
          style={{
            fontSize: savings ? "120px" : "80px",
            fontWeight: 600,
            color: "#00e87a",
            lineHeight: 1,
            letterSpacing: 0
          }}
        >
          {savings ? `$${savings}` : "Save Money"}
        </div>

        {savings ? (
          <div style={{ fontSize: "28px", color: "#666666", marginTop: "16px" }}>per month on AI tools</div>
        ) : (
          <div
            style={{
              fontSize: "24px",
              color: "#666666",
              marginTop: "16px",
              maxWidth: "600px",
              textAlign: "center",
              lineHeight: 1.4
            }}
          >
            Free 60-second audit for your startup
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            gap: "32px"
          }}
        >
          <span style={{ fontSize: "16px", color: "#333333" }}>8 tools audited</span>
          <span style={{ fontSize: "16px", color: "#222222" }}>·</span>
          <span style={{ fontSize: "16px", color: "#333333" }}>Rules-based engine</span>
          <span style={{ fontSize: "16px", color: "#222222" }}>·</span>
          <span style={{ fontSize: "16px", color: "#333333" }}>No signup required</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
