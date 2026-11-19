import { NextResponse } from "next/server";
import { EVENT } from "@/config/event";
import { validateRsvpInput } from "@/lib/utils";

const MAX_BODY_BYTES = 8192;
const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

/** Neutraliza prefixos de fórmula (OWASP CSV/Spreadsheet Injection) antes de enviar a planilhas/webhooks. */
function neutralizeSpreadsheetFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function isAllowedOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return true;

  let originHost: string;
  try {
    originHost = new URL(originHeader).host.toLowerCase();
  } catch {
    return false;
  }

  const requestHost = request.headers.get("host")?.toLowerCase();
  const siteHost = new URL(EVENT.siteUrl).host.toLowerCase();
  return originHost === requestHost || originHost === siteHost;
}

/**
 * Endpoint leve para persistência redundante de confirmações RSVP (Google Sheets / Webhook opcional)
 * antes ou em paralelo ao redirecionamento para o WhatsApp.
 */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Origem não autorizada." },
      { status: 403, headers: NO_STORE_HEADERS },
    );
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Payload excede o limite permitido." },
        { status: 413, headers: NO_STORE_HEADERS },
      );
    }
  }

  let body: Record<string, unknown>;
  try {
    const rawText = await request.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Payload excede o limite permitido." },
        { status: 413, headers: NO_STORE_HEADERS },
      );
    }
    const parsed: unknown = JSON.parse(rawText);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json(
        { ok: false, error: "Payload inválido." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON inválido." },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  if (typeof body.honeypot === "string" && body.honeypot.trim().length > 0) {
    return NextResponse.json(
      { ok: true, persisted: "honeypot" },
      { headers: NO_STORE_HEADERS },
    );
  }

  const validation = validateRsvpInput({
    name: body.name,
    attendance: body.attendance,
    guests: body.guests,
    companions: body.companions,
    message: body.message,
    maxGuests: EVENT.rsvp.maxGuests,
  });

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: validation.error,
        field: validation.field,
        companionIndex: validation.companionIndex,
      },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const safeData = validation.data;
  const webhookPayload = {
    submittedAt: new Date().toISOString(),
    event: `${EVENT.name} — ${EVENT.age} Anos`,
    eventDateISO: EVENT.dateISO,
    attendance: safeData.attendance,
    guests: safeData.guests,
    name: neutralizeSpreadsheetFormula(safeData.name),
    companions: safeData.companions.map(neutralizeSpreadsheetFormula),
    message: neutralizeSpreadsheetFormula(safeData.message),
  };

  const rawWebhookUrl = process.env.RSVP_WEBHOOK_URL?.trim();
  if (rawWebhookUrl) {
    try {
      const parsedUrl = new URL(rawWebhookUrl);
      if (parsedUrl.protocol === "https:") {
        const response = await fetch(parsedUrl.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(4500),
        });
        if (response.ok) {
          return NextResponse.json(
            { ok: true, persisted: "webhook" },
            { headers: NO_STORE_HEADERS },
          );
        }
      }
    } catch {
      /* fallback silencioso para não interromper o fluxo de confirmação do convidado */
    }
  }

  return NextResponse.json(
    { ok: true, persisted: "local" },
    { headers: NO_STORE_HEADERS },
  );
}
