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

