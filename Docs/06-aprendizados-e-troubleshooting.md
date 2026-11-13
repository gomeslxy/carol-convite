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
updated: 2026-11-13
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

> [!bug] Cache `.next` Inconsistente no Next.js 15
> Após remoção/renomeação de arquivos de componentes, o `next build` pode falhar na etapa *Collecting page data* com `[Error: Invariant: no direct app page entry found for /_not-found]`.

* **Solução:** Remover a pasta `.next` e executar o build limpo (`Remove-Item -Recurse -Force .next; npm.cmd run build`).

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

* **Solução:** Utilizar exclusivamente os tokens declarados no `@theme inline` (`silver-100`, `royal-800`, `royal-900`, `royal-950`) inclusive em estados de erro (`RsvpSheet.tsx`) e feedback de cópia (`LocationSheet.tsx`, `GiftsSheet.tsx`).

Veja também: [[00-INDEX]], [[02-envelope-3d-e-animacoes]], [[03-design-system-e-responsividade]], [[05-changelog-e-decisoes]].

