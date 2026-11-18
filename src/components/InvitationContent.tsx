"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
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
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import HeroPoster, {
  GlitterBlueStar,
  MetallicSilverStar,
} from "@/components/HeroPoster";
import { fireMiniCelebration } from "@/components/LuxuryParticles";
import { CornerFiligree } from "@/components/Ornaments";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import {
  RSVP_LIMITS,
  copyToClipboard,
  downloadIcs,
  googleCalendarUrl,
  googleMapsEmbedUrl,
  googleMapsUrl,
  sanitizeSingleLineInput,
  validateRsvpInput,
  wazeUrl,
  whatsappUrl,
} from "@/lib/utils";

const CountdownTimer = dynamic(() => import("@/components/CountdownTimer"));

const RSVP_COOLDOWN_KEY = "carol-18-rsvp-cooldown-v1";
const RSVP_RECEIPT_KEY = "carol-18-rsvp-receipt-v1";
const RSVP_COOLDOWN_MS = 15_000;

type Attendance = "yes" | "no";

interface RsvpErrorField {
  field: "name" | "companion";
  companionIndex?: number;
}

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

const REVEAL_TRANSITION = {
  duration: 1.5,
  ease: [0.16, 1, 0.3, 1],
} as const;

const REVEAL_INITIAL = { opacity: 0, y: 42, scale: 0.94 } as const;
const REVEAL_VISIBLE = { opacity: 1, y: 0, scale: 1 } as const;
const VIEWPORT_CONFIG = { once: false, amount: 0.14 } as const;

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
  const companionInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const ids = {
    name: useId(),
    formError: useId(),
    guests: useId(),
    message: useId(),
    honeypot: useId(),
  };

  // Estados de Agenda, Endereço e Mapa Lazy
  const [icsSaved, setIcsSaved] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const icsTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const submitTimerRef = useRef<number | null>(null);

  // Estados do Formulário RSVP
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [guests, setGuests] = useState(1);
  const [companions, setCompanions] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState(0);
  const isSubmittingRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<RsvpErrorField | null>(null);
  const [submittedRsvp, setSubmittedRsvp] = useState<SubmittedRsvp | null>(null);

  const buildWhatsappHrefFromData = useCallback(
    (data: {
      name: string;
      attendance: Attendance;
      guests: number;
      companions: string[];
      message: string;
    }) => {
      const lines =
        data.attendance === "yes"
          ? [
            `Olá, ${EVENT.name}! 💙 Quero confirmar minha presença na sua festa de ${EVENT.age} anos no dia ${FORMATTED_EVENT_DATE.numeric} às ${FORMATTED_EVENT_DATE.time}!`,
            "",
            `👤 Nome: ${data.name}`,
            `👥 Total de pessoas: ${data.guests}`,
            ...(data.companions.length > 0
              ? [`🎟️ Acompanhantes: ${data.companions.join(", ")}`]
              : []),
          ]
          : [
            `Olá, ${EVENT.name}! Infelizmente não poderei comparecer à sua festa de ${EVENT.age} anos no dia ${FORMATTED_EVENT_DATE.numeric} às ${FORMATTED_EVENT_DATE.time}. 🤍`,
            "",
            `👤 Nome: ${data.name}`,
          ];

      if (data.message) {
        lines.push(`💌 Recado: ${data.message}`);
      }

      return whatsappUrl(EVENT.rsvp.whatsapp, lines.join("\n"));
    },
    [],
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RSVP_COOLDOWN_KEY);
      const parsed = stored ? Number(stored) : 0;
      if (Number.isFinite(parsed) && parsed > Date.now()) {
        setCooldownUntil(parsed);
      }

      const storedReceipt = window.localStorage.getItem(RSVP_RECEIPT_KEY);
      if (storedReceipt) {
        const raw: unknown = JSON.parse(storedReceipt);
        if (typeof raw === "object" && raw !== null) {
          const rec = raw as Record<string, unknown>;
          const restored = validateRsvpInput({
            name: rec.name,
            attendance: rec.attendance,
            guests: rec.guests,
            companions: rec.companions,
            message: rec.message ?? "",
            maxGuests: EVENT.rsvp.maxGuests,
          });
          if (restored.ok) {
            setSubmittedRsvp({
              name: restored.data.name,
              attendance: restored.data.attendance,
              guests: restored.data.guests,
              companions: restored.data.companions,
              whatsappHref: buildWhatsappHrefFromData(restored.data),
            });
          }
        }
      }
    } catch {
      /* ambiente sem acesso ao localStorage ou JSON inválido */
    }

    return () => {
      if (icsTimerRef.current !== null) window.clearTimeout(icsTimerRef.current);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    };
  }, [buildWhatsappHrefFromData]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      setCooldownRemainingSec(0);
      return;
    }

    const syncRemaining = () => {
      const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setCooldownRemainingSec(0);
        setCooldownUntil(0);
        return false;
      }
      setCooldownRemainingSec(remaining);
      return true;
    };

    if (!syncRemaining()) return;

    const intervalId = window.setInterval(() => {
      if (!syncRemaining()) {
        window.clearInterval(intervalId);
      }
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [cooldownUntil]);

  useEffect(() => {
    if (!revealed || shouldLoadMap) return;
    const el = mapContainerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadMap(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, shouldLoadMap]);

  // Mantém o array de nomes de acompanhantes sincronizado com `guests - 1`
  const updateGuestsCount = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(EVENT.rsvp.maxGuests, next));
      setGuests(clamped);
      setCompanions((prev) => {
        const needed = Math.max(0, clamped - 1);
        if (prev.length === needed) return prev;
        if (prev.length > needed) return prev.slice(0, needed);
        return [...prev, ...Array<string>(needed - prev.length).fill("")];
      });
      if (
        errorField?.field === "companion" &&
        typeof errorField.companionIndex === "number" &&
        errorField.companionIndex >= clamped - 1
      ) {
        setFormError(null);
        setErrorField(null);
      }
    },
    [errorField],
  );

  const handleCompanionChange = useCallback((index: number, value: string) => {
    const cleanValue = value.replace(/[<>]/g, "").slice(0, RSVP_LIMITS.companion);
    setCompanions((prev) => {
      const next = [...prev];
      next[index] = cleanValue;
      return next;
    });
    setFormError((prev) => (prev ? null : prev));
    setErrorField((prev) => (prev ? null : prev));
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

  const handleRsvpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    // Honeypot anti-bot: bloqueia silenciosamente com retorno de sucesso falso
    if (honeypot.trim().length > 0) {
      setFormError(null);
      setErrorField(null);
      setSubmittedRsvp({
        name: "Convidado",
        attendance,
        guests: attendance === "yes" ? guests : 0,
        companions: [],
        whatsappHref: "#",
      });
      return;
    }

    const now = Date.now();
    if (cooldownUntil > now) {
      const secs = Math.max(1, Math.ceil((cooldownUntil - now) / 1000));
      setFormError(`Aguarde ${secs}s antes de enviar outra confirmação.`);
      setErrorField(null);
      return;
    }

    const validation = validateRsvpInput({
      name,
      attendance,
      guests,
      companions,
      message,
      maxGuests: EVENT.rsvp.maxGuests,
    });

    if (!validation.ok) {
      setFormError(validation.error);
      setErrorField({
        field: validation.field ?? "name",
        companionIndex: validation.companionIndex,
      });
      if (
        validation.field === "companion" &&
        typeof validation.companionIndex === "number"
      ) {
        companionInputsRef.current[validation.companionIndex]?.focus();
      } else {
        nameInputRef.current?.focus();
      }
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormError(null);
    setErrorField(null);

    const cleanData = validation.data;
    setName(cleanData.name);
    setMessage(cleanData.message);
    if (cleanData.attendance === "yes") {
      setCompanions((prev) =>
        prev.map((item) => sanitizeSingleLineInput(item, RSVP_LIMITS.companion)),
      );
    }

    const nextCooldown = Date.now() + RSVP_COOLDOWN_MS;
    setCooldownUntil(nextCooldown);
    try {
      window.localStorage.setItem(RSVP_COOLDOWN_KEY, String(nextCooldown));
      window.localStorage.setItem(
        RSVP_RECEIPT_KEY,
        JSON.stringify({
          name: cleanData.name,
          attendance: cleanData.attendance,
          guests: cleanData.guests,
          companions: cleanData.companions,
          message: cleanData.message,
        }),
      );
    } catch {
      /* ambiente sem acesso ao localStorage */
    }

    void fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cleanData, honeypot: "" }),
      keepalive: true,
    }).catch(() => undefined);

    const cleanWhatsappHref = buildWhatsappHrefFromData(cleanData);

    if (cleanData.attendance === "yes") {
      fireMiniCelebration({ x: 0.5, y: 0.72 });
    }

    setSubmittedRsvp({
      name: cleanData.name,
      attendance: cleanData.attendance,
      guests: cleanData.guests,
      companions: cleanData.companions,
      whatsappHref: cleanWhatsappHref,
    });

    window.open(cleanWhatsappHref, "_blank", "noopener,noreferrer");

    if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    submitTimerRef.current = window.setTimeout(() => {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      submitTimerRef.current = null;
    }, 600);
  };

  const inputCls =
    "min-h-11 w-full rounded-xl border border-[#0A2463]/20 bg-white/95 px-4 py-2.5 font-sans text-[14.5px] text-royal-navy placeholder:text-silver-400 outline-none transition-colors focus:border-royal-deep focus:bg-white focus:ring-4 focus:ring-royal-deep/10";

  const cardSurfaceCls =
    "border border-royal-deep/15 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16),0_4px_12px_-4px_rgba(10,36,99,0.08)]";

  const focusRingCls =
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-deep/25";

  return (
    <div
      data-active={revealed ? "true" : "false"}
      inert={!revealed}
      className={`relative mx-auto w-full md:max-w-2xl lg:max-w-[700px] md:rounded-[28px] md:bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(148,163,184,0.48)_50%,rgba(255,255,255,0.9)_100%)] md:p-[1.5px] ${revealed ? "pointer-events-auto" : "pointer-events-none"
        }`}
    >
      {/* Fundo único contínuo em papel texturizado claro (#F1F2F4) do topo do pôster até o rodapé */}
      <div className="bg-poster-paper relative isolate min-h-dvh md:min-h-0 w-full overflow-x-clip md:rounded-[26px] shadow-[0_32px_70px_-14px_rgba(7,23,57,0.30),0_14px_30px_-8px_rgba(10,36,99,0.14)]">
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
          {/* Estrelas laterais estáticas nas margens externas (zero repaints no scroll) */}
          <GlitterBlueStar
            animClass=""
            className="absolute top-10 -left-2 sm:top-12 sm:left-4 z-[2] w-[30px] sm:w-[50px] -rotate-12 opacity-85 sm:opacity-95"
          />
          <MetallicSilverStar
            animClass=""
            className="absolute top-28 -right-2 sm:top-32 sm:right-4 z-[2] w-[28px] sm:w-[46px] rotate-12 opacity-85 sm:opacity-95"
          />

          <MetallicSilverStar
            animClass=""
            className="absolute top-[37%] -left-2 sm:left-4 z-[2] w-[28px] sm:w-[48px] -rotate-6 opacity-80 sm:opacity-90"
          />
          <GlitterBlueStar
            animClass=""
            className="absolute top-[42%] -right-2 sm:right-4 z-[2] w-[32px] sm:w-[54px] rotate-12 opacity-85 sm:opacity-95"
          />

          <GlitterBlueStar
            animClass=""
            className="absolute bottom-44 -left-2 sm:bottom-52 sm:left-4 z-[2] w-[32px] sm:w-[52px] -rotate-12 opacity-85 sm:opacity-95"
          />
          <MetallicSilverStar
            animClass=""
            className="absolute bottom-24 -right-2 sm:bottom-28 sm:right-4 z-[2] w-[28px] sm:w-[46px] rotate-6 opacity-85 sm:opacity-95"
          />

          <main className="relative z-[5] mx-auto flex w-full max-w-[540px] flex-col items-center px-5 sm:px-10 text-center">
            {/* ──────────────────────────────────────────────────────────────────────
                2. APRESENTAÇÃO & CONTAGEM REGRESSIVA
               ────────────────────────────────────────────────────────────────────── */}
            <section
              className="flex w-full flex-col items-center"
              aria-label="Apresentação e contagem regressiva"
            >
              {/* Pílula Azul-Marinho CAROL • 18 ANOS ladeada por linhas */}
              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={REVEAL_TRANSITION}
                className="flex w-full max-w-[360px] items-center gap-3 sm:gap-4"
              >
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
                <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-royal-navy px-5 py-1.5 sm:px-7 font-sans text-[11.5px] sm:text-[13px] font-bold tracking-[0.22em] text-white uppercase shadow-[0_6px_14px_rgba(7,23,57,0.24)]">
                  {EVENT.name.toUpperCase()} • {EVENT.age} ANOS
                </span>
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
              </motion.div>

              {/* Citação de Walt Disney em cartão editorial com cantoneiras e filete interno */}
              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={REVEAL_TRANSITION}
                className={`relative mt-7 w-full max-w-[460px] rounded-2xl px-6 py-7 sm:px-9 sm:py-8 ${cardSurfaceCls}`}
              >
                <div
                  className="pointer-events-none absolute inset-2.5 rounded-xl border border-royal-deep/10"
                  aria-hidden
                />
                <CornerFiligree
                  position="tl"
                  tone="slate"
                  className="absolute top-2.5 left-2.5 size-8 sm:size-10 opacity-45"
                />
                <CornerFiligree
                  position="tr"
                  tone="slate"
                  className="absolute top-2.5 right-2.5 size-8 sm:size-10 opacity-45"
                />

                <div
                  className="relative mb-3.5 flex items-center justify-center gap-2.5 text-royal-deep/50"
                  aria-hidden
                >
                  <span className="h-px w-8 bg-royal-deep/25" />
                  <span className="text-[11px] leading-none">✦</span>
                  <span className="h-px w-8 bg-royal-deep/25" />
                </div>

                <blockquote className="relative font-sans text-[14.5px] sm:text-[16px] font-normal italic leading-[1.8] tracking-[0.01em] text-royal-navy/90">
                  {EVENT.quoteText}
                </blockquote>

                <div className="relative mt-4 flex items-center justify-center gap-3">
                  <span className="h-px w-7 bg-royal-deep/30" />
                  <cite className="font-serif text-[10.5px] sm:text-[11.5px] font-bold not-italic tracking-[0.2em] text-royal-deep uppercase">
                    {EVENT.quoteAuthor}
                  </cite>
                  <span className="h-px w-7 bg-royal-deep/30" />
                </div>
              </motion.div>

              {/* Mensagem pessoal de convite destacada fora da citação */}
              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={{ ...REVEAL_TRANSITION, delay: 0.1 }}
                className="mt-6 w-full max-w-[410px] px-2"
              >
                <p className="font-sans text-[14px] sm:text-[15.5px] font-semibold leading-[1.7] text-royal-navy">
                  {EVENT.openingText}
                </p>
                <span
                  className="mx-auto mt-4 block h-[1.5px] w-16 bg-gradient-to-r from-transparent via-royal-deep/45 to-transparent"
                  aria-hidden
                />
              </motion.div>

              {/* Contador ao vivo no estilo do pôster */}
              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={REVEAL_TRANSITION}
                className="mt-9 flex w-full justify-center"
              >
                <CountdownTimer active={revealed} />
              </motion.div>

              {/* Ações rápidas de Calendário */}
              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={{ ...REVEAL_TRANSITION, delay: 0.08 }}
                className="mt-5 grid w-full max-w-[360px] grid-cols-2 gap-2.5"
              >
                <motion.a
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  href={googleCalendarUrl(EVENT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-royal-deep/20 bg-white/85 px-3 py-2 font-sans text-[11.5px] sm:text-[12px] font-semibold text-royal-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_-6px_rgba(7,23,57,0.18)] transition-colors hover:border-royal-deep hover:bg-white ${focusRingCls}`}
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
                  className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 font-sans text-[11.5px] sm:text-[12px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_-6px_rgba(7,23,57,0.18)] transition-colors ${focusRingCls} ${icsSaved
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
            </section>

            {/* ──────────────────────────────────────────────────────────────────────
                3. LOCAL DA FESTA
               ────────────────────────────────────────────────────────────────────── */}
            <section
              className="mt-14 sm:mt-16 flex w-full flex-col items-center"
              aria-label="Local da festa"
            >
              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={REVEAL_TRANSITION}
                className="w-full"
              >
                <SectionHeading title="Local da Festa" />
              </motion.div>

              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={{ ...REVEAL_TRANSITION, delay: 0.08 }}
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

                <p className="mt-2 font-sans text-[13.5px] sm:text-[14.5px] font-medium leading-relaxed text-royal-navy/80">
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

                {/* Mapa Embed com contenção estrita de layout/paint e carregamento lazy por proximidade */}
                <div
                  ref={mapContainerRef}
                  style={{ contain: "strict" }}
                  className="mt-5 h-52 sm:h-60 overflow-hidden rounded-xl border border-royal-deep/15 bg-silver-100 shadow-sm"
                >
                  {shouldLoadMap ? (
                    <iframe
                      title={`Mapa — ${EVENT.venue.name}`}
                      src={googleMapsEmbedUrl(EVENT.venue.mapsQuery)}
                      className="block size-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-silver-100 font-sans text-[12px] font-medium text-royal-navy/60">
                      Carregando mapa…
                    </div>
                  )}
                </div>

                {/* Botões funcionais: Google Maps, Waze e Copiar Endereço */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <motion.a
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    href={googleMapsUrl(EVENT.venue.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-royal-navy px-3 py-2.5 font-sans text-[12.5px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(7,23,57,0.6)] transition-colors hover:bg-royal-deep ${focusRingCls}`}
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
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-royal-deep px-3 py-2.5 font-sans text-[12.5px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(10,36,99,0.55)] transition-colors hover:bg-royal-800 ${focusRingCls}`}
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
                    className={`col-span-2 sm:col-span-1 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 font-sans text-[12.5px] font-semibold transition-colors ${focusRingCls} ${copiedAddress
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
            </section>

            {/* ──────────────────────────────────────────────────────────────────────
                4. CONFIRMAÇÃO DE PRESENÇA / RSVP
               ────────────────────────────────────────────────────────────────────── */}
            <section
              className="mt-14 sm:mt-16 flex w-full flex-col items-center"
              aria-label="Confirmação de presença"
            >
              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={REVEAL_TRANSITION}
                className="w-full"
              >
                <SectionHeading title="Confirmar Presença" />
              </motion.div>

              <motion.p
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={{ ...REVEAL_TRANSITION, delay: 0.06 }}
                className="mt-3 font-sans text-[12.5px] sm:text-[13.5px] text-royal-navy/75"
              >
                Por gentileza, confirme sua presença até{" "}
                <strong className="font-bold text-royal-navy">{EVENT.rsvp.deadline}</strong>.
              </motion.p>

              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={{ ...REVEAL_TRANSITION, delay: 0.1 }}
                className={`mt-4 w-full rounded-2xl p-5 sm:p-7 text-left ${cardSurfaceCls}`}
              >
                <form onSubmit={handleRsvpSubmit} className="relative space-y-4" noValidate>
                  {/* Campo Honeypot anti-bot (oculto visualmente e fora da tabulação) */}
                  <div
                    className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
                    aria-hidden="true"
                  >
                    <label htmlFor={ids.honeypot}>Website</label>
                    <input
                      id={ids.honeypot}
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Seletor de Presença (indicador deslizante 100% GPU via transform) */}
                  <div
                    className="relative grid grid-cols-2 gap-2 rounded-xl border border-royal-deep/15 bg-[#EEF2F7] p-1.5"
                    role="radiogroup"
                    aria-label="Confirmação de presença"
                  >
                    <div
                      className="pointer-events-none absolute inset-1.5 grid grid-cols-2 gap-2"
                      aria-hidden
                    >
                      <motion.span
                        initial={false}
                        animate={{ x: attendance === "yes" ? "0%" : "calc(100% + 0.5rem)" }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        className="h-full w-full rounded-lg bg-royal-navy shadow-[0_6px_16px_-6px_rgba(7,23,57,0.65)]"
                      />
                    </div>

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
                          onClick={() => {
                            setAttendance(value);
                            if (value === "no" && errorField?.field === "companion") {
                              setFormError(null);
                              setErrorField(null);
                            }
                          }}
                          className={`relative z-10 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-2.5 py-2.5 font-sans text-[12px] sm:text-[13px] font-semibold transition-colors ${focusRingCls} ${active ? "text-white" : "text-royal-navy/75 hover:text-royal-navy"
                            }`}
                        >
                          <Icon
                            className="size-4 shrink-0"
                            fill={active && value === "yes" ? "currentColor" : "none"}
                          />
                          <span>{label}</span>
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
                      type="text"
                      required
                      maxLength={RSVP_LIMITS.name}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value.replace(/[<>]/g, "").slice(0, RSVP_LIMITS.name));
                        if (formError) setFormError(null);
                        if (errorField) setErrorField(null);
                      }}
                      placeholder="Digite seu nome completo"
                      autoComplete="name"
                      aria-invalid={errorField?.field === "name"}
                      aria-describedby={errorField?.field === "name" && formError ? ids.formError : undefined}
                      className={`${inputCls} ${
                        errorField?.field === "name"
                          ? "border-royal-navy ring-4 ring-royal-deep/15"
                          : ""
                      }`}
                    />
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
                              className={`grid size-11 cursor-pointer place-items-center rounded-lg bg-[#EEF2F7] text-royal-navy transition-[transform,opacity] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRingCls}`}
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
                              className={`grid size-11 cursor-pointer place-items-center rounded-lg bg-[#EEF2F7] text-royal-navy transition-[transform,opacity] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRingCls}`}
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

                            {Array.from({ length: guests - 1 }).map((_, idx) => {
                              const hasCompError =
                                errorField?.field === "companion" &&
                                errorField.companionIndex === idx;
                              return (
                                <input
                                  key={`companion-${idx}`}
                                  ref={(el) => {
                                    companionInputsRef.current[idx] = el;
                                  }}
                                  type="text"
                                  required
                                  maxLength={RSVP_LIMITS.companion}
                                  value={companions[idx] ?? ""}
                                  onChange={(e) => handleCompanionChange(idx, e.target.value)}
                                  placeholder={`Nome completo do acompanhante ${idx + 1}`}
                                  aria-label={`Nome completo do acompanhante ${idx + 1}`}
                                  aria-invalid={hasCompError}
                                  aria-describedby={
                                    hasCompError && formError ? ids.formError : undefined
                                  }
                                  className={`${inputCls} ${
                                    hasCompError
                                      ? "border-royal-navy ring-4 ring-royal-deep/15"
                                      : ""
                                  }`}
                                />
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Alerta de Validação (Nome ou Acompanhantes) */}
                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        id={ids.formError}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex w-full items-center gap-2 rounded-xl border border-silver-300/70 bg-royal-navy px-3.5 py-2.5 font-sans text-[12px] font-medium text-white shadow-sm"
                        role="alert"
                      >
                        <AlertCircle className="size-4 shrink-0 text-silver-200" />
                        <span>{formError}</span>
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
                        <span className="font-normal tracking-normal lowercase text-silver-500">
                          (opcional)
                        </span>
                      </label>
                      <span className="font-sans text-[10.5px] tabular-nums text-silver-500">
                        {message.length}/{RSVP_LIMITS.message}
                      </span>
                    </div>
                    <textarea
                      id={ids.message}
                      value={message}
                      onChange={(e) =>
                        setMessage(e.target.value.replace(/[<>]/g, "").slice(0, RSVP_LIMITS.message))
                      }
                      rows={2}
                      maxLength={RSVP_LIMITS.message}
                      placeholder="Deixe uma mensagem especial…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Botão de Envio com trava imediata e cooldown anti-spam */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || cooldownRemainingSec > 0}
                    whileHover={isSubmitting || cooldownRemainingSec > 0 ? undefined : { y: -1 }}
                    whileTap={isSubmitting || cooldownRemainingSec > 0 ? undefined : { scale: 0.97 }}
                    className={`flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-royal-navy px-5 py-3 font-sans text-[13.5px] font-bold tracking-wide text-white shadow-[0_12px_24px_-10px_rgba(7,23,57,0.7)] transition-colors hover:bg-royal-deep disabled:cursor-not-allowed disabled:opacity-70 ${focusRingCls}`}
                  >
                    <MessageCircle className="size-[18px] shrink-0" strokeWidth={2} />
                    <span>
                      {isSubmitting
                        ? "Enviando confirmação..."
                        : cooldownRemainingSec > 0
                          ? `Aguarde ${cooldownRemainingSec}s para reenviar`
                          : "Confirmar Presença pelo WhatsApp"}
                    </span>
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

                      <p className="mt-1.5 font-sans text-[12.5px] text-royal-navy/85">
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
                        onClick={(e) => {
                          if (submittedRsvp.whatsappHref === "#") e.preventDefault();
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3.5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-royal-navy px-5 py-2.5 font-sans text-[12px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(7,23,57,0.55)] transition-colors hover:bg-royal-deep ${focusRingCls}`}
                      >
                        <MessageCircle className="size-4 shrink-0" />
                        <span>Abrir WhatsApp novamente</span>
                      </motion.a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </section>

            {/* ──────────────────────────────────────────────────────────────────────
                5. RODAPÉ EDITORIAL
               ────────────────────────────────────────────────────────────────────── */}
            <footer className="mt-14 sm:mt-16 flex w-full flex-col items-center">
              <motion.p
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={REVEAL_TRANSITION}
                className="font-serif text-[22px] sm:text-[26px] font-bold tracking-wide text-royal-navy"
              >
                {EVENT.closingText}
              </motion.p>

              <motion.div
                initial={REVEAL_INITIAL}
                whileInView={revealed ? REVEAL_VISIBLE : REVEAL_INITIAL}
                viewport={VIEWPORT_CONFIG}
                transition={{ ...REVEAL_TRANSITION, delay: 0.1 }}
                className="mt-4 flex w-full max-w-[300px] items-center gap-3 sm:gap-4"
              >
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
                <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-royal-navy px-5 py-1 font-sans text-[12px] sm:text-[13px] font-bold tracking-[0.2em] text-white shadow-[0_4px_10px_rgba(7,23,57,0.24)]">
                  {FORMATTED_EVENT_DATE.short}
                </span>
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
              </motion.div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
