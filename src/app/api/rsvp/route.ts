import { NextResponse } from "next/server";
import { EVENT } from "@/config/event";
import { validateRsvpInput } from "@/lib/utils";

/**
 * Endpoint leve para persistência redundante de confirmações RSVP (Google Sheets / Webhook opcional)
 * antes ou em paralelo ao redirecionamento para o WhatsApp.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null) {
      return NextResponse.json({ ok: false, error: "Payload inválido." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  if (typeof body.honeypot === "string" && body.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true, persisted: "honeypot" });
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
      { status: 400 },
    );
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    event: `${EVENT.name} — ${EVENT.age} Anos`,
    eventDateISO: EVENT.dateISO,
    ...validation.data,
  };

  const webhookUrl = process.env.RSVP_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4500),
      });
      if (response.ok) {
        return NextResponse.json({ ok: true, persisted: "webhook" });
      }
    } catch {
      /* fallback silencioso para não interromper o fluxo de confirmação do convidado */
    }
  }

  return NextResponse.json({ ok: true, persisted: "local" });
}
