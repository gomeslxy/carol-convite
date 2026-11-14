---
title: 05 - Changelog e Decisões (ADRs)
aliases:
  - Changelog
  - ADRs
  - Decisões Arquiteturais
tags:
  - adr
  - changelog
  - refatoracao
status: active
updated: 2026-11-14
related:
  - "[[00-INDEX]]"
  - "[[01-arquitetura-e-estrutura]]"
  - "[[02-envelope-3d-e-animacoes]]"
  - "[[06-aprendizados-e-troubleshooting]]"
---

# 05 · Changelog e Decisões Arquiteturais (ADRs)

> [!info] Registro Vivo de Decisões
> Toda alteração significativa de arquitetura, estado, performance ou UI/UX deve ser registrada aqui em ordem cronológica reversa.

---

## [2026-11-14] · Polimento de Produção, Horário Oficial 19:30 e SEO/Open Graph

### ADR-014: Horário Oficial 19:30, Autoria Oficial e Pacote Completo de SEO/OG/Ícones
* **Motivação:** Preparação final de lançamento público para `https://convitecarol.site`.
* **Alterações:**
  * Atualizado `EVENT.dateISO` em `src/config/event.ts` para `"2027-07-17T19:30:00-03:00"`, propagando automaticamente para a interface, contador regressivo, links do Google Agenda e geração de `.ics`.
  * Configurada autoria oficial (`Lucas Gomes do Amaral`, `@gomeslxy`, `la181009@gmail.com`, `https://github.com/gomeslxy`) em `package.json`, `README.md` e `metadata` (`authors`, `creator`, `publisher`) em `src/app/layout.tsx`.
  * Atualizados `title` (`Carol — 18 Anos | Convite Oficial` com `template`), `description`, `openGraph` e `twitter` em `src/app/layout.tsx`.
  * Criados `src/app/icon.tsx` (64x64), `src/app/apple-icon.tsx` (180x180) e `src/app/opengraph-image.tsx` (1200x630 via `next/og`) na paleta Azul Royal e Prata com laço minimalista e monograma `"C"`.
  * Criados `src/app/robots.ts` e `src/app/sitemap.ts` apontando para `https://convitecarol.site`.

---

## [2026-11-13] · Atualização do Endereço do Evento

### ADR-013: Atualização do Endereço Oficial em Indaiatuba - SP
* **Motivação:** Definição do endereço do local do evento informado pelo usuário.
* **Alteração:** Atualizado `venue.address` e `venue.mapsQuery` em `src/config/event.ts` para `"Alameda José Boldrini - Bairro Videiras, Indaiatuba - SP"`, refletindo automaticamente no `LocationSheet.tsx` (cartão de endereço copiável, links de rotas Google Maps/Waze e iframe embed) e documentado em `Docs/00-visao-geral-e-identidade.md`.

---

## [2026-11-13] · Sprint de Performance 60fps & Remoção Definitiva de Presentes/Pix

### ADR-011: Remoção Definitiva de Sugestões de Presentes e Chave Pix (Regra Inviolável)
* **Problema:** O convite incluía um 3º medalhão (`SUGESTÕES DE PRESENTES`), o modal `GiftsSheet.tsx`, dados de chave Pix/lista de presentes em `src/config/event.ts` e o ícone `HollowGiftIcon` em `InteractiveActions.tsx`, considerados inconvenientes para o evento.
* **Decisão:** Remover 100% dos arquivos, tipos, configurações, ícones e menções a presentes e Pix (`GiftsSheet.tsx` deletado; `EVENT.gifts`, `GiftSuggestion`, `GiftSuggestionIcon` e `HollowGiftIcon` removidos). Reequilibrar `InteractiveActions.tsx` com os 2 medalhões restantes (`LOCAL DA FESTA` à esquerda e `CONFIRMAR PRESENÇA` à direita) em container `max-w-[356px] sm:max-w-[400px]` e registrar a proibição permanente em `AGENTS.md`, `GEMINI.md` e `Docs/`.

### ADR-012: Otimização Extrema de Performance Mobile 60fps (Eliminação de `<feTurbulence>`, `backdrop-filter` em Massa, `mix-blend-mode` Fullscreen e Repaints no Scroll)
* **Problema:** O acúmulo de efeitos visuais drenava CPU/GPU no Safari/iOS e Android:
  1. `--satin-noise` (`<feTurbulence>` em SVG data-URI) forçava rasterização em software nas superfícies e camadas `preserve-3d`.
  2. Mais de 10 instâncias simultâneas de `glass-royal-card` (`backdrop-filter: blur(12px)`) combinadas com mutação contínua de `--sheen-x`/`--sheen-y` no `rootRef` durante `scroll`/`pointermove` causavam recálculo de estilo e *backdrop blur* por frame.
  3. `.satin-sheen::after` animava uma camada gigante com `mix-blend-mode: soft-light` em tela cheia, e `animate-shimmer` animava `background-position` sobre textos gigantes (`"Carol"`, `"17"`) com `filter: drop-shadow` e `background-clip: text`.
  4. No `Envelope3DOpening.tsx`, havia loop infinito JS `y: [0, -8, 0]` em todo o container 3D, listener `deviceorientation` a 60Hz no mobile, `glareBackground` recriando strings de gradiente a cada frame, `blur-xl` na sombra de piso e `drop-shadow` em SVGs `preserve-3d`.
  5. `CountdownTimer` rodava ticks de 1s enquanto o envelope estava fechado, `fireLuxuryCelebration` mantinha um `setInterval` de 2.3s concorrente com a abertura da carta, e `AmbientSparkles` usava excesso de nós com `box-shadow` e `will-change`.
* **Decisão:**
  * Substituir `--satin-noise` e SVG `--linen-grain` por `--linen-grain` em CSS `repeating-linear-gradient` puro.
  * Remover `backdrop-filter` de `glass-royal-card`, `glass-pearl-pill`, badge de traje e overlay mobile do `Sheet.tsx` (mantido apenas `md:backdrop-blur-sm` no desktop), preservando a estética acetinada via gradientes multicamada e bordas especulares, e tornando `.interactive-sheen::before` estático sem listeners de `scroll`/`pointermove`.
  * Remover `.satin-sheen::after`, `animate-shimmer` e `filter: drop-shadow` de `.text-silver-luxury`.
  * Remover `deviceorientation`, `glareBackground`, loop infinito JS `y: [0, -8, 0]`, `blur-xl` (também removido em `CarolHeroCollage.tsx`), texturas inline e `drop-shadow` de SVGs no `Envelope3DOpening.tsx`; restringir `handlePointerMove` a ponteiro não-touch e montar o conteúdo da Camada 2 apenas quando `!isIdle`.
  * Gating de `CountdownTimer` via prop `active={revealed}` e troca de `drop-shadow` por `[text-shadow:...]` em `RollingDigit`; `loading="lazy"` e `drop-shadow` reduzido nos adesivos de `InvitationContent.tsx`; calibração mobile de `fireLuxuryCelebration` sem `setInterval` e redução de `AmbientSparkles` para 6+6 elementos sem `box-shadow`; remoção de `grayscale-[35%]` no `<iframe>` de `LocationSheet.tsx` e remoção de `gsap.ticker.lagSmoothing(0)` em `SmoothScrollProvider.tsx`.

---

## [2026-11-13] · Elevação UI/UX Awwwards-Level

### ADR-007: Envelope Físico de Alta Papelaria & Selo Magnético Isolado do Plano `translateZ`
* **Problema:** O envelope anterior utilizava polígonos chapados sem textura de linho, forro interno ou sombra projetada da aba, e o selo não respondia magneticamente ao ponteiro. Além disso, aplicar `x`/`y` (`MotionValue`) no mesmo elemento de `translateZ(18px)` faz o Framer Motion sobrescrever o eixo Z no WebKit.
* **Decisão:** Adicionar textura `--linen-grain`, forro geométrico prateado (`cavity-liner` e `flap-liner`), oclusão de dobras diagonais, sombra projetada da aba superior, legenda em pílula `glass-pearl-pill`, ondas de choque duplas na quebra do lacre e selo chanfrado `"C · 18"` com `<Bow variant="silver" />` e tração magnética (`sealRawX`/`sealRawY`) dentro de um `<motion.div>` filho aninhado ao wrapper `translateZ(18px)`.

### ADR-008: Lacinhos Esculturais de Alta-Costura & Cantoneiras Geométricas (`CornerFiligree`)
* **Decisão:** Refatorar `BowDecoration.tsx` com gradientes cilíndricos de 6 stops, sombra de oclusão sobre as caudas (`tail-shadow`), 3 pregas convergentes por alça, pontas cortadas em V (*swallowtail*) e nó central abobadado, preservando zero filtros `<feDropShadow>`. Criar `CornerFiligree` em `Ornaments.tsx` com geometria estrita de linhas duplas e estrela de 4 pontas (zero elementos florais) aplicada na carta (`InvitationContent.tsx`) e nos modais (`Sheet.tsx`).

### ADR-009: Altar Editorial da Data `17/07` com Agenda Integrada & Cápsulas de Cristal no Contador
* **Decisão:** Emoldurar a citação de Walt Disney e o bloco de traje (`Esporte Fino`) em cartões translúcidos `glass-royal-card`. Integrar o seletor **"Salvar na Agenda"** (Google Agenda + `.ics` com feedback visual e `ScrollTrigger.refresh()` sincronizado) diretamente no bloco da data `17/07`. Evoluir `CountdownTimer.tsx` para cápsulas `grid-cols-4` com separadores `CrystalSeparator` e rolagem vertical 3D (`rotateX: ±38deg`) em GPU, mantendo `useCountdown` nulo no SSR.

### ADR-010: Reflexo Especular via `requestAnimationFrame` sem Re-renders & Fidelidade Cromática nos Modais
* **Decisão:** Implementar rastreamento de brilho metálico (`--sheen-x`, `--sheen-y` para `.interactive-sheen`) via `requestAnimationFrame` direto no `rootRef.current.style` no ponteiro e no scroll mobile. Elevar os medalhões de `InteractiveActions.tsx` com aro duplo cromado, subtítulos e chevrons deslizantes; corrigir desvios de paleta substituindo `emerald` por prata espelhado/azul royal no `GiftsSheet.tsx` (com chip metálico SVG) e `red-600` por badge Azul Royal no `RsvpSheet.tsx`, ambos disparando `fireMiniCelebration` (`LuxuryParticles.tsx`).

---

## [2026-11-13] · Estruturação da Base de Conhecimento Obsidian & Agent Skill

* **Decisão:** Instituir o cofre Obsidian em `Docs/` com notas interligadas por Wikilinks, YAML Properties, Callouts e Mermaid, acompanhado da Agent Skill `.agents/skills/obsidian-markdown/SKILL.md` (`obsidian-vault-docs`) e das diretrizes persistentes `GEMINI.md` e `AGENTS.md`.
* **Justificativa:** Garantir continuidade de contexto entre sessões de agentes e manter a documentação sincronizada com o código-fonte.
* **Higiene Git:** Adicionado `Docs/.obsidian/workspace*.json` ao `.gitignore` para não versionar estado efêmero de janelas do Obsidian.

---

## [2026-11-13] · Auditoria Sênior e Refatoração Completa para Produção

### ADR-001: Máquina de Estados Determinística no Envelope 3D
* **Problema:** `Envelope3DOpening.tsx` usava 7 `window.setTimeout` independentes sem trava síncrona contra múltiplos cliques no mesmo frame.
* **Decisão:** Substituir os timeouts por uma única `gsap.timeline()` armazenada em `timelineRef` (com `kill()` no unmount) + trava síncrona `isOpeningRef = useRef(false)` e cleanup explícito de `fireLuxuryCelebration` (`LuxuryParticles.tsx`).

### ADR-002: Planos `translateZ` Explícitos para WebKit/Safari
* **Problema:** Camadas dentro de `preserve-3d` dependiam apenas de `z-index` 2D, causando *z-fighting* no Safari.
* **Decisão:** Atribuir planos distintos (`-12px`, `-2px`, `2px -> 14px`, `6px`, `8px -> -1px`, `18px`) em `Envelope3DOpening.tsx`.

### ADR-003: Migração de Loops Infinitos JS para CSS GPU-Accelerated
* **Problema:** Mais de 20 loops `repeat: Infinity` do Framer Motion rodavam na main-thread mesmo com o envelope fechado, além de animações de `filter: blur(...)` e `background-attachment: fixed`.
* **Decisão:** Criar keyframes CSS GPU-only (`translate3d`, `rotate`) em `src/app/globals.css`, pausados automaticamente quando `data-active="false"` em `InvitationContent.tsx`. Remover `filter: blur(...)` de `CountdownTimer.tsx` e `Envelope3DOpening.tsx`, e remover `background-attachment: fixed` do `body`.

### ADR-004: Isolamento do `ScrollLockContext`
* **Problema:** `useScrollLock` assinava o mesmo contexto que armazenava a instância `lenis`, causando re-renders quando o Lenis era inicializado.
* **Decisão:** Separar `ScrollLockContext` (`lock`, `unlock` estáveis) de `SmoothScrollContext` em `SmoothScrollProvider.tsx`.

### ADR-005: Restauração do Fluxo de Presentes & Correção do Submit no RSVP
* **Problema:** `GiftsSheet.tsx` estava inacessível em `InteractiveActions.tsx`, e `RsvpSheet.tsx` usava `<SheetButton href={...}>` (âncora `<a>`), burlando a validação `onSubmit`.
* **Decisão:** Adicionar o 3º medalhão `SUGESTÕES DE PRESENTES` com `HollowGiftIcon`, converter o botão do RSVP para `type="submit"` real com validação de nome e foco automático no campo em caso de erro, e remover animação de `height: "auto"` no seletor de acompanhantes.

### ADR-006: Limpeza de Dead Code e SEO Completo
* **Decisão:** Remover `EnvelopeGate.tsx`, `WaxSeal.tsx`, componentes `null` em `BowDecoration.tsx`, `MonogramCrest` em `Ornaments.tsx` e classes/keyframes mortos em `globals.css`. Adicionar `siteUrl`, `metadataBase`, `openGraph.images` e `twitter` em `src/config/event.ts` e `src/app/layout.tsx`.

Veja também: [[06-aprendizados-e-troubleshooting]], [[01-arquitetura-e-estrutura]].

