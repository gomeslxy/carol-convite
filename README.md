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

Tudo fica em **`src/config/event.ts`**: nome, data/hora (ISO com fuso), traje, local e WhatsApp do RSVP.
Dia da semana, mês e ano são calculados automaticamente a partir da data.

## Estrutura

```
src/
├─ app/                       layout (fontes), page, globals.css (tema + texturas)
├─ config/event.ts            dados do evento
├─ lib/utils.ts               clipboard, Google Agenda/.ics, Maps, Waze, WhatsApp
└─ components/
   ├─ InvitationExperience.tsx orquestrador de estágios do convite
   ├─ Envelope3DOpening.tsx   envelope 3D em camadas, selo "C · 18" e confetes
   ├─ CountdownTimer.tsx      contador regressivo com dígitos em 3D
   ├─ InteractiveActions.tsx  botões medalhão (Local e RSVP) + sheets
   ├─ BowDecoration.tsx       laços acetinados SVG (Bow)
   ├─ InvitationContent.tsx   página interna + animações GSAP/ScrollTrigger
   ├─ Ornaments.tsx           brasão, cantoneiras e divisores prateados
   ├─ SmoothScrollProvider.tsx Lenis + GSAP ticker + trava de scroll
   ├─ sheets/                 conteúdo dos modais (local e RSVP)
   └─ ui/Sheet.tsx            bottom-sheet com arrastar para fechar
```

## Deploy

Importe o repositório na Vercel — nenhuma variável de ambiente é necessária.

## Autor

- **Lucas Gomes do Amaral** (`@gomeslxy`)
- **E-mail:** [la181009@gmail.com](mailto:la181009@gmail.com)
- **GitHub:** [https://github.com/gomeslxy](https://github.com/gomeslxy)

