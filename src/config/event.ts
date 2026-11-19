/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURAÇÃO DO EVENTO
 *  Edite apenas este arquivo para personalizar o convite.
 * ─────────────────────────────────────────────────────────────
 */

export interface EventConfig {
  siteUrl: string;
  name: string;
  initial: string;
  age: number;
  /** Data/hora no formato ISO com fuso (Brasília = -03:00). */
  dateISO: string;
  /** Duração estimada (horas) — usada nos links de agenda. */
  durationHours: number;
  timeZone: string;
  quoteText: string;
  quoteAuthor: string;
  openingText: string;
  dressCode: string;
  dressCodeNote: string;
  closingText: string;
  venue: {
    name: string;
    address: string;
    /** Texto usado para busca no Google Maps / Waze. */
    mapsQuery: string;
  };
  rsvp: {
    /** Número com DDI + DDD, apenas dígitos. Ex.: 5511999999999 */
    whatsapp: string;
    deadline: string;
    maxGuests: number;
  };
}

export const EVENT: EventConfig = {
  siteUrl: "https://convitecarol.site",
  name: "Carol",
  initial: "C",
  age: 18,
  /** Horário oficial: Sexta-feira, 16/07/2027 às 20:00 (Brasília) = 2027-07-16T23:00:00Z, até 17/07 às 02:00. */
  dateISO: "2027-07-16T20:00:00-03:00",
  durationHours: 6,
  timeZone: "America/Sao_Paulo",
  quoteText:
    "“Você pode sonhar, criar, desenhar e construir o lugar mais maravilhoso do mundo. Mas é necessário ter pessoas para transformar seu sonho em realidade.”",
  quoteAuthor: "– Walt Disney",
  openingText:
    "Por isso, você não poderia deixar de fazer parte de um dos dias mais especiais pra mim.",
  dressCode: "Esporte Fino",
  dressCodeNote: "Tons de azul royal e prata são reservados à aniversariante.",
  closingText: "Conto com sua presença!",
  venue: {
    name: "Videira Hall",
    address: "Alameda José Boldrini - Bairro Videiras, Indaiatuba - SP",
    mapsQuery: "Videira Hall, Alameda José Boldrini - Bairro Videiras, Indaiatuba - SP",
  },
  rsvp: {
    whatsapp: "5519971345909",
    deadline: "17 de junho de 2027",
    maxGuests: 6,
  },
};

/* ───────────────────────── Helpers ───────────────────────── */

const strip = (value: string) => value.replace(/\./g, "").replace(/-feira/i, "").trim();
const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export interface FormattedDate {
  weekday: string;
  weekdayShort: string;
  day: string;
  month: string;
  year: string;
  /** Horário 24h no fuso do evento (ex.: "19:30"). */
  time: string;
  /** "17 · 07 · 2027" */
  short: string;
  /** "17/07/2027" */
  numeric: string;
  /** "Sábado, 17 de Julho de 2027" */
  long: string;
}

const formattedDateCache = new Map<string, FormattedDate>();

/** Formata a data no fuso do evento com cache determinístico — idêntico no servidor e no cliente. */
export function getFormattedDate(config: EventConfig = EVENT): FormattedDate {
  const cacheKey = `${config.dateISO}|${config.timeZone}`;
  const cached = formattedDateCache.get(cacheKey);
  if (cached) return cached;

  const date = new Date(config.dateISO);
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: config.timeZone, ...options }).format(date);

  const day = fmt({ day: "2-digit" });
  const monthNum = fmt({ month: "2-digit" });
  const year = fmt({ year: "numeric" });
  const fullWeekday = strip(fmt({ weekday: "long" })).toUpperCase();
  const shortWeekday = strip(fmt({ weekday: "short" })).toUpperCase();
  const month = strip(fmt({ month: "long" })).toUpperCase();

  const result: FormattedDate = {
    weekday: fullWeekday,
    weekdayShort: shortWeekday,
    day,
    month,
    year,
    // `hourCycle: "h23"` evita o bug "24:30" de alguns motores com `hour12: false`.
    time: fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    short: `${day} · ${monthNum} · ${year}`,
    numeric: `${day}/${monthNum}/${year}`,
    long: `${capitalize(fullWeekday)}, ${day} de ${capitalize(month)} de ${year}`,
  };

  formattedDateCache.set(cacheKey, result);
  return result;
}

export const FORMATTED_EVENT_DATE: FormattedDate = getFormattedDate(EVENT);
export const EVENT_TIMESTAMP: number = new Date(EVENT.dateISO).getTime();
