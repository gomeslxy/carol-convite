import { EVENT } from "@/config/event";
import { buildIcsContent } from "@/lib/calendar";

/**
 * Serve o arquivo iCalendar (.ics) diretamente via HTTP para que dispositivos iOS/iPadOS
 * (inclusive dentro de WebViews do WhatsApp e Instagram) abram a folha nativa do Apple Calendar,
 * e WebViews Android recebam o arquivo como attachment sem depender de `blob:`.
 */
export async function GET(request: Request) {
  const ics = buildIcsContent(EVENT);
  const ua = request.headers.get("user-agent") ?? "";
  const inlineParam = new URL(request.url).searchParams.get("inline") === "1";
  const isIOS = inlineParam || /iPhone|iPad|iPod/i.test(ua);
  const disposition = isIOS ? "inline" : "attachment";

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `${disposition}; filename="carol-18-anos.ics"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Vary": "User-Agent",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
