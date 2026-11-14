import { ImageResponse } from "next/og";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";

export const alt = `${EVENT.name} — ${EVENT.age} Anos • 17 de Julho às ${FORMATTED_EVENT_DATE.time}`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #070E24 0%, #172554 36%, #1E3A8A 68%, #0F172A 100%)",
          padding: "36px",
          position: "relative",
        }}
      >
        {/* Brilho acetinado central sutil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 50% 35%, rgba(59, 130, 246, 0.24) 0%, rgba(30, 58, 138, 0.08) 45%, transparent 75%)",
          }}
        />

        {/* Moldura externa prateada */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            padding: "10px",
            borderRadius: "24px",
            border: "1.5px solid rgba(226, 232, 240, 0.45)",
          }}
        >
          {/* Moldura interna prateada */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              border: "1px solid rgba(203, 213, 225, 0.28)",
              background: "linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(23, 37, 84, 0.45) 100%)",
              padding: "40px 64px",
              textAlign: "center",
            }}
          >
            {/* Laço minimalista em fita acetinada prateada */}
            <svg
              width="92"
              height="48"
              viewBox="0 0 120 64"
              fill="none"
              style={{ marginBottom: "18px" }}
            >
              <defs>
                <linearGradient id="ogSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F8FAFC" />
                  <stop offset="45%" stopColor="#CBD5E1" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>
              </defs>
              {/* Caudas do laço */}
              <path
                d="M56 32 L34 58 L45 55 L58 36 Z"
                fill="url(#ogSilver)"
                opacity="0.9"
              />
              <path
                d="M64 32 L86 58 L75 55 L62 36 Z"
                fill="url(#ogSilver)"
                opacity="0.9"
              />
              {/* Alça esquerda */}
              <path
                d="M56 30 C40 10, 10 12, 12 28 C14 42, 40 38, 56 32 Z"
                fill="url(#ogSilver)"
              />
              {/* Alça direita */}
              <path
                d="M64 30 C80 10, 110 12, 108 28 C106 42, 80 38, 64 32 Z"
                fill="url(#ogSilver)"
              />
              {/* Nó central */}
              <rect x="53" y="24" width="14" height="14" rx="5" fill="#F8FAFC" />
            </svg>

            {/* Sobretítulo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.34em",
                color: "#CBD5E1",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#E2E8F0">
                <path d="M12 0 L14.8 9.2 L24 12 L14.8 14.8 L12 24 L9.2 14.8 L0 12 L9.2 9.2 Z" />
              </svg>
              <span>CONVITE OFICIAL</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#E2E8F0">
                <path d="M12 0 L14.8 9.2 L24 12 L14.8 14.8 L12 24 L9.2 14.8 L0 12 L9.2 9.2 Z" />
              </svg>
            </div>

            {/* Nome principal */}
            <div
              style={{
                display: "flex",
                fontSize: 96,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                color: "#F8FAFC",
                lineHeight: 1.05,
                letterSpacing: "0.04em",
                textShadow: "0 6px 24px rgba(7, 14, 36, 0.7)",
              }}
            >
              {EVENT.name}
            </div>

            {/* Subtítulo elegante com data e horário */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "20px",
                padding: "14px 36px",
                borderRadius: "999px",
                border: "1px solid rgba(226, 232, 240, 0.45)",
                background: "rgba(15, 23, 42, 0.42)",
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: "0.06em",
                color: "#F1F5F9",
              }}
            >
              {`${EVENT.name} — ${EVENT.age} Anos • 17 de Julho às ${FORMATTED_EVENT_DATE.time}`}
            </div>

            {/* Rodapé com domínio */}
            <div
              style={{
                display: "flex",
                marginTop: "28px",
                fontSize: 18,
                letterSpacing: "0.24em",
                color: "#94A3B8",
                textTransform: "uppercase",
              }}
            >
              convitecarol.site
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

