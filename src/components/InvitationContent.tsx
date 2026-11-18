"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Heart,
  HeartCrack,
  MapPin,
  MessageCircle,
  Minus,
  Navigation,
  Plus,
  Shirt,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import CountdownTimer from "@/components/CountdownTimer";
import HeroPoster, {
  GlitterBlueStar,
  MetallicSilverStar,
  type FloatStyle,
} from "@/components/HeroPoster";
import { fireMiniCelebration } from "@/components/LuxuryParticles";
import { CornerFiligree } from "@/components/Ornaments";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import {
  copyToClipboard,
  downloadIcs,
  googleCalendarUrl,
  googleMapsEmbedUrl,
  googleMapsUrl,
  wazeUrl,
  whatsappUrl,
} from "@/lib/utils";

type Attendance = "yes" | "no";

interface SubmittedRsvp {
  name: string;
  attendance: Attendance;
  guests: number;
  companions: string[];
  whatsappHref: string;
}

export interface InvitationContentProps {
  /** Começa a animar a entrada do pôster e conteúdo (quando as portas da capa abrem). */
  revealed: boolean;
}

const SECTION_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const VIEWPORT_CONFIG = { once: true, amount: 0.2 } as const;

/** Título editorial serifado ladeado por filetes horizontais no estilo do pôster. */
function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[380px] items-center gap-3 sm:gap-4">
      <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
      <h2 className="font-serif text-[21px] sm:text-[26px] font-bold leading-none tracking-wide text-royal-navy">
        {title}
      </h2>
      <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
    </div>
  );
}

export default function InvitationContent({ revealed }: InvitationContentProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const ids = {
    name: useId(),
    nameError: useId(),
    guests: useId(),
    message: useId(),
  };

  // Estados de Agenda e Endereço
  const [icsSaved, setIcsSaved] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const icsTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  // Estados do Formulário RSVP
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [guests, setGuests] = useState(1);
  const [companions, setCompanions] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedRsvp, setSubmittedRsvp] = useState<SubmittedRsvp | null>(null);

  useEffect(() => {
    return () => {
      if (icsTimerRef.current !== null) window.clearTimeout(icsTimerRef.current);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Mantém o array de nomes de acompanhantes sincronizado com `guests - 1`
  const updateGuestsCount = useCallback((next: number) => {
    const clamped = Math.max(1, Math.min(EVENT.rsvp.maxGuests, next));
    setGuests(clamped);
    setCompanions((prev) => {
      const needed = Math.max(0, clamped - 1);
      if (prev.length === needed) return prev;
      if (prev.length > needed) return prev.slice(0, needed);
      return [...prev, ...Array<string>(needed - prev.length).fill("")];
    });
  }, []);

  const handleCompanionChange = useCallback((index: number, value: string) => {
    setCompanions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleDownloadIcs = useCallback(() => {
    downloadIcs(EVENT);
    setIcsSaved(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
    if (icsTimerRef.current !== null) window.clearTimeout(icsTimerRef.current);
    icsTimerRef.current = window.setTimeout(() => {
      setIcsSaved(false);
      icsTimerRef.current = null;
    }, 2500);
  }, []);

  const handleCopyAddress = useCallback(async () => {
    if (await copyToClipboard(EVENT.venue.address)) {
      setCopiedAddress(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(10);
      }
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedAddress(false);
        copyTimerRef.current = null;
      }, 2400);
    }
  }, []);

  const buildWhatsappHref = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedMsg = message.trim();
    const activeCompanions = companions
      .slice(0, Math.max(0, guests - 1))
      .map((c) => c.trim())
      .filter(Boolean);
    const dateLabel = FORMATTED_EVENT_DATE.short.replace(/\s·\s/g, "/");

    const lines =
      attendance === "yes"
        ? [
          `Olá, ${EVENT.name}! 💙 Quero confirmar minha presença na sua festa de ${EVENT.age} anos no dia ${dateLabel} às ${FORMATTED_EVENT_DATE.time}!`,
          "",
          `👤 Nome: ${trimmedName}`,
          `👥 Total de pessoas: ${guests}`,
          ...(activeCompanions.length > 0
            ? [`🎟️ Acompanhantes: ${activeCompanions.join(", ")}`]
            : []),
        ]
        : [
          `Olá, ${EVENT.name}! Infelizmente não poderei comparecer à sua festa de ${EVENT.age} anos. 🤍`,
          "",
          `👤 Nome: ${trimmedName}`,
        ];

    if (trimmedMsg) {
      lines.push(`💌 Recado: ${trimmedMsg}`);
    }

    return whatsappUrl(EVENT.rsvp.whatsapp, lines.join("\n"));
  }, [name, attendance, guests, companions, message]);

  const handleRsvpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setFormError("Por favor, informe seu nome completo para confirmar.");
      nameInputRef.current?.focus();
      return;
    }

    setFormError(null);
    const filledCompanions = companions
      .slice(0, Math.max(0, guests - 1))
      .map((c) => c.trim())
      .filter(Boolean);

    if (attendance === "yes") {
      fireMiniCelebration({ x: 0.5, y: 0.72 });
    }

    setSubmittedRsvp({
      name: trimmedName,
      attendance,
      guests: attendance === "yes" ? guests : 0,
      companions: attendance === "yes" ? filledCompanions : [],
      whatsappHref: buildWhatsappHref,
    });

    window.open(buildWhatsappHref, "_blank", "noopener,noreferrer");
  };

  const inputCls =
    "min-h-11 w-full rounded-xl border border-[#0A2463]/20 bg-white/95 px-4 py-2.5 font-sans text-[14.5px] text-royal-navy placeholder:text-silver-400 outline-none transition focus:border-royal-deep focus:bg-white focus:ring-4 focus:ring-royal-deep/10";

  const cardSurfaceCls =
    "border border-royal-deep/15 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16),0_4px_12px_-4px_rgba(10,36,99,0.08)]";

  return (
    <div
      data-active={revealed ? "true" : "false"}
      className={`relative mx-auto w-full md:max-w-2xl lg:max-w-[700px] md:rounded-[28px] md:bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(148,163,184,0.48)_50%,rgba(255,255,255,0.9)_100%)] md:p-[1.5px] ${revealed ? "pointer-events-auto" : "pointer-events-none"
        }`}
    >
      {/* Fundo único contínuo em papel texturizado claro (#F1F2F4) do topo do pôster até o rodapé */}
      <div className="bg-poster-paper relative isolate min-h-dvh md:min-h-0 w-full overflow-hidden md:rounded-[26px] shadow-[0_32px_70px_-14px_rgba(7,23,57,0.30),0_14px_30px_-8px_rgba(10,36,99,0.14)]">
        {/* Camada sutil de brilho atmosférico em GPU (zero filtros SVG pesados) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-70"
          style={{
            background:
              "radial-gradient(90% 42% at 50% 0%, rgba(255,255,255,0.62) 0%, transparent 72%), radial-gradient(75% 45% at 50% 100%, rgba(203,213,225,0.22) 0%, transparent 74%)",
          }}
          aria-hidden
        />

        {/* ════════════════════════════════════════════════════════════════════════
            SEÇÃO 1: PÔSTER PRINCIPAL ANIMADO (Sem corte reto na base)
           ════════════════════════════════════════════════════════════════════════ */}
        <HeroPoster revealed={revealed} />

        {/* ════════════════════════════════════════════════════════════════════════
            CONTINUAÇÃO CONTÍNUA NO MESMO PAPEL TEXTURIZADO (Ritmo Editorial)
           ════════════════════════════════════════════════════════════════════════ */}
        <div className="relative z-[5] pt-8 pb-16 sm:pt-12 sm:pb-20">
          {/* Estrelas laterais nas margens externas conectando visualmente o pôster às seções */}
          <GlitterBlueStar
            style={
              {
                animationDelay: "0.25s",
                "--float-duration": "5s",
                "--ty": "-6px",
                "--r-start": "-12deg",
                "--r-mid": "-4deg",
              } as FloatStyle
            }
            className="absolute top-10 -left-2 sm:top-12 sm:left-4 z-[2] w-[30px] sm:w-[50px] opacity-85 sm:opacity-95"
          />
          <MetallicSilverStar
            style={
              {
                animationDelay: "0.5s",
                "--float-duration": "4.8s",
                "--ty": "-5px",
                "--r-start": "10deg",
                "--r-mid": "18deg",
              } as FloatStyle
            }
            className="absolute top-28 -right-2 sm:top-32 sm:right-4 z-[2] w-[28px] sm:w-[46px] opacity-85 sm:opacity-95"
          />

          <MetallicSilverStar
            style={
              {
                animationDelay: "0.35s",
                "--float-duration": "5.3s",
                "--ty": "-6px",
                "--r-start": "-8deg",
                "--r-mid": "2deg",
              } as FloatStyle
            }
            className="absolute top-[37%] -left-2 sm:left-4 z-[2] w-[28px] sm:w-[48px] opacity-80 sm:opacity-90"
          />
          <GlitterBlueStar
            style={
              {
                animationDelay: "0.7s",
                "--float-duration": "4.7s",
                "--ty": "-6px",
                "--r-start": "12deg",
                "--r-mid": "20deg",
              } as FloatStyle
            }
            className="absolute top-[42%] -right-2 sm:right-4 z-[2] w-[32px] sm:w-[54px] opacity-85 sm:opacity-95"
          />

          <GlitterBlueStar
            style={
              {
                animationDelay: "0.4s",
                "--float-duration": "5.1s",
                "--ty": "-5px",
                "--r-start": "-14deg",
                "--r-mid": "-5deg",
              } as FloatStyle
            }
            className="absolute bottom-44 -left-2 sm:bottom-52 sm:left-4 z-[2] w-[32px] sm:w-[52px] opacity-85 sm:opacity-95"
          />
          <MetallicSilverStar
            style={
              {
                animationDelay: "0.6s",
                "--float-duration": "4.6s",
                "--ty": "-4px",
                "--r-start": "8deg",
                "--r-mid": "16deg",
              } as FloatStyle
            }
            className="absolute bottom-24 -right-2 sm:bottom-28 sm:right-4 z-[2] w-[28px] sm:w-[46px] opacity-85 sm:opacity-95"
          />

          <main className="relative z-[5] mx-auto flex w-full max-w-[540px] flex-col items-center px-5 sm:px-10 text-center">
            {/* ──────────────────────────────────────────────────────────────────────
                2. APRESENTAÇÃO & CONTAGEM REGRESSIVA
               ────────────────────────────────────────────────────────────────────── */}
            <motion.section
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView={revealed ? "visible" : "hidden"}
              viewport={VIEWPORT_CONFIG}
              className="flex w-full flex-col items-center"
              aria-label="Apresentação e contagem regressiva"
            >
              {/* Pílula Azul-Marinho CAROL • 18 ANOS ladeada por linhas */}
              <motion.div
                variants={ITEM_VARIANTS}
                className="flex w-full max-w-[360px] items-center gap-3 sm:gap-4"
              >
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
                <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-royal-navy px-5 py-1.5 sm:px-7 font-sans text-[11.5px] sm:text-[13px] font-bold tracking-[0.22em] text-white uppercase shadow-[0_6px_14px_rgba(7,23,57,0.24)]">
                  {EVENT.name.toUpperCase()} • {EVENT.age} ANOS
                </span>
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
              </motion.div>

              {/* Citação de Walt Disney e boas-vindas integradas ao papel */}
              <motion.div
                variants={ITEM_VARIANTS}
                className={`mt-7 w-full max-w-[460px] rounded-2xl px-5 py-6 sm:px-7 sm:py-7 ${cardSurfaceCls}`}
              >
                <span
                  className="block font-serif text-[32px] leading-none text-royal-deep/55"
                  aria-hidden
                >
                  “
                </span>

                <blockquote className="-mt-1 font-serif text-[13.5px] sm:text-[15px] font-medium italic leading-[1.85] tracking-[0.02em] text-royal-navy">
                  {EVENT.quoteText}
                </blockquote>

                <div className="mt-3.5 flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-royal-deep/35" />
                  <cite className="font-serif text-[10.5px] sm:text-[11.5px] font-bold not-italic tracking-[0.18em] text-royal-deep uppercase">
                    {EVENT.quoteAuthor}
                  </cite>
                  <span className="h-px w-8 bg-royal-deep/35" />
                </div>

                <p className="mx-auto mt-4 max-w-[380px] font-sans text-[12px] sm:text-[13px] font-semibold leading-[1.75] tracking-[0.06em] text-royal-navy/85 uppercase">
                  {EVENT.openingText}
                </p>
              </motion.div>

              {/* Contador ao vivo no estilo do pôster */}
              <motion.div variants={ITEM_VARIANTS} className="mt-9 flex w-full justify-center">
                <CountdownTimer active={revealed} />
              </motion.div>

              {/* Ações rápidas de Calendário */}
              <motion.div
                variants={ITEM_VARIANTS}
                className="mt-5 grid w-full max-w-[360px] grid-cols-2 gap-2.5"
              >
                <motion.a
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  href={googleCalendarUrl(EVENT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-royal-deep/20 bg-white/85 px-3 py-2 font-sans text-[11.5px] sm:text-[12px] font-semibold text-royal-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_-6px_rgba(7,23,57,0.18)] transition hover:border-royal-deep hover:bg-white"
                >
                  <ExternalLink className="size-3.5 shrink-0 text-royal-deep" />
                  <span>Google Agenda</span>
                </motion.a>

                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDownloadIcs}
                  aria-live="polite"
                  className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 font-sans text-[11.5px] sm:text-[12px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_-6px_rgba(7,23,57,0.18)] transition-colors ${icsSaved
                      ? "border-royal-navy bg-royal-navy text-white"
                      : "border-royal-deep/20 bg-white/85 text-royal-navy hover:border-royal-deep hover:bg-white"
                    }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {icsSaved ? (
                      <motion.span
                        key="ics-saved"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16 }}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Check className="size-3.5 shrink-0" />
                        <span>Salvo na agenda!</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="ics-idle"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16 }}
                        className="inline-flex items-center gap-1.5"
                      >
                        <CalendarPlus className="size-3.5 shrink-0 text-royal-deep" />
                        <span>iPhone / Outlook</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.section>

            {/* ──────────────────────────────────────────────────────────────────────
                3. LOCAL DA FESTA
               ────────────────────────────────────────────────────────────────────── */}
            <motion.section
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView={revealed ? "visible" : "hidden"}
              viewport={VIEWPORT_CONFIG}
              className="mt-14 sm:mt-16 flex w-full flex-col items-center"
              aria-label="Local da festa"
            >
              <motion.div variants={ITEM_VARIANTS} className="w-full">
                <SectionHeading title="Local da Festa" />
              </motion.div>

              <motion.div
                variants={ITEM_VARIANTS}
                className={`relative mt-5 w-full rounded-2xl p-5 sm:p-7 text-center ${cardSurfaceCls}`}
              >
                <CornerFiligree
                  position="tl"
                  tone="slate"
                  className="absolute top-2.5 left-2.5 size-9 sm:size-11 opacity-45"
                />
                <CornerFiligree
                  position="tr"
                  tone="slate"
                  className="absolute top-2.5 right-2.5 size-9 sm:size-11 opacity-45"
                />

                <p className="font-serif text-[20px] sm:text-[24px] font-bold tracking-[0.06em] text-royal-navy">
                  {EVENT.venue.name}
                </p>

                <p className="mt-2 font-sans text-[13.5px] sm:text-[14.5px] font-medium leading-relaxed text-slate-700">
                  {EVENT.venue.address}
                </p>

                {/* Faixa Horário & Traje no estilo do pôster */}
                <div className="mt-5 grid grid-cols-2 items-center rounded-xl border border-royal-deep/15 bg-[#F1F2F4]/85 py-3 px-2">
                  <div className="flex flex-col items-center border-r border-royal-deep/15 px-2">
                    <span className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-[0.16em] text-royal-deep uppercase">
                      <Clock className="size-3.5" /> Horário
                    </span>
                    <span className="mt-1 font-serif text-[18px] sm:text-[20px] font-bold tabular-nums text-royal-navy">
                      {FORMATTED_EVENT_DATE.time}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-[0.16em] text-royal-deep uppercase">
                      <Shirt className="size-3.5" /> Traje
                    </span>
                    <span className="mt-1 font-serif text-[15px] sm:text-[17px] font-bold tracking-wide text-royal-navy">
                      {EVENT.dressCode}
                    </span>
                  </div>
                </div>

                {EVENT.dressCodeNote && (
                  <p className="mt-3.5 inline-flex items-center justify-center rounded-full border border-royal-deep/15 bg-royal-navy/[0.045] px-4 py-1.5 font-sans text-[11px] sm:text-[11.5px] font-semibold text-royal-navy">
                    {EVENT.dressCodeNote}
                  </p>
                )}

                {/* Mapa Embed com moldura prateada/marinho */}
                <div className="mt-5 overflow-hidden rounded-xl border border-royal-deep/15 bg-silver-100 shadow-sm">
                  <iframe
                    title={`Mapa — ${EVENT.venue.name}`}
                    src={googleMapsEmbedUrl(EVENT.venue.mapsQuery)}
                    className="block h-52 sm:h-60 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Botões funcionais: Google Maps, Waze e Copiar Endereço */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <motion.a
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    href={googleMapsUrl(EVENT.venue.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-royal-navy px-3 py-2.5 font-sans text-[12.5px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(7,23,57,0.6)] transition hover:bg-royal-deep"
                  >
                    <MapPin className="size-4 shrink-0" />
                    <span>Google Maps</span>
                  </motion.a>

                  <motion.a
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    href={wazeUrl(EVENT.venue.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-royal-deep px-3 py-2.5 font-sans text-[12.5px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(10,36,99,0.55)] transition hover:bg-royal-800"
                  >
                    <Navigation className="size-4 shrink-0" />
                    <span>Waze</span>
                  </motion.a>

                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCopyAddress}
                    aria-live="polite"
                    className={`col-span-2 sm:col-span-1 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 font-sans text-[12.5px] font-semibold transition-colors ${copiedAddress
                        ? "border-royal-navy bg-royal-navy text-white shadow-[0_8px_18px_-8px_rgba(7,23,57,0.45)]"
                        : "border-royal-deep/20 bg-white/95 text-royal-navy hover:border-royal-deep hover:bg-white"
                      }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copiedAddress ? (
                        <motion.span
                          key="addr-copied"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.16 }}
                          className="inline-flex items-center gap-2"
                        >
                          <Check className="size-4 shrink-0" />
                          <span>Copiado!</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="addr-idle"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.16 }}
                          className="inline-flex items-center gap-2"
                        >
                          <Copy className="size-4 shrink-0 text-royal-deep" />
                          <span>Copiar Endereço</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>
            </motion.section>

            {/* ──────────────────────────────────────────────────────────────────────
                4. CONFIRMAÇÃO DE PRESENÇA / RSVP
               ────────────────────────────────────────────────────────────────────── */}
            <motion.section
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView={revealed ? "visible" : "hidden"}
              viewport={VIEWPORT_CONFIG}
              className="mt-14 sm:mt-16 flex w-full flex-col items-center"
              aria-label="Confirmação de presença"
            >
              <motion.div variants={ITEM_VARIANTS} className="w-full">
                <SectionHeading title="Confirmar Presença" />
              </motion.div>

              <motion.p
                variants={ITEM_VARIANTS}
                className="mt-3 font-sans text-[12.5px] sm:text-[13.5px] text-slate-600"
              >
                Por gentileza, confirme sua presença até{" "}
                <strong className="font-bold text-royal-navy">{EVENT.rsvp.deadline}</strong>.
              </motion.p>

              <motion.div
                variants={ITEM_VARIANTS}
                className={`mt-4 w-full rounded-2xl p-5 sm:p-7 text-left ${cardSurfaceCls}`}
              >
                <form onSubmit={handleRsvpSubmit} className="space-y-4" noValidate>
                  {/* Seletor de Presença */}
                  <div
                    className="grid grid-cols-2 gap-2 rounded-xl border border-royal-deep/15 bg-[#EEF2F7] p-1.5"
                    role="radiogroup"
                    aria-label="Confirmação de presença"
                  >
                    {(
                      [
                        { value: "yes", label: "Sim, estarei lá!", Icon: Heart },
                        { value: "no", label: "Não poderei ir", Icon: HeartCrack },
                      ] as const
                    ).map(({ value, label, Icon }) => {
                      const active = attendance === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setAttendance(value)}
                          className={`relative flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-2.5 py-2.5 font-sans text-[12px] sm:text-[13px] font-semibold transition-colors ${active ? "text-white" : "text-royal-navy/75 hover:text-royal-navy"
                            }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="rsvp-inline-pill"
                              className="absolute inset-0 rounded-lg bg-royal-navy shadow-[0_6px_16px_-6px_rgba(7,23,57,0.65)]"
                              transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            />
                          )}
                          <Icon
                            className="relative z-10 size-4 shrink-0"
                            fill={active && value === "yes" ? "currentColor" : "none"}
                          />
                          <span className="relative z-10">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <label
                      htmlFor={ids.name}
                      className="mb-1.5 block font-sans text-[11px] font-bold tracking-[0.16em] text-royal-navy uppercase"
                    >
                      Nome Completo
                    </label>
                    <input
                      ref={nameInputRef}
                      id={ids.name}
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="Digite seu nome completo"
                      autoComplete="name"
                      aria-invalid={!!formError}
                      aria-describedby={formError ? ids.nameError : undefined}
                      className={`${inputCls} ${formError ? "border-royal-navy ring-4 ring-royal-deep/15" : ""}`}
                    />
                    <AnimatePresence>
                      {formError && (
                        <motion.div
                          id={ids.nameError}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-silver-300/70 bg-royal-navy px-3 py-1.5 font-sans text-[12px] font-medium text-white shadow-sm"
                          role="alert"
                        >
                          <AlertCircle className="size-3.5 shrink-0 text-silver-200" />
                          <span>{formError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quantidade e Nomes dos Acompanhantes */}
                  <AnimatePresence initial={false} mode="wait">
                    {attendance === "yes" && (
                      <motion.div
                        key="guests-block"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-4"
                      >
                        <div>
                          <span
                            id={ids.guests}
                            className="mb-1.5 block font-sans text-[11px] font-bold tracking-[0.16em] text-royal-navy uppercase"
                          >
                            Total de Pessoas (Incluindo Você)
                          </span>
                          <div
                            className="flex items-center justify-between rounded-xl border border-royal-deep/15 bg-white/95 p-1.5"
                            aria-labelledby={ids.guests}
                          >
                            <button
                              type="button"
                              aria-label="Diminuir quantidade de pessoas"
                              onClick={() => updateGuestsCount(guests - 1)}
                              disabled={guests <= 1}
                              className="grid size-11 cursor-pointer place-items-center rounded-lg bg-[#EEF2F7] text-royal-navy transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="size-4" />
                            </button>

                            <span
                              className="relative h-8 w-14 overflow-hidden text-center font-serif text-2xl font-bold tabular-nums text-royal-navy"
                              aria-live="polite"
                            >
                              <AnimatePresence initial={false} mode="popLayout">
                                <motion.span
                                  key={guests}
                                  initial={{ y: 14, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: -14, opacity: 0 }}
                                  transition={{ duration: 0.18 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  {guests}
                                </motion.span>
                              </AnimatePresence>
                            </span>

                            <button
                              type="button"
                              aria-label="Aumentar quantidade de pessoas"
                              onClick={() => updateGuestsCount(guests + 1)}
                              disabled={guests >= EVENT.rsvp.maxGuests}
                              className="grid size-11 cursor-pointer place-items-center rounded-lg bg-[#EEF2F7] text-royal-navy transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                        </div>

                        {guests > 1 && (
                          <div className="space-y-2.5 rounded-xl border border-royal-deep/15 bg-[#F1F2F4]/85 p-3.5">
                            <div className="flex items-center gap-1.5 font-sans text-[11px] font-bold tracking-[0.14em] text-royal-navy uppercase">
                              <Users className="size-3.5 text-royal-deep" />
                              <span>Nome dos Acompanhantes ({guests - 1})</span>
                            </div>

                            {Array.from({ length: guests - 1 }).map((_, idx) => (
                              <input
                                key={`companion-${idx}`}
                                type="text"
                                value={companions[idx] ?? ""}
                                onChange={(e) => handleCompanionChange(idx, e.target.value)}
                                placeholder={`Nome completo do acompanhante ${idx + 1}`}
                                aria-label={`Nome completo do acompanhante ${idx + 1}`}
                                className={inputCls}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recado Opcional */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label
                        htmlFor={ids.message}
                        className="block font-sans text-[11px] font-bold tracking-[0.16em] text-royal-navy uppercase"
                      >
                        Recado para a {EVENT.name}{" "}
                        <span className="font-normal tracking-normal lowercase text-slate-500">
                          (opcional)
                        </span>
                      </label>
                      <span className="font-sans text-[10.5px] tabular-nums text-silver-500">
                        {message.length}/280
                      </span>
                    </div>
                    <textarea
                      id={ids.message}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      maxLength={280}
                      placeholder="Deixe uma mensagem especial…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Botão de Envio */}
                  <motion.button
                    type="submit"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-royal-navy px-5 py-3 font-sans text-[13.5px] font-bold tracking-wide text-white shadow-[0_12px_24px_-10px_rgba(7,23,57,0.7)] transition hover:bg-royal-deep"
                  >
                    <MessageCircle className="size-[18px] shrink-0" strokeWidth={2} />
                    <span>Confirmar Presença pelo WhatsApp</span>
                  </motion.button>
                </form>

                {/* Feedback Visual Celebrado de Confirmação após Envio */}
                <AnimatePresence>
                  {submittedRsvp && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      role="status"
                      aria-live="polite"
                      className="mt-5 rounded-xl border border-royal-deep/20 bg-[#EEF2F7] p-4 sm:p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                    >
                      <div className="flex items-center justify-center gap-2 text-royal-navy">
                        <CheckCircle2 className="size-5 shrink-0 text-royal-deep" />
                        <p className="font-serif text-[15px] font-bold">
                          {submittedRsvp.attendance === "yes"
                            ? "Presença registrada com carinho!"
                            : "Confirmação enviada!"}
                        </p>
                      </div>

                      <p className="mt-1.5 font-sans text-[12.5px] text-slate-700">
                        Obrigado, <strong className="text-royal-navy">{submittedRsvp.name}</strong>.{" "}
                        {submittedRsvp.attendance === "yes"
                          ? `Registramos ${submittedRsvp.guests} ${submittedRsvp.guests === 1 ? "pessoa" : "pessoas"
                          }${submittedRsvp.companions.length > 0
                            ? ` (${submittedRsvp.companions.join(", ")})`
                            : ""
                          }.`
                          : "Sentiremos sua falta neste dia especial."}
                      </p>

                      <motion.a
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        href={submittedRsvp.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3.5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-royal-navy px-5 py-2.5 font-sans text-[12px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(7,23,57,0.55)] transition hover:bg-royal-deep"
                      >
                        <CalendarDays className="size-4 shrink-0" />
                        <span>Abrir WhatsApp novamente</span>
                      </motion.a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.section>

            {/* ──────────────────────────────────────────────────────────────────────
                5. RODAPÉ EDITORIAL
               ────────────────────────────────────────────────────────────────────── */}
            <motion.footer
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView={revealed ? "visible" : "hidden"}
              viewport={VIEWPORT_CONFIG}
              className="mt-14 sm:mt-16 flex w-full flex-col items-center"
            >
              <motion.p
                variants={ITEM_VARIANTS}
                className="font-serif text-[22px] sm:text-[26px] font-bold tracking-wide text-royal-navy"
              >
                {EVENT.closingText}
              </motion.p>

              <motion.div
                variants={ITEM_VARIANTS}
                className="mt-4 flex w-full max-w-[300px] items-center gap-3 sm:gap-4"
              >
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
                <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-royal-navy px-5 py-1 font-sans text-[12px] sm:text-[13px] font-bold tracking-[0.2em] text-white shadow-[0_4px_10px_rgba(7,23,57,0.24)]">
                  {FORMATTED_EVENT_DATE.short}
                </span>
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
              </motion.div>
            </motion.footer>
          </main>
        </div>
      </div>
    </div>
  );
}
