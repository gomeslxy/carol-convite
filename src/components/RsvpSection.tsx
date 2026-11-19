"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  HeartCrack,
  MessageCircle,
  Minus,
  Plus,
  Users,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { fireMiniCelebration } from "@/components/LuxuryParticles";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import {
  RSVP_LIMITS,
  isInAppBrowser,
  openExternalUrl,
  sanitizeSingleLineInput,
  sliceUnicode,
  validateRsvpInput,
  whatsappUrl,
} from "@/lib/utils";

const RSVP_COOLDOWN_KEY = "carol-18-rsvp-cooldown-v1";
const RSVP_RECEIPT_KEY = "carol-18-rsvp-receipt-v1";
const RSVP_PENDING_SYNC_KEY = "carol-18-rsvp-pending-sync-v1";
const RSVP_COOLDOWN_MS = 15_000;

type Attendance = "yes" | "no";

interface RsvpErrorField {
  field: "name" | "companion";
  companionIndex?: number;
}

interface CleanRsvpPayload {
  name: string;
  attendance: Attendance;
  guests: number;
  companions: string[];
  message: string;
}

interface SubmittedRsvp extends CleanRsvpPayload {
  whatsappHref: string;
}

const REVEAL_TRANSITION = {
  duration: 1.5,
  ease: [0.16, 1, 0.3, 1],
} as const;

const REVEAL_INITIAL = { opacity: 0, y: 42, scale: 0.94 } as const;
const REVEAL_VISIBLE = { opacity: 1, y: 0, scale: 1 } as const;
const REVEAL_REDUCED_INITIAL = { opacity: 0 } as const;
const REVEAL_REDUCED_VISIBLE = { opacity: 1 } as const;
const REVEAL_REDUCED_TRANSITION = { duration: 0.2 } as const;
const HEADING_VIEWPORT = { once: false, amount: 0.14 } as const;
const INTERACTIVE_VIEWPORT = { once: true, amount: 0.08 } as const;

const CARD_SURFACE_CLS =
  "border border-royal-deep/15 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16),0_4px_12px_-4px_rgba(10,36,99,0.08)]";

const FOCUS_RING_CLS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-deep/25";

const INPUT_CLS =
  "min-h-11 w-full rounded-xl border border-[#0A2463]/20 bg-white/95 px-4 py-2.5 font-sans text-[14.5px] text-royal-navy placeholder:text-silver-500/80 outline-none transition-colors focus:border-royal-deep focus:bg-white focus:ring-4 focus:ring-royal-deep/10";

interface RsvpSectionProps {
  revealed: boolean;
  reducedMotion: boolean;
}

function persistPendingSync(payload: CleanRsvpPayload | null): void {
  try {
    if (payload) {
      window.localStorage.setItem(RSVP_PENDING_SYNC_KEY, JSON.stringify(payload));
    } else {
      window.localStorage.removeItem(RSVP_PENDING_SYNC_KEY);
    }
  } catch {
    /* ambiente sem acesso ao localStorage */
  }
}

async function postRsvpToServer(payload: CleanRsvpPayload): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return false;
  }
  try {
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, honeypot: "" }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

const RsvpSection = memo(function RsvpSection({ revealed, reducedMotion }: RsvpSectionProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const companionInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const radioYesRef = useRef<HTMLButtonElement>(null);
  const radioNoRef = useRef<HTMLButtonElement>(null);
  const submitTimerRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);
  const isMountedRef = useRef(true);

  const ids = {
    name: useId(),
    formError: useId(),
    guests: useId(),
    message: useId(),
    honeypot: useId(),
  };

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [guests, setGuests] = useState(1);
  const [companions, setCompanions] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<RsvpErrorField | null>(null);
  const [submittedRsvp, setSubmittedRsvp] = useState<SubmittedRsvp | null>(null);
  const [pendingSync, setPendingSync] = useState(false);
  const [inApp, setInApp] = useState(false);

  const buildWhatsappHrefFromData = useCallback((data: CleanRsvpPayload) => {
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
  }, []);

  const syncWithRetryQueue = useCallback(async (payload: CleanRsvpPayload) => {
    const ok = await postRsvpToServer(payload);
    if (ok) {
      persistPendingSync(null);
      if (isMountedRef.current) setPendingSync(false);
      return;
    }
    persistPendingSync(payload);
    if (isMountedRef.current) setPendingSync(true);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setInApp(isInAppBrowser());

    const flushPendingSync = () => {
      try {
        const rawPending = window.localStorage.getItem(RSVP_PENDING_SYNC_KEY);
        if (!rawPending) return;
        const parsed: unknown = JSON.parse(rawPending);
        if (typeof parsed !== "object" || parsed === null) {
          persistPendingSync(null);
          return;
        }
        const rec = parsed as Record<string, unknown>;
        const validated = validateRsvpInput({
          name: rec.name,
          attendance: rec.attendance,
          guests: rec.guests,
          companions: rec.companions,
          message: rec.message ?? "",
          maxGuests: EVENT.rsvp.maxGuests,
        });
        if (!validated.ok) {
          persistPendingSync(null);
          return;
        }
        void syncWithRetryQueue(validated.data);
      } catch {
        /* ignora erro de leitura/parse no localStorage */
      }
    };

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
              ...restored.data,
              whatsappHref: buildWhatsappHrefFromData(restored.data),
            });
          }
        }
      }

      if (window.localStorage.getItem(RSVP_PENDING_SYNC_KEY)) {
        setPendingSync(true);
        flushPendingSync();
      }
    } catch {
      /* ambiente sem acesso ao localStorage ou JSON inválido */
    }

    const handleOnline = () => {
      flushPendingSync();
    };
    window.addEventListener("online", handleOnline);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    };
  }, [buildWhatsappHrefFromData, syncWithRetryQueue]);

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

  const updateGuestsCount = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(EVENT.rsvp.maxGuests, next));
      const needed = Math.max(0, clamped - 1);
      companionInputsRef.current.length = needed;
      setGuests(clamped);
      setCompanions((prev) => {
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
    const cleanValue = sliceUnicode(value.replace(/[<>]/g, ""), RSVP_LIMITS.companion);
    setCompanions((prev) => {
      const next = [...prev];
      next[index] = cleanValue;
      return next;
    });
    setFormError((prev) => (prev ? null : prev));
    setErrorField((prev) => (prev ? null : prev));
  }, []);

  const selectAttendance = useCallback(
    (value: Attendance) => {
      setAttendance(value);
      if (value === "no" && errorField?.field === "companion") {
        setFormError(null);
        setErrorField(null);
      }
    },
    [errorField],
  );

  const handleRadioKeyDown = useCallback(
    (current: Attendance, e: KeyboardEvent<HTMLButtonElement>) => {
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        const next: Attendance = current === "yes" ? "no" : "yes";
        selectAttendance(next);
        (next === "yes" ? radioYesRef : radioNoRef).current?.focus();
      }
    },
    [selectAttendance],
  );

  const handleEditSubmitted = useCallback(() => {
    if (!submittedRsvp) return;
    setName(submittedRsvp.name);
    setAttendance(submittedRsvp.attendance);
    if (submittedRsvp.attendance === "yes") {
      const nextGuests = Math.max(1, Math.min(EVENT.rsvp.maxGuests, submittedRsvp.guests));
      setGuests(nextGuests);
      setCompanions(submittedRsvp.companions.slice(0, Math.max(0, nextGuests - 1)));
    }
    setMessage(submittedRsvp.message);
    setFormError(null);
    setErrorField(null);
    nameInputRef.current?.focus();
  }, [submittedRsvp]);

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
        message: "",
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
      window.localStorage.setItem(RSVP_RECEIPT_KEY, JSON.stringify(cleanData));
    } catch {
      /* ambiente sem acesso ao localStorage */
    }

    // Dispara persistência em background com fila offline automática
    void syncWithRetryQueue(cleanData);

    const cleanWhatsappHref = buildWhatsappHrefFromData(cleanData);

    if (cleanData.attendance === "yes" && !reducedMotion) {
      fireMiniCelebration({ x: 0.5, y: 0.72 });
    }

    setSubmittedRsvp({
      ...cleanData,
      whatsappHref: cleanWhatsappHref,
    });

    // Mantém redirecionamento síncrono dentro do gesto do usuário com compatibilidade WebView e fallback real
    openExternalUrl(cleanWhatsappHref, { preferSameTabInApp: true });

    if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    submitTimerRef.current = window.setTimeout(() => {
      isSubmittingRef.current = false;
      if (isMountedRef.current) setIsSubmitting(false);
      submitTimerRef.current = null;
    }, 600);
  };

  const revealInitial = reducedMotion ? REVEAL_REDUCED_INITIAL : REVEAL_INITIAL;
  const revealVisible = reducedMotion ? REVEAL_REDUCED_VISIBLE : REVEAL_VISIBLE;
  const revealTransition = reducedMotion ? REVEAL_REDUCED_TRANSITION : REVEAL_TRANSITION;
  const companionsCount = Math.max(0, guests - 1);
  const messageCharCount = Array.from(message).length;

  return (
    <section
      className="mt-14 sm:mt-16 flex w-full flex-col items-center"
      aria-label="Confirmação de presença"
    >
      <m.div
        initial={revealInitial}
        whileInView={revealed ? revealVisible : revealInitial}
        viewport={HEADING_VIEWPORT}
        transition={revealTransition}
        className="w-full"
      >
        <div className="mx-auto flex w-full max-w-[380px] items-center gap-3 sm:gap-4">
          <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
          <h2 className="whitespace-nowrap font-serif text-[20px] sm:text-[26px] font-bold leading-none tracking-wide text-royal-navy">
            Confirmar Presença
          </h2>
          <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
        </div>
      </m.div>

      <m.p
        initial={revealInitial}
        whileInView={revealed ? revealVisible : revealInitial}
        viewport={HEADING_VIEWPORT}
        transition={reducedMotion ? REVEAL_REDUCED_TRANSITION : { ...REVEAL_TRANSITION, delay: 0.06 }}
        className="mt-3 font-sans text-[12.5px] sm:text-[13.5px] text-royal-navy/75"
      >
        Por gentileza, confirme sua presença até{" "}
        <strong className="font-bold text-royal-navy">{EVENT.rsvp.deadline}</strong>.
      </m.p>

      <m.div
        initial={revealInitial}
        whileInView={revealed ? revealVisible : revealInitial}
        viewport={INTERACTIVE_VIEWPORT}
        transition={reducedMotion ? REVEAL_REDUCED_TRANSITION : { ...REVEAL_TRANSITION, delay: 0.1 }}
        className={`mt-4 w-full rounded-2xl p-5 sm:p-7 text-left ${CARD_SURFACE_CLS}`}
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
            <div className="pointer-events-none absolute inset-1.5 grid grid-cols-2 gap-2" aria-hidden>
              <m.span
                initial={false}
                animate={{ x: attendance === "yes" ? "0%" : "calc(100% + 0.5rem)" }}
                transition={
                  reducedMotion
                    ? { duration: 0.1 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
                className="h-full w-full rounded-lg bg-royal-navy shadow-[0_6px_16px_-6px_rgba(7,23,57,0.65)]"
              />
            </div>

            {(
              [
                { value: "yes", label: "Sim, estarei lá!", Icon: Heart, ref: radioYesRef },
                { value: "no", label: "Não poderei ir", Icon: HeartCrack, ref: radioNoRef },
              ] as const
            ).map(({ value, label, Icon, ref }) => {
              const active = attendance === value;
              return (
                <button
                  key={value}
                  ref={ref}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectAttendance(value)}
                  onKeyDown={(e) => handleRadioKeyDown(value, e)}
                  className={`relative z-10 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-2.5 py-2.5 font-sans text-[12px] sm:text-[13px] font-semibold transition-colors ${FOCUS_RING_CLS} ${
                    active ? "text-white" : "text-royal-navy/75 hover:text-royal-navy"
                  }`}
                >
                  <Icon
                    className="size-4 shrink-0"
                    fill={active && value === "yes" ? "currentColor" : "none"}
                    aria-hidden
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
              maxLength={RSVP_LIMITS.name * 2}
              value={name}
              onChange={(e) => {
                setName(sliceUnicode(e.target.value.replace(/[<>]/g, ""), RSVP_LIMITS.name));
                if (formError) setFormError(null);
                if (errorField) setErrorField(null);
              }}
              placeholder="Digite seu nome completo"
              autoComplete="name"
              aria-invalid={errorField?.field === "name"}
              aria-describedby={errorField?.field === "name" && formError ? ids.formError : undefined}
              className={`${INPUT_CLS} ${
                errorField?.field === "name"
                  ? "border-royal-navy ring-4 ring-royal-deep/15"
                  : ""
              }`}
            />
          </div>

          {/* Quantidade e Nomes dos Acompanhantes */}
          <AnimatePresence initial={false} mode="wait">
            {attendance === "yes" && (
              <m.div
                key="guests-block"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
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
                    role="group"
                    aria-labelledby={ids.guests}
                    className="flex items-center justify-between rounded-xl border border-royal-deep/15 bg-white/95 p-1.5"
                  >
                    <button
                      type="button"
                      aria-label="Diminuir quantidade de pessoas"
                      onClick={() => updateGuestsCount(guests - 1)}
                      disabled={guests <= 1}
                      className={`grid size-11 cursor-pointer place-items-center rounded-lg bg-[#EEF2F7] text-royal-navy transition-[transform,opacity] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING_CLS}`}
                    >
                      <Minus className="size-4" aria-hidden />
                    </button>

                    <span
                      className="relative h-8 w-14 overflow-hidden text-center font-serif text-2xl font-bold tabular-nums text-royal-navy"
                      aria-live="polite"
                    >
                      {reducedMotion ? (
                        <span className="flex size-full items-center justify-center">{guests}</span>
                      ) : (
                        <AnimatePresence initial={false} mode="popLayout">
                          <m.span
                            key={guests}
                            initial={{ y: 14, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -14, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            {guests}
                          </m.span>
                        </AnimatePresence>
                      )}
                    </span>

                    <button
                      type="button"
                      aria-label="Aumentar quantidade de pessoas"
                      onClick={() => updateGuestsCount(guests + 1)}
                      disabled={guests >= EVENT.rsvp.maxGuests}
                      className={`grid size-11 cursor-pointer place-items-center rounded-lg bg-[#EEF2F7] text-royal-navy transition-[transform,opacity] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING_CLS}`}
                    >
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="mt-1.5 font-sans text-[11px] text-royal-navy/70">
                    {companionsCount === 0
                      ? `Somente você • máx. ${EVENT.rsvp.maxGuests} pessoas`
                      : `Você + ${companionsCount} ${
                          companionsCount === 1 ? "acompanhante" : "acompanhantes"
                        } • máx. ${EVENT.rsvp.maxGuests} pessoas`}
                  </p>
                </div>

                {guests > 1 && (
                  <div className="space-y-2.5 rounded-xl border border-royal-deep/15 bg-[#F1F2F4]/85 p-3.5">
                    <div className="flex items-center gap-1.5 font-sans text-[11px] font-bold tracking-[0.14em] text-royal-navy uppercase">
                      <Users className="size-3.5 text-royal-deep" aria-hidden />
                      <span>Nome dos Acompanhantes ({companionsCount})</span>
                    </div>

                    {Array.from({ length: companionsCount }).map((_, idx) => {
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
                          maxLength={RSVP_LIMITS.companion * 2}
                          value={companions[idx] ?? ""}
                          onChange={(e) => handleCompanionChange(idx, e.target.value)}
                          placeholder={`Nome completo do acompanhante ${idx + 1}`}
                          aria-label={`Nome completo do acompanhante ${idx + 1}`}
                          aria-invalid={hasCompError}
                          aria-describedby={
                            hasCompError && formError ? ids.formError : undefined
                          }
                          className={`${INPUT_CLS} ${
                            hasCompError
                              ? "border-royal-navy ring-4 ring-royal-deep/15"
                              : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {/* Alerta de Validação (Nome ou Acompanhantes) */}
          <AnimatePresence>
            {formError && (
              <m.div
                id={ids.formError}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="inline-flex w-full items-center gap-2 rounded-xl border border-silver-300/70 bg-royal-navy px-3.5 py-2.5 font-sans text-[12px] font-medium text-white shadow-sm"
                role="alert"
                aria-atomic="true"
              >
                <AlertCircle className="size-4 shrink-0 text-silver-200" aria-hidden />
                <span>{formError}</span>
              </m.div>
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
              <span
                className={`font-sans text-[10.5px] tabular-nums ${
                  messageCharCount >= 240 ? "font-semibold text-royal-deep" : "text-silver-500"
                }`}
              >
                {messageCharCount}/{RSVP_LIMITS.message}
              </span>
            </div>
            <textarea
              id={ids.message}
              value={message}
              onChange={(e) =>
                setMessage(sliceUnicode(e.target.value.replace(/[<>]/g, ""), RSVP_LIMITS.message))
              }
              rows={2}
              maxLength={RSVP_LIMITS.message * 2}
              placeholder="Deixe uma mensagem especial…"
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          {/* Botão de Envio com trava imediata e cooldown anti-spam */}
          <m.button
            type="submit"
            disabled={isSubmitting || cooldownRemainingSec > 0}
            whileHover={
              reducedMotion || isSubmitting || cooldownRemainingSec > 0 ? undefined : { y: -1 }
            }
            whileTap={
              reducedMotion || isSubmitting || cooldownRemainingSec > 0 ? undefined : { scale: 0.97 }
            }
            className={`flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-royal-navy px-5 py-3 font-sans text-[13.5px] font-bold tracking-wide text-white shadow-[0_12px_24px_-10px_rgba(7,23,57,0.7)] transition-colors hover:bg-royal-deep disabled:cursor-not-allowed disabled:opacity-70 ${FOCUS_RING_CLS}`}
          >
            <MessageCircle className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
            <span>
              {isSubmitting
                ? "Enviando confirmação..."
                : cooldownRemainingSec > 0
                  ? `Aguarde ${cooldownRemainingSec}s para reenviar`
                  : "Confirmar Presença pelo WhatsApp"}
            </span>
          </m.button>
        </form>

        {/* Feedback Visual Celebrado de Confirmação após Envio */}
        <AnimatePresence>
          {submittedRsvp && (
            <m.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              aria-live="polite"
              className="mt-5 rounded-xl border border-royal-deep/20 bg-[#EEF2F7] p-4 sm:p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
            >
              <div className="flex items-center justify-center gap-2 text-royal-navy">
                <CheckCircle2 className="size-5 shrink-0 text-royal-deep" aria-hidden />
                <p className="font-serif text-[15px] font-bold">
                  {submittedRsvp.attendance === "yes"
                    ? "Presença registrada com carinho!"
                    : "Confirmação enviada!"}
                </p>
              </div>

              <p className="mt-1.5 font-sans text-[12.5px] text-royal-navy/85">
                Obrigada, <strong className="text-royal-navy">{submittedRsvp.name}</strong>.{" "}
                {submittedRsvp.attendance === "yes"
                  ? `Registramos ${submittedRsvp.guests} ${
                      submittedRsvp.guests === 1 ? "pessoa" : "pessoas"
                    }${
                      submittedRsvp.companions.length > 0
                        ? ` (${submittedRsvp.companions.join(", ")})`
                        : ""
                    }.`
                  : "Sentiremos sua falta neste dia especial."}
              </p>

              {pendingSync && (
                <p className="mt-2 font-sans text-[11px] font-medium text-royal-deep">
                  Sem conexão no momento — confirmação salva localmente e pronta para enviar pelo WhatsApp.
                </p>
              )}

              <p className="mt-2 font-sans text-[11px] text-royal-navy/65">
                Caso o WhatsApp não abra automaticamente, toque abaixo:
              </p>

              <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <m.a
                  whileHover={reducedMotion ? undefined : { y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  href={submittedRsvp.whatsappHref}
                  onClick={(e) => {
                    if (submittedRsvp.whatsappHref === "#") e.preventDefault();
                  }}
                  target={inApp ? undefined : "_blank"}
                  rel={inApp ? undefined : "noopener noreferrer"}
                  className={`inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-royal-navy px-5 py-2.5 font-sans text-[12px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(7,23,57,0.55)] transition-colors hover:bg-royal-deep ${FOCUS_RING_CLS}`}
                >
                  <MessageCircle className="size-4 shrink-0" aria-hidden />
                  <span>Enviar / Abrir no WhatsApp</span>
                </m.a>

                <button
                  type="button"
                  onClick={handleEditSubmitted}
                  className={`inline-flex min-h-11 w-full sm:w-auto cursor-pointer items-center justify-center rounded-full border border-royal-deep/20 bg-white/90 px-4 py-2 font-sans text-[11.5px] font-semibold text-royal-navy transition-colors hover:border-royal-deep hover:bg-white ${FOCUS_RING_CLS}`}
                >
                  Alterar confirmação
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </section>
  );
});

export default RsvpSection;
