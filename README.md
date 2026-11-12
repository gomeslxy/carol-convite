# Convite Interativo · Carol 18 Anos

Convite digital mobile-first com envelope animado, selo de cera, confete, contador regressivo e ações interativas.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · GSAP + ScrollTrigger · Lenis · canvas-confetti · Lucide React

## Rodando localmente

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

> No Windows/PowerShell com scripts bloqueados, use `npm.cmd` no lugar de `npm`.

## Personalização

Tudo fica em **`src/config/event.ts`**: nome, data/hora (ISO com fuso), local, WhatsApp do RSVP, chave Pix e sugestões de presentes.
Dia da semana, mês e ano são calculados automaticamente a partir da data.

## Estrutura

```
src/
├─ app/                       layout (fontes), page, globals.css (tema + texturas)
├─ config/event.ts            dados do evento
├─ lib/utils.ts               clipboard, Google Agenda/.ics, Maps, Waze, WhatsApp
└─ components/
   ├─ EnvelopeGate.tsx        portas do envelope + confete + trava de scroll
   ├─ WaxSeal.tsx             selo de cera SVG + texto circular
   ├─ CountdownTimer.tsx      contador com dígitos rolando
   ├─ InteractiveActions.tsx  botões + bottom-sheets
   ├─ BowDecoration.tsx       laços SVG (Bow, CornerRibbon, BowTieIcon)
   ├─ InvitationContent.tsx   página interna + animações GSAP/ScrollTrigger
   ├─ Ornaments.tsx           brasão e divisores prateados
   ├─ SmoothScrollProvider.tsx Lenis + GSAP ticker + trava de scroll
   ├─ sheets/                 conteúdo dos modais (local, RSVP, presentes)
   └─ ui/Sheet.tsx            bottom-sheet com arrastar para fechar
```

## Deploy

Importe o repositório na Vercel — nenhuma variável de ambiente é necessária.

