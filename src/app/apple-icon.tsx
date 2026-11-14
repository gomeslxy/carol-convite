import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #091230 0%, #172554 40%, #1E3A8A 75%, #2563EB 100%)",
          padding: "12px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "28px",
            border: "2.5px solid rgba(226, 232, 240, 0.78)",
            background: "radial-gradient(circle at 30% 22%, rgba(96, 165, 250, 0.28), transparent 65%)",
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              color: "#F8FAFC",
              lineHeight: 1,
              textShadow: "0 4px 12px rgba(9, 18, 48, 0.75)",
            }}
          >
            C
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.28em",
              color: "#CBD5E1",
              marginTop: "6px",
            }}
          >
            18
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

