import { getFormattedDate, type EventConfig } from "@/config/event";
import { isInAppBrowser, isIOSDevice } from "@/lib/utils";

/** `Date` → `YYYYMMDDTHHMMSSZ` (UTC). Ex.: 20:00 BRT → `20270716T230000Z`. */
const toUtcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** `Date` → `YYYYMMDDTHHMMSS` no fuso informado (ex.: `20270716T200000` em America/Sao_Paulo). */
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
  const { long, time, endTime } = getFormattedDate(event);
  const dressCodeLine = event.dressCodeNote
    ? `Traje: ${event.dressCode} — ${event.dressCodeNote}`
    : `Traje: ${event.dressCode}`;
  return [
    `${long}, às ${time} (até ${endTime}, horário de Brasília).`,
    "",
    event.openingText,
    "",
    dressCodeLine,
    `Convite: ${event.siteUrl}`,
  ].join("\n");
}

export function googleCalendarUrl(event: EventConfig): string {
  const { start, end } = eventRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(event),
    // UTC absoluto (ex.: 20270716T230000Z/20270717T050000Z) — imune ao fuso do dispositivo.
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

/** Gera conteúdo iCalendar RFC 5545 completo (compartilhado entre cliente e `/api/calendar`). */
export function buildIcsContent(event: EventConfig): string {
  const { start, end } = eventRange(event);
  const tz = event.timeZone;
  const offset = event.dateISO.match(/([+-])(\d{2}):?(\d{2})$/);
  const tzOffset = offset ? `${offset[1]}${offset[2]}${offset[3]}` : "-0300";
  const slugName =
    event.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "evento";
  const esc = (s: string) =>
    s
      .replace(/\r\n?|\u2028|\u2029/g, "\n")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const lines = [
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
    `UID:${slugName}-${event.age}-${toUtcStamp(start)}@${event.siteUrl.replace(/^https?:\/\//, "")}`,
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
  ];

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

/** Gera e baixa (ou abre no Apple Calendar no iOS / WebViews) um arquivo .ics (RFC 5545). */
export function downloadIcs(event: EventConfig): void {
  if (isIOSDevice()) {
    // `?inline=1` garante resposta inline mesmo no iPadOS 13+ (UA Macintosh) sem cache poisoning de CDN.
    window.location.assign("/api/calendar?inline=1");
    return;
  }

  if (isInAppBrowser()) {
    // Em WebViews do Android (WhatsApp/Instagram/Facebook), `<a download>` com `blob:` falha silenciosamente.
    window.location.assign("/api/calendar");
    return;
  }

  try {
    const ics = buildIcsContent(event);
    const slugName =
      event.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "convite";

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugName}-${event.age}-anos.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  } catch {
    window.location.assign("/api/calendar");
  }
}
