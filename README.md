# 💌 Convite Interativo · Carol 18 Anos

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-black?style=flat&logo=framer)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://convitecarol.site)

Convite digital editorial *mobile-first* com capa bipartida de luxo, broche metálico em alto-relevo com lacres cerimoniais, pôster comemorativo animado em código (globos espelhados, letreiro, estrelas e colagem fotográfica) e continuação contínua em papel texturizado perolado com contagem regressiva em 3D, mapa do local e confirmação de presença (RSVP) integrada diretamente via WhatsApp.

🌐 **Website oficial:** [https://convitecarol.site](https://convitecarol.site)

---

## ✨ Destaques da Experiência

- 🚪 **Capa Bipartida Cerimonial:** Portas verticais com texturas táteis e abertura suave revelando o convite.
- 🪙 **Broche Barroco "C":** Selo metálico em relevo prateado com efeito de brilho e animação de deslacramento ao toque.
- 🎨 **Identidade Visual Exclusiva:** Paleta refinada em Azul Royal profundo (`#0A2463`), Branco/Off-White Perolado e Prata Metálico, decorada com laços acetinados e cantoneiras prateadas de alta precisão.
- 🪩 **Pôster Hero Interativo:** Tipografia monumental, globos espelhados animados, efeitos de luz e foto comemorativa.
- ⏳ **Contador Regressivo em Tempo Real:** Dígitos com profundidade 3D sincronizados com o fuso do evento (`America/Sao_Paulo`).
- 📍 **Localização e Navegação:** Integração direta com Google Maps e Waze para o Videira Hall (Indaiatuba/SP).
- 📅 **Adicionar ao Calendário:** Suporte nativo a Google Agenda e download de arquivo `.ics` (Apple Calendar / Outlook).
- 💬 **RSVP pelo WhatsApp:** Confirmação de presença personalizada com mensagem pré-formatada.
- 📱 **PWA & Compartilhamento Rico (SEO):** Otimizado com Open Graph banner em alta resolução (`1200x630`), ícones em múltiplos formatos e manifesto PWA para prévias perfeitas no WhatsApp, Instagram e iMessage.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/) + CSS GPU (`translate3d` / `opacity`)
- **Scroll Suave:** [@studio-freight/lenis](https://github.com/darkroomengineering/lenis)
- **Efeitos de Celebração:** [canvas-confetti](https://github.com/catdad/canvas-confetti)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ (recomendado 20 ou 22+)
- Gerenciador de pacotes `npm`

### Instalação

```bash
# Clone o repositório
git clone https://github.com/gomeslxy/convite-carol-18.git

# Acesse o diretório
cd convite-carol-18

# Instale as dependências
npm install
```

### Scripts Disponíveis

```bash
# Modo de desenvolvimento (http://localhost:3000)
npm run dev

# Verificação de tipos TypeScript
npm run typecheck

# Build otimizado de produção
npm run build

# Execução local da build de produção
npm run start
```

> **Dica Windows/PowerShell:** Se houver bloqueio de execução de scripts na sua máquina, use `npm.cmd run dev` ou configure `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`.

---

## ⚙️ Configuração Centralizada

Todas as informações do evento são centralizadas e editadas exclusivamente em:

📁 **`src/config/event.ts`**

```typescript
export const EVENT: EventConfig = {
  siteUrl: "https://convitecarol.site",
  name: "Carol",
  initial: "C",
  age: 18,
  dateISO: "2027-07-16T20:00:00-03:00",
  durationHours: 6,
  timeZone: "America/Sao_Paulo",
  dressCode: "Esporte Fino",
  dressCodeNote: "Tons de azul royal e prata são reservados à aniversariante.",
  venue: {
    name: "Videira Hall",
    address: "Alameda José Boldrini - Bairro Videiras, Indaiatuba - SP",
    mapsQuery: "Videira Hall, Alameda José Boldrini - Bairro Videiras, Indaiatuba - SP",
  },
  rsvp: {
    whatsapp: "5519971345909",
    // ...
  },
};
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── calendar/
│   │   │   └── route.ts         # Endpoint GET servindo arquivo .ics (RFC 5545) com abertura nativa no iOS
│   │   └── rsvp/
│   │       └── route.ts         # Endpoint POST opcional (RSVP_WEBHOOK_URL) com proteção Origin/fórmula/tamanho
│   ├── globals.css              # Variáveis CSS, temas perolados, gradientes e texturas
│   ├── layout.tsx               # Metadados SEO, Open Graph, JSON-LD, themeColor (#F4F5F7) e fontes tipográficas
│   ├── opengraph-image.tsx      # Banner Open Graph dinâmico (1200x630) derivado de event.ts
│   ├── page.tsx                 # Ponto de entrada da aplicação
│   ├── robots.ts                # Regras de indexação apontando para sitemap.xml
│   ├── sitemap.ts               # Sitemap XML oficial de https://convitecarol.site
│   └── twitter-image.tsx        # Banner Twitter Card dinâmico (1200x630) derivado de event.ts
├── components/
│   ├── BowDecoration.tsx        # Laços acetinados decorativos vetorizados em SVG
│   ├── CountdownTimer.tsx       # Contador regressivo isolado com relevo 3D e zero CLS
│   ├── CoverGate.tsx            # Capa bipartida com portas e broche metálico interativo
│   ├── HeroPoster.tsx           # Pôster hero animado com iluminação e tipografia
│   ├── InvitationContent.tsx    # Orquestrador contínuo das seções pós-pôster e atalhos de agenda
│   ├── InvitationExperience.tsx # Orquestrador de pré-carregamento, MotionConfig e transições de abertura
│   ├── LocationSection.tsx      # Seção Local da Festa isolada com mapa lazy, Waze, Maps e cópia
│   ├── LuxuryParticles.tsx      # Celebração sob demanda via canvas-confetti no RSVP
│   ├── Ornaments.tsx            # Divisores e cantoneiras prateadas editoriais
│   ├── Preloader.tsx            # Tela de carregamento inicial sincronizada com fontes e imagens
│   ├── RsvpSection.tsx          # Formulário RSVP isolado com validação, acompanhantes e recibo local
│   └── SmoothScrollProvider.tsx # Provider de scroll inercial (Lenis em RAF sob demanda)
├── config/
│   └── event.ts                 # Configurações do evento e formatadores de data determinísticos
└── lib/
    ├── og-image.tsx             # Gerador compartilhado do banner social (Open Graph / Twitter) com Cinzel Bold
    └── utils.ts                 # Utilitários para Maps, Waze, Google Calendar, .ics (RFC 5545), WhatsApp e validação RSVP
```

> **Persistência Opcional do RSVP:** Caso defina a variável de ambiente `RSVP_WEBHOOK_URL` na Vercel (ex.: Apps Script do Google Sheets), o endpoint `/api/rsvp` registrará automaticamente todas as confirmações antes mesmo de o convidado concluir o envio no WhatsApp. Sem essa variável, o fluxo continua operando 100% normalmente com recibo salvo em `localStorage` e redirecionamento para o WhatsApp.

---

## 🚢 Deploy na Vercel

O projeto está pronto para deploy com zero configuração extra:

1. Importe o repositório no seu dashboard da [Vercel](https://vercel.com).
2. O framework preset será detectado automaticamente como **Next.js**.
3. O build command padrão `npm run build` gerará a aplicação otimizada.
4. Conecte o domínio customizado `convitecarol.site`.

---

## 👤 Autor

- **Lucas Gomes do Amaral** ([@gomeslxy](https://github.com/gomeslxy))
- **E-mail:** [la181009@gmail.com](mailto:la181009@gmail.com)
- **Portfólio / GitHub:** [github.com/gomeslxy](https://github.com/gomeslxy)
