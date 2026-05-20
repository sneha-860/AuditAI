import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "180px",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f"
        }}
      >
        <div
          style={{
            width: "142px",
            height: "142px",
            borderRadius: "999px",
            background: "#111b15",
            border: "2px solid #1f3d2f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 42px rgba(0, 232, 122, 0.22)"
          }}
        >
          <span
            style={{
              color: "#00e87a",
              fontSize: "58px",
              fontWeight: 850,
              letterSpacing: "-0.04em",
              lineHeight: 1
            }}
          >
            AI
          </span>
        </div>
      </div>
    ),
    size
  );
}
