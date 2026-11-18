# Convite Interativo · Carol 18 Anos

Convite digital editorial *mobile-first* com capa bipartida de luxo, broche metálico em alto-relevo, pôster comemorativo animado em código (globos espelhados, letreiro, estrelas e colagem fotográfica) e continuação contínua em papel texturizado com contagem regressiva, mapa do evento e confirmação de presença integrada via WhatsApp.

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
├─ app/                        layout (fontes), page, globals.css (tema + papéis/texturas)
├─ config/event.ts             dados do evento
├─ lib/utils.ts                clipboard, Google Agenda/.ics, Maps, Waze, WhatsApp
└─ components/
   ├─ InvitationExperience.tsx orquestrador de estágios do convite
   ├─ CoverGate.tsx            capa bipartida com portas verticais e broche metálico "C"
   ├─ HeroPoster.tsx           pôster animado em código (globos espelhados, letreiro, data e foto P&B)
   ├─ InvitationContent.tsx    papel texturizado contínuo: pôster + contagem + local + RSVP integrado
   ├─ CountdownTimer.tsx       contador regressivo com dígitos em 3D no estilo do pôster
   ├─ BowDecoration.tsx        laços acetinados SVG (Bow)
   ├─ Ornaments.tsx            cantoneiras e divisores prateados
   └─ SmoothScrollProvider.tsx Lenis + GSAP ticker + trava de scroll
```

## Deploy

Importe o repositório na Vercel — nenhuma variável de ambiente é necessária.

## Autor

- **Lucas Gomes do Amaral** (`@gomeslxy`)
- **E-mail:** [la181009@gmail.com](mailto:la181009@gmail.com)
- **GitHub:** [https://github.com/gomeslxy](https://github.com/gomeslxy)
