import { EVENT } from "@/config/event";
import { buildIcsContent } from "@/lib/utils";

/**
 * Serve o arquivo iCalendar (.ics) diretamente via HTTP para que dispositivos iOS/iPadOS
 * (inclusive dentro de WebViews do WhatsApp e Instagram) abram a folha nativa do Apple Calendar.
 */
export async function GET(request: Request) {
  const ics = buildIcsContent(EVENT);
  const ua = request.headers.get("user-agent") ?? "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const disposition = isIOS ? "inline" : "attachment";

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `${disposition}; filename="carol-18-anos.ics"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
