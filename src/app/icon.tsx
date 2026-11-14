import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F172A 0%, #172554 38%, #1E3A8A 72%, #2563EB 100%)",
          borderRadius: "16px",
          padding: "4px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            border: "1.5px solid rgba(226, 232, 240, 0.72)",
            background: "radial-gradient(circle at 30% 25%, rgba(96, 165, 250, 0.25), transparent 65%)",
          }}
        >
          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              color: "#F8FAFC",
              lineHeight: 1,
              marginTop: "-2px",
              textShadow: "0 2px 6px rgba(15, 23, 42, 0.7)",
            }}
          >
            C
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

