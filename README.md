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
- **Animações:** [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/) (ScrollTrigger)
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
  dateISO: "2027-07-17T20:30:00-03:00",
  durationHours: 5,
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
│   ├── globals.css              # Variáveis CSS, temas perolados, gradientes e texturas
│   ├── layout.tsx               # Metadados SEO, Open Graph, Favicons e fontes tipográficas
│   └── page.tsx                 # Ponto de entrada da aplicação
├── components/
│   ├── BowDecoration.tsx        # Laços acetinados decorativos vetorizados em SVG
│   ├── CountdownTimer.tsx       # Contador regressivo com relevo 3D
│   ├── CoverGate.tsx            # Capa bipartida com portas e broche metálico interativo
│   ├── HeroPoster.tsx           # Pôster hero animado com iluminação e tipografia
│   ├── InvitationContent.tsx    # Seções de detalhes, mapa, calendário e RSVP
│   ├── InvitationExperience.tsx # Orquestrador principal das transições de abertura
│   ├── Ornaments.tsx            # Divisores e cantoneiras prateadas editoriais
│   └── SmoothScrollProvider.tsx # Provider de scroll inercial (Lenis + GSAP)
├── config/
│   └── event.ts                 # Configurações do evento e formatadores de data determinísticos
└── lib/
    └── utils.ts                 # Utilitários para Maps, Waze, Google Calendar, .ics e WhatsApp
```

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
