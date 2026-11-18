import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";

/**
 * Banner social (Open Graph / Twitter) 1200×630 gerado no build a partir de `src/config/event.ts`.
 * Fonte única de verdade: data, horário (19:30), local e nome nunca ficam "assados" em PNG estático.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_ALT = `${EVENT.name} — ${EVENT.age} Anos • ${FORMATTED_EVENT_DATE.long} às ${FORMATTED_EVENT_DATE.time}`;

const CREST_PATH = join(process.cwd(), "public", "images", "brasao-barroco-c.png");

/** "Alameda ..., Indaiatuba - SP" → "Indaiatuba - SP" */
const venueCity = EVENT.venue.address.split(",").pop()?.trim() ?? "";

const CORNER_BASE = {
  position: "absolute",
  width: 30,
  height: 30,
  display: "flex",
} as const;

const CORNER_LINE = "2px solid rgba(226, 232, 240, 0.82)";

export async function renderOgImage(): Promise<ImageResponse> {
  const crestBase64 = (await readFile(CREST_PATH)).toString("base64");
  const crestSrc = `data:image/png;base64,${crestBase64}`;

  const dateLine = `${FORMATTED_EVENT_DATE.day} DE ${FORMATTED_EVENT_DATE.month} DE ${FORMATTED_EVENT_DATE.year} · ${FORMATTED_EVENT_DATE.time}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          padding: 36,
          background:
            "radial-gradient(circle at 50% 42%, #1E3A8A 0%, #0A2463 46%, #071739 100%)",
        }}
      >
        {/* Moldura dupla prateada */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: 8,
            borderRadius: 22,
            border: "1.5px solid rgba(226, 232, 240, 0.38)",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              borderRadius: 16,
              border: "1px solid rgba(203, 213, 225, 0.22)",
              textAlign: "center",
            }}
          >
            {/* Cantoneiras */}
            <div style={{ ...CORNER_BASE, top: 18, left: 18, borderTop: CORNER_LINE, borderLeft: CORNER_LINE }} />
            <div style={{ ...CORNER_BASE, top: 18, right: 18, borderTop: CORNER_LINE, borderRight: CORNER_LINE }} />
            <div style={{ ...CORNER_BASE, bottom: 18, left: 18, borderBottom: CORNER_LINE, borderLeft: CORNER_LINE }} />
            <div style={{ ...CORNER_BASE, bottom: 18, right: 18, borderBottom: CORNER_LINE, borderRight: CORNER_LINE }} />

            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) exige <img> nativo */}
            <img src={crestSrc} width={204} height={216} alt="" style={{ marginTop: -6 }} />

            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: "#F8FAFC",
                lineHeight: 1,
              }}
            >
              {EVENT.name.toUpperCase()}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.34em",
                color: "#CBD5E1",
              }}
            >
              {`${EVENT.age} ANOS · CONVITE OFICIAL`}
            </div>

            <div
              style={{
                display: "flex",
                width: 360,
                height: 1,
                marginTop: 22,
                background:
                  "linear-gradient(90deg, rgba(226,232,240,0) 0%, rgba(226,232,240,0.7) 50%, rgba(226,232,240,0) 100%)",
              }}
            />

            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#FFFFFF",
              }}
            >
              {dateLine}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 12,
                fontSize: 19,
                fontWeight: 500,
                letterSpacing: "0.16em",
                color: "#94A3B8",
              }}
            >
              {`${EVENT.venue.name.toUpperCase()} · ${venueCity.toUpperCase()}`}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 17,
                letterSpacing: "0.08em",
                color: "#93C5FD",
              }}
            >
              {EVENT.siteUrl.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
