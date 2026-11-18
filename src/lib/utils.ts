import type { EventConfig } from "@/config/event";

/** Copia texto com fallback para navegadores/contextos sem Clipboard API. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* segue para o fallback */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    el.style.fontSize = "16px"; // evita zoom no iOS
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

const toUtcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function eventRange(event: EventConfig) {
  const start = new Date(event.dateISO);
  const end = new Date(start.getTime() + event.durationHours * 3_600_000);
  return { start, end };
}

const eventTitle = (event: EventConfig) => `Aniversário de ${event.age} anos — ${event.name}`;

export function googleCalendarUrl(event: EventConfig): string {
  const { start, end } = eventRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(event),
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: `${event.openingText}\n\nTraje: ${event.dressCode}`,
    location: `${event.venue.name} — ${event.venue.address}`,
    ctz: event.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Gera e baixa um arquivo .ics (Apple Calendar, Outlook, Samsung…). */
export function downloadIcs(event: EventConfig): void {
  const { start, end } = eventRange(event);
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Convite//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${event.name.toLowerCase()}@convite`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${esc(eventTitle(event))}`,
    `DESCRIPTION:${esc(`${event.openingText}\n\nTraje: ${event.dressCode}`)}`,
    `LOCATION:${esc(`${event.venue.name} — ${event.venue.address}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(eventTitle(event))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.name.toLowerCase()}-${event.age}-anos.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const googleMapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const googleMapsEmbedUrl = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

export const wazeUrl = (query: string) => `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;

export const whatsappUrl = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

/* ───────────────────────── Segurança & Sanitização RSVP ───────────────────────── */

export const RSVP_LIMITS = {
  name: 80,
  companion: 80,
  message: 280,
} as const;

const HTML_TAG_REGEX = /<[^>]*>/g;
const ANGLE_BRACKET_REGEX = /[<>]/g;
const URI_PAYLOAD_REGEX = /(?:javascript|data|vbscript)\s*:/gi;
const SINGLE_LINE_CONTROL_REGEX = /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g;
const MULTILINE_CONTROL_REGEX = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g;

/**
 * Sanitiza texto de linha única: remove tags HTML, colchetes angulares, payloads de script,
 * caracteres de controle/invisíveis, normaliza espaços consecutivos e aplica trim/limite.
 */
export function sanitizeSingleLineInput(value: string, maxLength?: number): string {
  if (typeof value !== "string") return "";

  let clean = value
    .replace(HTML_TAG_REGEX, " ")
    .replace(ANGLE_BRACKET_REGEX, "")
    .replace(URI_PAYLOAD_REGEX, "")
    .replace(SINGLE_LINE_CONTROL_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (typeof maxLength === "number" && maxLength > 0) {
    clean = clean.slice(0, maxLength).trim();
  }

  return clean;
}

/**
 * Sanitiza texto multilinha preservando quebras de linha legítimas, removendo tags HTML,
 * payloads de script, caracteres de controle e normalizando espaços múltiplos.
 */
export function sanitizeMultilineInput(value: string, maxLength?: number): string {
  if (typeof value !== "string") return "";

  let clean = value
    .replace(/\r\n?|\u2028|\u2029/g, "\n")
    .replace(HTML_TAG_REGEX, " ")
    .replace(ANGLE_BRACKET_REGEX, "")
    .replace(URI_PAYLOAD_REGEX, "")
    .replace(MULTILINE_CONTROL_REGEX, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (typeof maxLength === "number" && maxLength > 0) {
    clean = clean.slice(0, maxLength).trim();
  }

  return clean;
}

export interface RsvpPayloadInput {
  name: unknown;
  attendance: unknown;
  guests: unknown;
  companions: unknown;
  message: unknown;
  maxGuests: number;
}

export type RsvpValidationResult =
  | {
      ok: true;
      data: {
        name: string;
        attendance: "yes" | "no";
        guests: number;
        companions: string[];
        message: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Valida e normaliza todos os campos do RSVP antes da montagem da mensagem/envio.
 */
export function validateRsvpInput(input: RsvpPayloadInput): RsvpValidationResult {
  if (typeof input.name !== "string") {
    return { ok: false, error: "Formato de nome inválido." };
  }

  if (input.attendance !== "yes" && input.attendance !== "no") {
    return { ok: false, error: "Selecione uma opção de presença válida." };
  }

  const sanitizedName = sanitizeSingleLineInput(input.name, RSVP_LIMITS.name);
  const letterCount = sanitizedName.match(/\p{L}/gu)?.length ?? 0;

  if (sanitizedName.length < 2 || letterCount < 2) {
    return { ok: false, error: "Por favor, informe seu nome completo para confirmar." };
  }

  const maxAllowed = Math.max(1, Math.floor(input.maxGuests));
  const rawGuests = typeof input.guests === "number" && Number.isFinite(input.guests) ? input.guests : 1;
  const safeGuests = Math.max(1, Math.min(maxAllowed, Math.floor(rawGuests)));

  const rawCompanions = Array.isArray(input.companions) ? input.companions : [];
  const sanitizedCompanions =
    input.attendance === "yes"
      ? rawCompanions
          .slice(0, Math.max(0, safeGuests - 1))
          .filter((item): item is string => typeof item === "string")
          .map((item) => sanitizeSingleLineInput(item, RSVP_LIMITS.companion))
          .filter((item) => item.length > 0)
      : [];

  const sanitizedMessage =
    typeof input.message === "string"
      ? sanitizeMultilineInput(input.message, RSVP_LIMITS.message)
      : "";

  return {
    ok: true,
    data: {
      name: sanitizedName,
      attendance: input.attendance,
      guests: input.attendance === "yes" ? safeGuests : 0,
      companions: sanitizedCompanions,
      message: sanitizedMessage,
    },
  };
}

