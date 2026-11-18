import { getFormattedDate, type EventConfig } from "@/config/event";

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

/** `Date` → `YYYYMMDDTHHMMSSZ` (UTC). Ex.: 19:30 BRT → `20270717T223000Z`. */
const toUtcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** `Date` → `YYYYMMDDTHHMMSS` no fuso informado (ex.: `20270717T193000` em America/Sao_Paulo). */
function toZonedStamp(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`;
}

function eventRange(event: EventConfig) {
  const start = new Date(event.dateISO);
  const end = new Date(start.getTime() + event.durationHours * 3_600_000);
  return { start, end };
}

const eventTitle = (event: EventConfig) => `Aniversário de ${event.age} anos — ${event.name}`;

const eventLocation = (event: EventConfig) => `${event.venue.name} — ${event.venue.address}`;

/** Descrição comum (Google Agenda / .ics) com data e horário oficiais no fuso do evento. */
function eventDetails(event: EventConfig): string {
  const { long, time } = getFormattedDate(event);
  return [
    `${long}, às ${time} (horário de Brasília).`,
    "",
    event.openingText,
    "",
    `Traje: ${event.dressCode}`,
    `Convite: ${event.siteUrl}`,
  ].join("\n");
}

export function googleCalendarUrl(event: EventConfig): string {
  const { start, end } = eventRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(event),
    // UTC absoluto (ex.: 20270717T223000Z/20270718T033000Z) — imune ao fuso do dispositivo.
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: eventDetails(event),
    location: eventLocation(event),
    ctz: event.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Dobra linhas do iCalendar em 75 octetos (RFC 5545 §3.1), preservando caracteres multibyte. */
function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const chunks: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = chunks.length === 0 ? 75 : 74; // linhas de continuação começam com um espaço
    if (currentBytes + bytes > limit) {
      chunks.push(current);
      current = char;
      currentBytes = bytes;
    } else {
      current += char;
      currentBytes += bytes;
    }
  }
  chunks.push(current);
  return chunks.join("\r\n ");
}

/** Gera e baixa um arquivo .ics (Apple Calendar, Outlook, Samsung…). */
export function downloadIcs(event: EventConfig): void {
  const { start, end } = eventRange(event);
  const tz = event.timeZone;
  const offset = event.dateISO.match(/([+-])(\d{2}):?(\d{2})$/);
  const tzOffset = offset ? `${offset[1]}${offset[2]}${offset[3]}` : "-0300";
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//convitecarol.site//Convite Carol 18//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Fuso explícito (Brasil sem horário de verão desde 2019 → offset fixo do evento).
    "BEGIN:VTIMEZONE",
    `TZID:${tz}`,
    `X-LIC-LOCATION:${tz}`,
    "BEGIN:STANDARD",
    `TZOFFSETFROM:${tzOffset}`,
    `TZOFFSETTO:${tzOffset}`,
    `TZNAME:${tzOffset.slice(0, 3)}`,
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${event.name.toLowerCase()}-${event.age}-${toUtcStamp(start)}@${event.siteUrl.replace(/^https?:\/\//, "")}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART;TZID=${tz}:${toZonedStamp(start, tz)}`,
    `DTEND;TZID=${tz}:${toZonedStamp(end, tz)}`,
    `SUMMARY:${esc(eventTitle(event))}`,
    `DESCRIPTION:${esc(eventDetails(event))}`,
    `LOCATION:${esc(eventLocation(event))}`,
    `URL:${event.siteUrl}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(eventTitle(event))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(foldIcsLine)
    .join("\r\n");

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
      field?: "name" | "companion";
      companionIndex?: number;
    };

/**
 * Valida e normaliza todos os campos do RSVP antes da montagem da mensagem/envio.
 */
export function validateRsvpInput(input: RsvpPayloadInput): RsvpValidationResult {
  if (typeof input.name !== "string") {
    return { ok: false, error: "Formato de nome inválido.", field: "name" };
  }

  if (input.attendance !== "yes" && input.attendance !== "no") {
    return { ok: false, error: "Selecione uma opção de presença válida." };
  }

  const sanitizedName = sanitizeSingleLineInput(input.name, RSVP_LIMITS.name);
  const letterCount = sanitizedName.match(/\p{L}/gu)?.length ?? 0;

  if (sanitizedName.length < 2 || letterCount < 2) {
    return { ok: false, error: "Por favor, informe seu nome completo para confirmar.", field: "name" };
  }

  const maxAllowed = Math.max(1, Math.floor(input.maxGuests));
  const rawGuests = typeof input.guests === "number" && Number.isFinite(input.guests) ? input.guests : 1;
  const safeGuests = Math.max(1, Math.min(maxAllowed, Math.floor(rawGuests)));

  const rawCompanions = Array.isArray(input.companions) ? input.companions : [];
  const sanitizedCompanions: string[] = [];

  if (input.attendance === "yes" && safeGuests > 1) {
    const expectedCompanions = safeGuests - 1;
    for (let i = 0; i < expectedCompanions; i += 1) {
      const rawItem = typeof rawCompanions[i] === "string" ? rawCompanions[i] : "";
      const cleanCompanion = sanitizeSingleLineInput(rawItem, RSVP_LIMITS.companion);
      const companionLetters = cleanCompanion.match(/\p{L}/gu)?.length ?? 0;

      if (cleanCompanion.length < 2 || companionLetters < 2) {
        return {
          ok: false,
          error: `Por favor, informe o nome completo do acompanhante ${i + 1} (ou reduza o total de pessoas).`,
          field: "companion",
          companionIndex: i,
        };
      }

      sanitizedCompanions.push(cleanCompanion);
    }
  }

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

