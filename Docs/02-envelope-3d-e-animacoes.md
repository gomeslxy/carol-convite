---
title: 02 - Envelope 3D e Animações
aliases:
  - Envelope 3D
  - Máquina de Estados
  - Lenis e GSAP
tags:
  - animacoes
  - css-3d
  - gsap
  - framer-motion
  - lenis
status: active
updated: 2026-11-13
related:
  - "[[00-INDEX]]"
  - "[[01-arquitetura-e-estrutura]]"
  - "[[06-aprendizados-e-troubleshooting]]"
---

# 02 · Envelope 3D e Animações

> [!important] Princípio de Performance 60fps
> Toda a coreografia 3D e os adesivos flutuantes operam exclusivamente sobre `transform` (`translate3d`, `scale`, `rotateX`, `rotateY`) e `opacity`, sem animar `filter: blur(...)`, `height: "auto"` ou propriedades de layout.

---

## Máquina de Estados (`InvitationExperience` + `Envelope3DOpening`)

`InvitationExperience.tsx` gerencia o ciclo de vida macro (`Stage = "closed" | "opening" | "open"`), enquanto `Envelope3DOpening.tsx` executa a coreografia interna determinística (`OpeningPhase`) orquestrada por uma **única `gsap.timeline()`** protegida por trava síncrona `isOpeningRef = useRef(false)`.

```mermaid
stateDiagram-v2
    [*] --> idle : "Stage: closed (Scroll travado)"
    idle --> unsealing : "Clique / Enter / Espaço (isOpeningRef = true)"
    unsealing --> flap_open : "0.18s — Aba inicia rotateX(180deg)"
    flap_open --> extracting : "0.44s Confete | 0.46s Aba z-back | 0.52s Carta sobe"
    extracting --> centering : "1.12s — Envelope desce e carta centraliza"
    centering --> expanding : "1.68s — onOpenStart() -> Stage: opening"
    expanding --> open : "2.34s — onOpenComplete() -> Stage: open (Lenis liberado)"
    open --> [*]
```

* Se `prefers-reduced-motion: reduce` estiver ativo no sistema operacional, a abertura salta diretamente para `expanding` e libera o scroll em `0.25s`.

---

## Arquitetura 3D Real e Planos `translateZ`

O container da cena 3D utiliza `perspective: 1200px` e `transformStyle: "preserve-3d"`. Para evitar *z-fighting* no Safari/WebKit, cada camada ocupa um plano explícito no eixo Z:

| Camada | Elemento | `translateZ` | Função |
| :--- | :--- | :--- | :--- |
| Piso | Sombra projetada | `-12px` | Profundidade no plano de fundo (gradiente radial puro sem `blur-xl`) |
| Camada 1 | Cavidade traseira + Forro (`cavity-liner`) | `-2px` | Fundo escuro Azul Royal com trama geométrica prateada |
| Camada 2 | Folha interna do convite (montada quando `!isIdle`) | `2px` -> `14px` | Sobe na extração com sombra dinâmica e vem para frente na centralização |
| Camada 3 | Bolso frontal SVG + oclusão de dobras + sombra da aba | `6px` | Dobras laterais/inferior sombreadas, reflexo diagonal leve e destinatário |
| Camada 4 | Aba superior triangular (`flap-liner` no verso) | `8px` -> `-1px` | Rotaciona `180deg`, revela forro interno prateado e recua atrás da carta aos `0.46s` |
| Camada 5 | Selo de joalheria `"C · 18"` + `<Bow variant="silver" />` | `18px` | Selo com aro chanfrado, tração magnética isolada e ondas de choque duplas ao abrir |

---

## Paralaxe Desktop, Selo Magnético e Reflexo Especular

* **Desktop (Ponteiro Mouse/Pen):** `onPointerMove` (ignorando `e.pointerType === "touch"`) atualiza `useMotionValue` (`pointerX`, `pointerY`), suavizados via `useSpring` (`stiffness: 150, damping: 20, mass: 0.65`) para inclinar o envelope (`rotateX: ±10deg`, `rotateY: ±13deg`). O listener `deviceorientation` e a geração dinâmica de string `glareBackground` foram removidos para eliminar recomposições contínuas de molas físicas e repaints no mobile; o bolso frontal exibe um reflexo diagonal estático leve.
* **Tração Magnética no Selo:** `sealRawX` / `sealRawY` suavizados por `useSpring` (`stiffness: 220, damping: 18`) deslocam sutilmente o selo (`±7px`) em direção ao cursor no desktop dentro de um `<motion.div>` filho aninhado ao wrapper estático `translateZ(18px)` (evitando que o Framer Motion sobrescreva o plano 3D no WebKit; veja [[06-aprendizados-e-troubleshooting#^framer-translatez|Troubleshooting]]).
* **Reflexo Especular na Carta (`InvitationContent.tsx` & `globals.css`):** A camada `.interactive-sheen::before` utiliza um gradiente radial estático de joalheria no topo de cada cartão acetinado, sem listeners de `scroll`/`pointermove` nem mutações de variáveis CSS no elemento raiz (eliminando recálculo global de estilo durante o scroll mobile).

---

## Confetes, Micro-Celebração & Poeira Estelar GPU (`LuxuryParticles.tsx`)

* `fireLuxuryCelebration` importa `canvas-confetti` sob demanda (pré-carregado no mount de `Envelope3DOpening`), cria formas vetoriais customizadas (`shapeFromPath` para estrela de 4 pontas `✦` e cristal lapidado), adapta `particleCount` e `ticks` no mobile (`window.innerWidth < 768`) sem `setInterval` contínuo durante a expansão da carta, e retorna uma função de **cleanup** que cancela o `setTimeout` imediatamente caso o componente seja desmontado.
* `fireMiniCelebration` dispara um burst compacto (`particleCount: 28`, `zIndex: 90`) em Azul Royal & Prata ao confirmar presença (`RsvpSheet.tsx`).
* `AmbientSparkles` combina 6 estrelas cintilantes (`SPARKLE_POINTS`, `.animate-twinkle`) com 6 partículas de poeira estelar (`STARDUST_MOTES`, `.animate-stardust` / `@keyframes stardust-drift` em `translate3d` + `opacity` sem `box-shadow` nem `will-change` permanente).

---

## Lenis Smooth Scroll, ScrollTrigger & Rolagem 3D no Contador

* `SmoothScrollProvider` divide o estado em dois contextos:
  * `ScrollLockContext` (`lock`, `unlock` estáveis via `useCallback`): consumido por `useScrollLock(active)` em `Envelope3DOpening.tsx` e `Sheet.tsx` sem causar re-renders quando a instância `lenis` é criada.
  * `SmoothScrollContext`: expõe `lenis` junto com `lock`/`unlock`.
* Um contador interno `lockCount` suporta travas aninhadas (envelope + modais), alternando a classe `html.scroll-locked` e `lenis.stop()` / `lenis.start()`.
* O ticker do GSAP (`gsap.ticker.add(tick)`) dirige o `lenis.raf(time * 1000)` e sincroniza `ScrollTrigger.update`, com `ScrollTrigger.refresh()` acionado assim que `stage === "open"` e após alternar o seletor `"Salvar na Agenda"`.
* Em `CountdownTimer.tsx`, o hook `useCountdown(target, active)` recebe `active={revealed}` (iniciando o tick de 1s apenas após a abertura do envelope), enquanto `RollingDigit` anima a troca numérica com rolagem vertical 3D em GPU (`rotateX: ±38deg` + `translateY` dentro de `perspective: 420px`) usando `[text-shadow:...]` em vez de `filter: blur` ou `drop-shadow`.

---

## Animações Contínuas em CSS GPU (`InvitationContent` & `CarolHeroCollage`)

Os adesivos decorativos e a poeira estelar usam classes CSS puras (`animate-sticker-float`, `animate-sticker-float-alt`, `animate-sticker-sway`, `animate-stardust` em `src/app/globals.css`) configuradas por variáveis CSS (`--float-duration`, `--ty`, `--r-start`, `--r-mid`, `--stardust-duration`, `--stardust-x`, `--stardust-y`). Enquanto `revealed === false`, o atributo `data-active="false"` pausa todas as animações decorativas via `animation-play-state: paused` e libera camadas GPU com `will-change: auto !important;`. Os adesivos abaixo da dobra inicial utilizam `loading="lazy"`.

Veja também: [[01-arquitetura-e-estrutura]], [[03-design-system-e-responsividade]], [[06-aprendizados-e-troubleshooting]].

