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
updated: 2026-11-17
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

## [2026-11-17] · Auditoria Completa: Novo Brasão IA, Retrato Cirúrgico & 60fps

### ADR-019: Novo Brasão IA Royal & Prata (`760x882`), Texto Curvo à Direita, Física *Spring* e Ancoragem Percentual no Retrato
* **Motivação:** Elevar o impacto visual da `CoverGate` com um brasão barroco perolado cercado por ramos botânicos e arabescos em Azul Royal/Safira/Prata (substituindo 100% dos vestígios dourados/champagne), posicionar `TOQUE PARA ABRIR` contornando exclusivamente a lateral direita do selo, corrigir definitivamente o deslocamento do chapéu e do laço na foto da bebê em `HeroPoster`, e refinar a performance GPU 60fps adaptativa.
* **Alterações:**
  * **Novo Brasão IA & Recorte Alfa (`public/images/brasao-barroco-c.png`):** Gerado via `image-generator` combinando o medalhão perolado `"C"` com arranjo ornamental externo em Azul Royal (`#0A2463`/`#1E40AF`), Azul Gelo (`#93C5FD`) e Prata Metálico (`#CBD5E1`/`#F8FAFC`), com **zero dourado/champagne**. Extraído com `sharp` (flood-fill conectado + limpeza de ilhas internas externas + descontaminação de 2px em bordas anti-aliased + PNG palette-96 em `760x882`, ~297 KB), mantendo recorte limpo sem halo sobre `#F4F5F7` e `#071739`.
  * **Redesign `CoverGate.tsx` & `globals.css`:**
    * Removido o arco fino superior e o texto curvo inferior; implementado `CurvedCrestCaption` com `<svg viewBox="0 0 760 882">` travado às coordenadas reais do selo (`centro 446.1, 429.4 | R = 288 | -53° a +23°`), exibindo **`TOQUE PARA ABRIR`** em `Cinzel` (`#071739`, `animate-breathe-soft`) contornando suavemente a lateral direita sem cortes em viewports `360px`–`430px`.
    * Adicionadas vinheta perimetral nas duas portas, sombra realista reforçada na junção central, cantoneiras barrocas `EditorialCornerOrnament` em Azul Royal & Prata, halo luminoso (`animate-halo-pulse`), reflexo especular diagonal (*shimmer*) no medalhão circular (`animate-brooch-shimmer`, sem requisição extra), micropartículas cintilantes adaptativas (`AMBIENT_CREST_SPARKS`: 6 no mobile, 10 no desktop, desabilitadas em `prefers-reduced-motion`) e abertura das portas por física *spring* (`stiffness: 62, damping: 16, mass: 1`).
  * **Correção Cirúrgica no Retrato (`HeroPoster.tsx`):**
    * Foto P&B (`public/images/carol-cutout.png`) travada em `aspect-[833/1024]` com `loading="lazy"` e `decoding="async"`, usando apenas coordenadas e larguras em `%`: `<Bow variant="royal" />` ancorado na faixa/cabelo superior esquerdo (`top-[11%] left-[25.5%] w-[15.5%] -rotate-[22deg]`) e `RoyalGlitterPartyHat` no topo/lateral superior direito (`-top-[13.5%] right-[11.2%] w-[33.5%] rotate-[24deg]`), com sombra projetada curva sobre o cabelo, glitter azul royal cintilante e pompom volumoso de 40 fios.
  * **Performance 60fps & Higiene (`HeroPoster.tsx`, `LuxuryParticles.tsx`, `CountdownTimer.tsx`, `BowDecoration.tsx`):**
    * Adicionado gating `useReducedMotion` no *parallax* de `HeroPoster.tsx`, aro especular em `MirrorDiscoBall`, nós e fases orgânicas distintas nos 5 balões de `RoyalGlossyBalloons`, redução do orçamento de partículas no mobile em `LuxuryParticles.tsx`, remoção de `will-change-transform` fixo em `CountdownTimer.tsx` e remoção de exports internos não utilizados (`BowGlyph`, `BowGlyphProps`) em `BowDecoration.tsx`.

---

## [2026-11-17] · Revisão UI, Motion & Performance da Tela de Entrada (`CoverGate`)

### ADR-018: Integração do Brasão Barroco PNG Transparente, Refino Editorial & First Paint Instantâneo
* **Motivação:** Substituir o broche vetorial anterior da `CoverGate` pelo brasão barroco perolado com coroa e inicial `"C"` em azul royal fornecido pelo usuário, refinando o enquadramento editorial das portas bipartidas e garantindo carregamento prioritário sem *layout shift* (`CLS = 0`) e 60fps fluidos.
* **Alterações:**
  * **Asset Otimizado & Recorte Alfa (`public/images/brasao-barroco-c.png`):** Processado o arquivo original (`1024x1024` com fundo preto sólido) via flood-fill conectado + descontaminação cromática de borda para remover 100% do fundo e evitar halo escuro sobre papel claro, recortado proporcionalmente e otimizado com `sharp` para `576x610` Retina 2x (`~204 KB` lossless, servido em WebP/AVIF via `next/image`).
  * **Carregamento Prioritário & Zero CLS (`CoverGate.tsx`):** Substituídos `RoyalBroochSeal` e `ImperialCrestFiligree` por `<Image src="/images/brasao-barroco-c.png" width={576} height={610} priority fetchPriority="high" loading="eager" decoding="sync" />` em container `aspect-[576/610]` com `initial={false}` (First Paint imediato sem esperar hidratação).
  * **Sombras, Enquadramento & Texto Curvo (`CoverGate.tsx` & `globals.css`):** Aplicado `filter: drop-shadow(...)` multicamada acompanhando o contorno ondulado do brasão (intensificado no hover) e removidos os efeitos de brilho/shimmer/aura/ondas do broche. Superfície `bg-paper-fine` ajustada para `#F4F5F7` harmonizado com o madrepérola do brasão, junção central realista com sombra `inset` e filetes prata/azul-marinho, cantoneiras e molduras lineares minimalistas (`EditorialCornerBracket` / `CoverDoorFrame`) em `#B8C0CC` e `#0A2463`, brasão proporcionado em `clamp(124px, 34vw, 152px)` (`164px` no desktop) e chamada **`✦ TOQUE PARA ABRIR ✦`** em `<textPath>` SVG (`CurvedCrestCaption`) contornando suavemente o brasão em `Cinzel` (`tracking-[0.22em]`, `#071739`) com *pulse* suave de opacidade (`animate-breathe-soft`).
  * **Coreografia 60fps:** Micro-flutuação vertical GPU (`animate-crest-float`, `y: [-3, 3]` em `4.2s`), resposta tátil `whileTap={{ scale: 0.94 }}` com *spring* rápido, dissolução do brasão (`scale: 1.12, opacity: 0` em `350ms`) com dispersão de partículas (`UNSEAL_SPARKS` + `fireLuxuryCelebration`), abertura das portas (`-102%`/`+102%`) em `950ms` (`cubic-bezier(0.22, 1, 0.36, 1)`) com `will-change: transform` aplicado apenas durante a abertura.

---

## [2026-11-17] · Auditoria Principal Frontend & Motion Design (60fps, Dead Code & Refino Editorial)

### ADR-017: Limpeza Cirúrgica de Assets/Dead Code, Parallax Multi-Camada e Micro-Interações Framer Motion
* **Motivação:** Elevar o projeto a padrão editorial/motion de alto nível com zero código morto, papel contínuo `#F1F2F4`, responsividade testada para `360px–430px` (`min-h-[44px]` em todos os controles) e animações puramente em `transform`/`opacity` a 60fps.
* **Alterações:**
  * **Limpeza de Dead Code & Assets:** Removidos 13 arquivos PNG órfãos de `public/images/` (preservando exclusivamente `carol-cutout.png`), removidos componentes não utilizados em `Ornaments.tsx` (`FoilBalloon18`, `Emblem18`, `SilverDivider`, `DressCodeIcon`) e `LuxuryParticles.tsx` (`AmbientSparkles`), removida função `getEventTimestamp` de `src/config/event.ts`, removido `ScrollTrigger` e `SmoothScrollContext` redundantes em `SmoothScrollProvider.tsx` (adicionando `lenisRef.current?.resize()` ao destravar), e purgadas classes/keyframes obsoletos de `src/app/globals.css`.
  * **Tokens & Continuidade (`globals.css` & `layout.tsx`):** Adicionados `--color-royal-navy` (`#071739`) e `--color-royal-deep` (`#0A2463`), ajustada a superfície contínua `bg-poster-paper` e `viewport.themeColor` para `#F1F2F4`.
  * **Capa Bipartida (`CoverGate.tsx`):** Adicionada sombra multicamada realista + chanfro especular prateado na junção central, dispersão radial de 12 fagulhas (`UNSEAL_SPARKS`) no destrave do broche, curva *spring* calibrada (`stiffness: 58, damping: 16, mass: 1.02`) e área de toque `min-h-[44px]` em `"CLIQUE PARA ABRIR"`.
  * **Pôster Hero (`HeroPoster.tsx`):** Adicionado *parallax* multi-camada nas estrelas laterais (`starsUpParallax` / `starsDownParallax`) sem conflito com CSS float, cintilação (`animate-twinkle`) nas estrelas, flutuação orgânica assíncrona individual nos 5 balões glossy e container `aspect-[451/554]` explícito em `carol-cutout.png` (zero CLS).
  * **Seções Contínuas (`InvitationContent.tsx` & `CountdownTimer.tsx`):** Substituído GSAP `ScrollTrigger.batch` por Framer Motion `whileInView` + `staggerChildren: 0.09` (`viewport={{ once: true, amount: 0.2 }}`), adicionadas cantoneiras `CornerFiligree` ao card de Local da Festa, bordas `1px` translúcidas com brilho interno superior, `min-h-11` (`44px+`) em todos os inputs/botões e transições `AnimatePresence mode="wait"` nos botões de agenda e cópia de endereço.

---

## [2026-11-17] · Continuidade Visual em Papel Texturizado & Seções Integradas de Local e RSVP

### ADR-016: Remoção do Bloco Legado Escuro e Continuidade Contínua de `bg-poster-paper`
* **Motivação:** Eliminar o contraste brusco com o antigo card azul-marinho quadriculado (laço branco e fonte cursiva) e o antigo corte reto na base do pôster, estendendo a estética do pôster principal por toda a página e integrando Local da Festa e RSVP diretamente no fluxo da página sem modais.
* **Alterações:**
  * **Preservados intactos:** `CoverGate.tsx` e a composição interna de `HeroPoster.tsx` (removido apenas o `overflow-hidden` e o fundo próprio de `<HeroPoster>`, mantendo `maskImage` suave na extremidade inferior de `carol-cutout.png` e exportando `GlitterBlueStar` / `MetallicSilverStar`).
  * **Atualizado `CountdownTimer.tsx`:** Redesenhado para o tema claro do pôster, com título serifado em `#0B2149` entre filetes horizontais, divisórias verticais e rótulos em pílulas azul-marinho (`#0B2149`).
  * **Reconstruído `InvitationContent.tsx`:** Aplicação de `bg-poster-paper` único do topo do pôster até o rodapé, estrelas laterais conectando as seções, pílula `CAROL • 18 ANOS`, citação Walt Disney + abertura, `CountdownTimer` + atalhos de agenda, seção completa de **Local da Festa** (endereço, horário `19:30`, traje `Esporte Fino`, mapa embed, Google Maps, Waze e Copiar Endereço) e seção completa de **Confirmar Presença / RSVP** (presença, nome completo, quantidade e nome individual dos acompanhantes, recado opcional, `fireMiniCelebration`, feedback visual na tela e envio ao WhatsApp).
  * **Removidos arquivos de modal substituídos:** `InteractiveActions.tsx`, `sheets/LocationSheet.tsx`, `sheets/RsvpSheet.tsx`, `sheets/SheetButton.tsx` e `ui/Sheet.tsx`.

---

## [2026-11-17] · Refatoração Completa de UI/UX (`CoverGate` + `HeroPoster` + Medalhões Circulares)

### ADR-015: Substituição do Envelope 3D pela Capa Bipartida (`CoverGate`) e Pôster Hero Animado em Código (`HeroPoster`)
* **Motivação:** Elevar a experiência para uma estética editorial de luxo inspirada nas referências visuais fornecidas pelo usuário, mantendo 100% das integrações (`src/config/event.ts`, `LocationSheet.tsx`, `RsvpSheet.tsx`, SEO/Open Graph) e todas as regras invioláveis do projeto (paleta Royal Blue & Prata, proibição estrita de flores e de sugestões de presentes/Pix).
* **Alterações:**
  * **Removidos:** `Envelope3DOpening.tsx` e `CarolHeroCollage.tsx` foram descartados por completo.
  * **Criado `src/components/CoverGate.tsx`:** Tela cheia `100dvh` dividida verticalmente em duas portas de papel artesanal off-white (`bg-paper-fine`) com sombra realista na junção central, cantoneiras e arabescos imperiais em Prata & Azul Royal + lacinhos acetinados (zero flores), broche metálico central em alto-relevo (Royal Blue esmaltado + aro de lacre prateado) com apenas a inicial `"C"`, brilho especular contínuo (*shimmer*), pulso tátil, explosão de partículas (`fireLuxuryCelebration`) e abertura bipartida fluida por física de mola.
  * **Criado `src/components/HeroPoster.tsx`:** Recriação integral em código animado (React + Tailwind + SVG + Framer Motion) da composição do pôster principal sobre `bg-poster-paper`: 3 globos espelhados procedurais 3D (`MirrorDiscoBall`) com *parallax* no scroll, letreiro metálico `"HAPPY BiRthdAy"` em blocos retangulares com entrada *staggered*, estrelas em glitter azul royal e prata 3D chanfrada, bloco editorial da data (`Julho · SÁB | 17 | 19:30 · 2027` via `FORMATTED_EVENT_DATE`), e a foto P&B `carol-cutout.png` na base central vestindo `<Bow variant="royal" />`, chapéu cônico em glitter azul royal com pompom (`RoyalGlitterPartyHat`) e cluster de balões glossy azul royal (`RoyalGlossyBalloons`).
  * **Atualizados `InvitationContent.tsx`, `InvitationExperience.tsx`, `InteractiveActions.tsx`, `CountdownTimer.tsx` e `globals.css`:** Integração contínua entre `HeroPoster` e a seção editorial Royal Blue & Silver (citação Walt Disney, contador regressivo, salvar na agenda, 2 medalhões circulares lado a lado para Local da Festa e RSVP com `CLIQUE NOS ÍCONES PARA INTERAGIR`, e card de traje `Esporte Fino`).

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

