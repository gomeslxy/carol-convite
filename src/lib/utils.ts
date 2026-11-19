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

/** Detecta iPhone, iPad (incluindo iPadOS 13+ que reporta MacIntel) e iPod. */
export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

const KNOWN_IN_APP_UA_REGEX =
  /Instagram|FBAN|FBAV|FBIOS|FB_IAB|WhatsApp|Line\/|MicroMessenger|Twitter|Snapchat|TikTok|BytedanceWebview|;\s*wv\)/i;

/**
 * Detecta WebViews embutidos (WhatsApp, Instagram, Facebook, TikTok, Android `wv`) e iOS WKWebView,
 * onde `window.open(..., "_blank")` ou downloads `blob:` costumam ser bloqueados.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (KNOWN_IN_APP_UA_REGEX.test(ua)) return true;
  const isAppleHandheld = /iPhone|iPad|iPod/i.test(ua);
  const isThirdPartyIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  const hasSafariToken = /Safari\//i.test(ua);
  return isAppleHandheld && !hasSafariToken && !isThirdPartyIosBrowser;
}

/** Dispara feedback háptico sem lançar exceções em navegadores/WebViews restritos. */
export function triggerHaptic(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignora bloqueio de política ou dispositivo sem suporte */
  }
}

/**
 * Abre URL externa com compatibilidade real para WebViews in-app e bloqueadores de pop-up:
 * - Em WebViews (Instagram/WhatsApp) com `preferSameTabInApp`, navega na mesma aba para acionar Universal Links;
 * - Nos demais navegadores, evita `"noopener"` nas features para não receber `null` falso-negativo da spec HTML,
 *   neutralizando `win.opener = null` logo após abrir, com fallback para `window.location.assign`.
 */
export function openExternalUrl(
  url: string,
  options?: { preferSameTabInApp?: boolean },
): void {
  if (typeof window === "undefined") return;

  if (options?.preferSameTabInApp && isInAppBrowser()) {
    window.location.assign(url);
    return;
  }

  let win: Window | null = null;
  try {
    win = window.open(url, "_blank");
    if (win) {
      try {
        win.opener = null;
      } catch {
        /* cross-origin opener protegido */
      }
      return;
    }
  } catch {
    /* segue para fallback */
  }

  window.location.assign(url);
}

/** Garante string UTF-16 bem-formada (remove surrogates órfãos para impedir `URIError` no `encodeURIComponent`). */
export function toWellFormedString(value: string): string {
  if (typeof value !== "string") return "";
  const maybeWellFormed = (value as string & { toWellFormed?: () => string }).toWellFormed;
  if (typeof maybeWellFormed === "function") {
    return maybeWellFormed.call(value);
  }
  return value.replace(
    /([\uD800-\uDBFF])(?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])([\uDC00-\uDFFF])/g,
    "",
  );
}

/** Fatiamento seguro por codepoints Unicode (evita cortar emojis ou pares substitutos ao meio). */
export function sliceUnicode(value: string, maxChars: number): string {
  const safe = toWellFormedString(value);
  if (maxChars <= 0) return "";
  return Array.from(safe).slice(0, maxChars).join("");
}

export const googleMapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(toWellFormedString(query))}`;

export const googleMapsEmbedUrl = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(toWellFormedString(query))}&output=embed`;

export const wazeUrl = (query: string) =>
  `https://waze.com/ul?q=${encodeURIComponent(toWellFormedString(query))}&navigate=yes`;

export const whatsappUrl = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(toWellFormedString(message))}`;

/* ───────────────────────── Segurança & Sanitização RSVP ───────────────────────── */

export const RSVP_LIMITS = {
  name: 80,
  companion: 80,
  message: 280,
} as const;

const HTML_TAG_REGEX = /<[^>]*>/g;
const ANGLE_BRACKET_REGEX = /[<>]/g;
const URI_PAYLOAD_REGEX = /(?:javascript|data|vbscript)\s*:/gi;
// Preserva `\u200D` (ZWJ) para não quebrar emojis compostos (ex.: 👨‍👩‍👧, ❤️‍🔥)
const SINGLE_LINE_CONTROL_REGEX = /[\u0000-\u001F\u007F-\u009F\u200B\u200C\uFEFF]/g;
const MULTILINE_CONTROL_REGEX = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B\u200C\uFEFF]/g;

/**
 * Sanitiza texto de linha única: remove tags HTML, colchetes angulares, payloads de script,
 * caracteres de controle/invisíveis (preservando ZWJ para emojis compostos), normaliza espaços e aplica trim/limite por codepoints.
 */
export function sanitizeSingleLineInput(value: string, maxLength?: number): string {
  if (typeof value !== "string") return "";

  let clean = toWellFormedString(value)
    .replace(HTML_TAG_REGEX, " ")
    .replace(ANGLE_BRACKET_REGEX, "")
    .replace(URI_PAYLOAD_REGEX, "")
    .replace(SINGLE_LINE_CONTROL_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (typeof maxLength === "number" && maxLength > 0) {
    clean = sliceUnicode(clean, maxLength).trim();
  }

  return clean;
}

/**
 * Sanitiza texto multilinha preservando quebras de linha legítimas e emojis ZWJ,
 * removendo tags HTML, payloads de script, caracteres de controle e normalizando espaços múltiplos.
 */
export function sanitizeMultilineInput(value: string, maxLength?: number): string {
  if (typeof value !== "string") return "";

  let clean = toWellFormedString(value)
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
    clean = sliceUnicode(clean, maxLength).trim();
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

export type { EventConfig };
