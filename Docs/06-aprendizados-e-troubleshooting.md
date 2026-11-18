---
title: 06 - Aprendizados e Troubleshooting
aliases:
  - Troubleshooting
  - Bugs Resolvidos
  - Armadilhas
tags:
  - troubleshooting
  - safari-ios
  - hydration
  - nextjs
  - windows
status: active
updated: 2026-11-17
related:
  - "[[00-INDEX]]"
  - "[[02-envelope-3d-e-animacoes]]"
  - "[[05-changelog-e-decisoes]]"
---

# 06 · Aprendizados e Troubleshooting

> [!info] Diário Técnico de Armadilhas Evitadas
> Consulte esta nota antes de mexer em animações 3D, SSR/hidratação, formulários em sheets ou rodar comandos no ambiente Windows.

---

## 1. Hydration Mismatch no Contador Regressivo (`CountdownTimer.tsx`)

> [!bug] Sintoma e Causa Raiz
> Calcular `Date.now()` durante o SSR gera valores diferentes dos do cliente no momento da hidratação. Além disso, inicializar com `00:00:00:00` e trocar direto para os dígitos reais dentro de `AnimatePresence` disparava 8 animações de transição falsas no primeiro paint.

* **Solução:**
  1. `useCountdown` retorna `null` no SSR e no primeiro render do cliente; os valores só são computados dentro de `useEffect`.
  2. Enquanto `ready === false`, `CountdownUnit` renderiza um placeholder invisível de largura fixa, montando `RollingDigit` apenas quando `ready === true`.
  3. `CountdownUnit` e `RollingDigit` são envolvidos em `React.memo` para evitar trabalho redundante a cada segundo.
  4. `getFormattedDate()` usa fuso explícito `America/Sao_Paulo` com cache em `src/config/event.ts` (`FORMATTED_EVENT_DATE`), mantendo SSR e cliente idênticos.

---

## 2. Performance CSS 3D e Filtros no Safari / iOS

> [!warning] Armadilhas do WebKit Mobile
> * **`preserve-3d` sem `translateZ`:** Elementos filhos competem pelo mesmo plano Z e piscam (*z-fighting*) durante rotações `rotateX`/`rotateY` no Safari. ^safari-preserve-3d
> * **`<feDropShadow>` dentro de SVGs 3D:** Força rasterização por software a cada frame.
> * **`filter: blur(...)` animado e `background-attachment: fixed`:** Causam *repaint* pesado e queda de FPS no iOS.

* **Solução Aplicada:**
  * Planos `translateZ` distintos em todas as 5 camadas de `Envelope3DOpening.tsx`.
  * Substituição de `<feDropShadow>` em `BowDecoration.tsx`, `Ornaments.tsx` e `Envelope3DOpening.tsx` por `drop-shadow` via CSS.
  * Remoção de `filter: blur(...)` de `RollingDigit` e do selo 3D, além de remoção de `background-attachment: fixed` em `globals.css`.

---

## 3. Validação Silenciosamente Ignorada em `<form>` (`RsvpSheet.tsx`)

> [!bug] Botão `<a>` dentro de `<form>`
> `SheetButton` renderiza `<a>` quando recebe `href` e `<button>` quando recebe `type="submit"`. Usar `href={whatsappHref}` dentro de `<form onSubmit={handleSubmit}>` fazia o navegador abrir o link diretamente sem jamais executar `handleSubmit`.

* **Solução:** Usar `<SheetButton type="submit">` e chamar `window.open(whatsappHref, "_blank", "noopener,noreferrer")` somente após validar `name.trim().length >= 2`.

---

## 4. Erro de Build `no direct app page entry found for /_not-found`

> [!bug] Concorrência de `next dev` Ativo com `next build` (ou Cache `.next` Inconsistente)
> Quando existem processos `next dev` (`start-server.js`) rodando em background no mesmo diretório — ou após remoção/renomeação de componentes com cache `.next` inconsistente — o servidor de desenvolvimento recompila sob demanda e sobrescreve `.next/server/app-paths-manifest.json` sem a entrada `"/_not-found/page"`, fazendo o `next build` falhar na etapa *Collecting page data* com `[Error: Invariant: no direct app page entry found for /_not-found]`.

* **Solução:** Encerrar quaisquer processos `next dev` concorrentes no mesmo repositório, remover a pasta `.next` e executar o build limpo (`Remove-Item -Recurse -Force .next; npm.cmd run build`). Caso um supervisor externo reinicie `next dev` continuamente em `.next`, execute um build isolado com `$env:NEXT_DIST_DIR=".next-build"; npm.cmd run build` (suportado em `next.config.ts`) e remova `.next-build` ao final.

---

## 5. PowerShell Execution Policy no Windows

> [!tip] Comando `npm` bloqueado no Windows
> Neste ambiente Windows, `npm` invoca `npm.ps1` e pode falhar com `UnauthorizedAccess` por política de execução do PowerShell.

* **Solução:** Utilize sempre **`npm.cmd`** (ex.: `npm.cmd run typecheck`, `npm.cmd run build`) ou **`npx.cmd`**.

---

## 6. Conflito entre `style.transform` (`translateZ`) e `MotionValue` (`x`/`y`) no Framer Motion

> [!bug] Sobrescrita do Plano 3D em `preserve-3d`
> Ao definir `style={{ transform: "translateZ(18px)", x: sealX, y: sealY }}` no mesmo `<motion.div>`, o Framer Motion substitui `style.transform` pela string `translateX(...) translateY(...)`, colapsando o `translateZ(18px)` e reintroduzindo risco de *z-fighting* no Safari/WebKit. ^framer-translatez

* **Solução:** Manter o plano 3D em um `<div>` wrapper estático (`style={{ transform: "translateZ(18px)" }}`) e animar `x`/`y` em um `<motion.div>` filho interno (`Envelope3DOpening.tsx`).

---

## 7. Tokens de Cor Customizados no Tailwind v4 (`@theme inline`)

> [!warning] Escalas Não Declaradas e Fidelidade de Paleta
> Em `src/app/globals.css`, o bloco `@theme inline` declara apenas `--color-royal-500` a `--color-royal-950` e `--color-silver-50` a `--color-silver-500`. Classes como `bg-royal-50` não existem no tema customizado, e classes padrão do Tailwind como `emerald-*` ou `red-*` violam a paleta estrita do projeto.

* **Solução:** Utilizar exclusivamente os tokens declarados no `@theme inline` (`silver-100`, `royal-800`, `royal-900`, `royal-950`) inclusive em estados de erro (`RsvpSheet.tsx`) e feedback de cópia/agenda (`LocationSheet.tsx`, `InvitationContent.tsx`).

---

## 8. Gargalos de GPU/CPU no Mobile (`<feTurbulence>`, `backdrop-filter`, `mix-blend-mode` e Variáveis CSS no Scroll)

> [!warning] Armadilhas de Composição e Paint no Safari/iOS e Android
> * **SVG `<feTurbulence>` em Data-URI (`--satin-noise`):** Força rasterização em CPU em toda camada onde é aplicado, especialmente dentro de cenas `preserve-3d`.
> * **Múltiplos `backdrop-filter: blur(...)` + Mutação de Variáveis CSS no Raiz:** Atualizar `--sheen-x`/`--sheen-y` no container pai durante `scroll`/`pointermove` invalida o estilo de toda a subárvore e força recomputação de todos os `backdrop-filter` a cada frame.
> * **`mix-blend-mode: soft-light` em Overlay Fullscreen & `animate-shimmer`:** Camadas gigantes com blend mode (`.satin-sheen::after`) e animação de `background-position` sobre `background-clip: text` com `filter: drop-shadow` causam *repaint* contínuo a 60fps.
> * **Loops JS Contínuos no Envelope 3D:** `deviceorientation` + `y: [0, -8, 0]` + reconstrução de `radial-gradient` em `MotionValue` recalculam matrizes 3D e texturas constantemente mesmo em repouso.

* **Solução Aplicada:**
  * Substituído `--satin-noise` por `--linen-grain` (posteriormente removido na limpeza ADR-017) e mantido exclusivamente `--paper-weave` em `repeating-linear-gradient` CSS puro, removendo `blur-xl`, `drop-shadow` em SVGs 3D e `grayscale` sobre `<iframe>`.
  * Substituído `backdrop-filter` repetido por gradientes acetinados multicamada e papel contínuo leve, eliminando listeners de `scroll`/`pointermove` no conteúdo.
  * Desativado o tick do `CountdownTimer` enquanto `revealed === false` e aplicado `will-change: auto !important` em `[data-active="false"]`.

---

## 9. Conflito entre `style={{ y }}` (Parallax) e Animação CSS `transform` (`HeroPoster.tsx`)

> [!warning] Sobrescrita de `transform` em Elementos Flutuantes com Parallax
> Aplicar `style={{ y: parallaxMotionValue }}` diretamente no `<svg>` que também usa `className="animate-sticker-float"` faz o Framer Motion e os keyframes CSS disputarem a propriedade `transform`, cancelando um dos dois efeitos.

* **Solução:** Envolver cada `<GlitterBlueStar>` e `<MetallicSilverStar>` com um `<motion.div style={{ y: starsUpParallax }}>` externo enquanto o `<svg>` interno mantém sua animação CSS GPU (`animate-sticker-float`), compondo os dois movimentos em camadas separadas sem conflito.

## 10. Recorte Alfa de Assets Escuros/Claros & Texto Curvo Sincronizado (`CoverGate.tsx`)

> [!tip] Remoção de Halo, Preservação de Brilhos Internos & `<textPath>` Sem Cortes
> * **Recorte com Fundo Isolado + Ilhas Internas (`brasao-barroco-c.png`):** Ao recortar ilustrações detalhadas sobre fundo branco (`#FFFFFF`) que possuem destaques perolados internos (`>= 250`), nunca remova ilhas claras indiscriminadamente perto do selo — aplique *flood-fill* conectado a partir das bordas e limite a limpeza de buracos fechados apenas a regiões grandes (`size >= 150`) fora do raio máximo da borda ondulada (`minR >= 298`), aplicando descontaminação cromática de 2px na fronteira.
> * **Separação Broche vs. Decoração de Página via `viewBox` Bipartido (`CoverGate.tsx`):** Para criar a ilusão física de que a decoração ornamental pertence às folhas do convite (atrás do broche) e se abre ao meio junto com as portas, compartilhe o mesmo sistema de coordenadas mestre (`540×740`) rendendo `viewBox="0 0 270 740"` ancorado em `right-0` na porta esquerda e `viewBox="270 0 270 740"` ancorado em `left-0` na porta direita, usando o mesmo `aspect-[270/740]` travado proporcionalmente à largura do broche. Nunca use um disco `radial-gradient` atrás de broches PNG sem fundo, pois cria aparência de círculo recortado.
* **Texto Curvo Sincronizado à Direita (`CurvedCrestCaption`):** Usar o mesmo `viewBox` das dimensões reais do PNG (`576×610`) dentro do container `aspect-[576/610]` trava matematicamente o arco `<path>` (`centro 288, 305 | R = 324`) ao contorno externo direito do medalhão em qualquer resolução (`360px` a desktop), eliminando colisões e cortes.
> * **Ancoragem Percentual de Adereços (`HeroPoster.tsx`):** Posicionar acessórios sobre fotos recortadas usando `top`/`left`/`right` e `w-[...%]` exclusivamente em `%` dentro de um único container com `aspect-[833/1024]` garante paridade absoluta entre mobile e desktop, impedindo que chapéu e laço escorreguem para a testa ou olhos.
> * **`will-change` sob Demanda:** Aplicar `will-change: transform` somente nos estágios `unsealing` / `opening` evita alocação prematura de camadas GPU enquanto a capa está em repouso.

Veja também: [[00-INDEX]], [[02-envelope-3d-e-animacoes]], [[03-design-system-e-responsividade]], [[05-changelog-e-decisoes]].

