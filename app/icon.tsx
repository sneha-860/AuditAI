import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent"
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "999px",
            background: "#0f0f0f",
            border: "1px solid #1f3d2f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span
            style={{
              color: "#00e87a",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
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
