/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURAÇÃO DO EVENTO
 *  Edite apenas este arquivo para personalizar o convite.
 * ─────────────────────────────────────────────────────────────
 */

export type GiftSuggestionIcon =
  | "perfume"
  | "jewelry"
  | "travel"
  | "books"
  | "music"
  | "shopping";

export interface GiftSuggestion {
  icon: GiftSuggestionIcon;
  title: string;
  description: string;
}

export interface EventConfig {
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
    defaultMessage: string;
    deadline: string;
    maxGuests: number;
  };
  gifts: {
    message: string;
    pixKey: string;
    pixKeyType: string;
    pixHolder: string;
    pixBank: string;
    suggestions: GiftSuggestion[];
  };
}

export const EVENT: EventConfig = {
  name: "Carol",
  initial: "C",
  age: 18,
  dateISO: "2027-07-17T20:30:00-03:00",
  durationHours: 5,
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
    name: "Espaço Royal Eventos",
    address: "Av. Paulista, 1000 — Bela Vista, São Paulo - SP",
    mapsQuery: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
  },
  rsvp: {
    whatsapp: "5519971345909",
    defaultMessage:
      "Olá, Carol! 💙 Quero confirmar minha presença na sua festa de 18 anos no dia 17/07/2027!",
    deadline: "17 de junho de 2027",
    maxGuests: 6,
  },
  gifts: {
    message:
      "Sua presença é o meu maior presente! Mas, se desejar me presentear, deixo aqui algumas sugestões com muito carinho.",
    pixKey: "carol18anos@email.com",
    pixKeyType: "E-mail",
    pixHolder: "Carolina Souza",
    pixBank: "Nubank",
    suggestions: [
      { icon: "perfume", title: "Perfumes & Beleza", description: "Fragrâncias suaves e skincare" },
      { icon: "jewelry", title: "Joias & Acessórios", description: "Prata, pérolas e delicadezas" },
      { icon: "travel", title: "Cota de Viagem", description: "Ajude no meu próximo destino" },
      { icon: "books", title: "Livros", description: "Romances e clássicos" },
      { icon: "music", title: "Música & Tech", description: "Fones, caixinha de som" },
      { icon: "shopping", title: "Vale-presente", description: "Lojas de moda e beleza" },
    ],
  },
};

/* ───────────────────────── Helpers ───────────────────────── */

const strip = (value: string) => value.replace(/\./g, "").replace(/-feira/i, "").trim();

export interface FormattedDate {
  weekday: string;
  weekdayShort: string;
  day: string;
  month: string;
  year: string;
  time: string;
  short: string;
}

/** Formata a data no fuso do evento — idêntico no servidor e no cliente. */
export function getFormattedDate(config: EventConfig = EVENT): FormattedDate {
  const date = new Date(config.dateISO);
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: config.timeZone, ...options }).format(date);

  const day = fmt({ day: "2-digit" });
  const monthNum = fmt({ month: "2-digit" });
  const year = fmt({ year: "numeric" });
  const fullWeekday = strip(fmt({ weekday: "long" })).toUpperCase();
  const shortWeekday = strip(fmt({ weekday: "short" })).toUpperCase();

  return {
    weekday: fullWeekday,
    weekdayShort: shortWeekday,
    day,
    month: strip(fmt({ month: "long" })).toUpperCase(),
    year,
    time: fmt({ hour: "2-digit", minute: "2-digit", hour12: false }),
    short: `${day} · ${monthNum} · ${year}`,
  };
}

export function getEventTimestamp(config: EventConfig = EVENT): number {
  return new Date(config.dateISO).getTime();
}
