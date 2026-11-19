import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";

/**
 * Banner social (Open Graph / Twitter) 1200×630 gerado no build a partir de `src/config/event.ts`.
 * Fonte única de verdade: data, horário, local e nome nunca ficam "assados" em PNG estático.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_ALT = `${EVENT.name} — ${EVENT.age} Anos • ${FORMATTED_EVENT_DATE.long} às ${FORMATTED_EVENT_DATE.time}`;

const CREST_PATH = join(process.cwd(), "src", "assets", "og-crest.png");

const GOOGLE_FONTS_TTF_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

let cachedCinzelBold: Promise<ArrayBuffer | null> | null = null;

function loadCinzelBoldFont(): Promise<ArrayBuffer | null> {
  if (cachedCinzelBold) return cachedCinzelBold;

  cachedCinzelBold = (async () => {
    try {
      const cssRes = await fetch(
        "https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap",
        {
          headers: { "User-Agent": GOOGLE_FONTS_TTF_UA },
          signal: AbortSignal.timeout(4000),
        },
      );
      if (!cssRes.ok) {
        cachedCinzelBold = null;
        return null;
      }

      const cssText = await cssRes.text();
      const match =
        cssText.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:truetype|opentype)['"]?\)/i) ??
        cssText.match(/url\((https?:\/\/[^)]+\.(?:ttf|otf))\)/i);
      const fontUrl = match?.[1]?.replace(/['"]/g, "").trim();
      if (!fontUrl) {
        cachedCinzelBold = null;
        return null;
      }

      const fontRes = await fetch(fontUrl, { signal: AbortSignal.timeout(4000) });
      if (!fontRes.ok) {
        cachedCinzelBold = null;
        return null;
      }

      return await fontRes.arrayBuffer();
    } catch {
      cachedCinzelBold = null;
      return null;
    }
  })();

  return cachedCinzelBold;
}

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
  const [crestBuffer, cinzelBold] = await Promise.all([
    readFile(CREST_PATH),
    loadCinzelBoldFont(),
  ]);
  const crestSrc = `data:image/png;base64,${crestBuffer.toString("base64")}`;

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
                fontFamily: '"Cinzel", Georgia, serif',
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
                fontFamily: '"Cinzel", Georgia, serif',
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
    {
      ...OG_SIZE,
      ...(cinzelBold
        ? {
            fonts: [
              {
                name: "Cinzel",
                data: cinzelBold,
                weight: 700,
                style: "normal",
              },
            ],
          }
        : {}),
    },
  );
}
