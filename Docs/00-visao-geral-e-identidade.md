---
title: 00 - Visão Geral e Identidade
aliases:
  - Visão Geral
  - Identidade Visual
  - Regras do Projeto
tags:
  - visao-geral
  - identidade-visual
  - convite-carol
status: active
updated: 2026-11-14
related:
  - "[[00-INDEX]]"
  - "[[01-arquitetura-e-estrutura]]"
  - "[[02-envelope-3d-e-animacoes]]"
  - "[[03-design-system-e-responsividade]]"
---

# 00 · Visão Geral e Identidade (`convitecarol.site`)

> [!info] Propósito do Projeto
> **Convite Digital Interativo — 18 Anos da Carol (Caroline Maria)** (`https://convitecarol.site`), projetado para compartilhamento rápido via WhatsApp (mobile-first em `100dvh`) com experiência imersiva completa em Desktop.

---

## Dados Oficiais do Evento (`src/config/event.ts`)

* **Aniversariante:** Carol (`Caroline Maria`) — **18 anos**
* **Data e Horário:** **17 de Julho de 2027**, às **19:30** (fuso `America/Sao_Paulo`)
* **Traje:** **Esporte Fino** — *"Tons de azul royal e prata são reservados à aniversariante."* (`EVENT.dressCodeNote`)
* **Local Padrão Configurado:** Espaço Royal Eventos — Alameda José Boldrini - Bairro Videiras, Indaiatuba - SP

> [!quote] Frase Oficial de Abertura
> “Você pode sonhar, criar, desenhar e construir o lugar mais maravilhoso do mundo. Mas é necessário ter pessoas para transformar seu sonho em realidade.” – Walt Disney
>
> *Por isso, você não poderia deixar de fazer parte de um dos dias mais especiais pra mim.*

---

## Identidade Visual e Regras Editoriais Invioláveis

> [!important] Regras Estritas do Projeto
> * **Paleta Oficial:** **Azul Royal** (`#172554` a `#3B82F6`), **Branco / Off-White Perolado** (`#FFFFFF` / `#F8FAFC`) e **Prata Metálico** (`#E2E8F0` a `#64748B`).
> * **Proibição de Elementos Florais:** É terminantemente proibido usar flores, folhas ou arranjos florais em qualquer SVG, imagem ou ornamento.
> * **Ornamento Exclusivo:** Utilizar **lacinhos de fita acetinada** (`BowDecoration.tsx`), acompanhados apenas por estrelas de 4 pontas (`✦`), balões metalizados (`18`), globo espelhado e adesivos temáticos em PNG sem fundo.
> * **Proibição Estrita de Sugestões de Presentes / Pix:** É terminantemente proibido incluir qualquer menção, botão, modal, ícone, chave Pix ou lista de sugestões de presentes no convite (considerado inconveniente para o evento).
> * **Data e Traje Oficiais:** **17 de Julho de 2027** (`17/07`), às **19:30**, com traje **Esporte Fino** (tons de azul royal e prata reservados à aniversariante).

---

## Experiência Interativa

1. **Gateway 3D de Alta Papelaria (`Envelope3DOpening.tsx`):** Envelope em Azul Royal & Prata com forro geométrico interno, oclusão de dobras, selo de joalheria `"C · 18"` com lacinho acetinado e tração magnética no desktop, legenda em pílula perolada (`glass-pearl-pill`), abertura coreografada por timeline GSAP e disparo de confetes vetoriais (`canvas-confetti`) calibrado para 60fps no mobile.
2. **Carta do Convite (`InvitationContent.tsx`):** Folha acetinada em Azul Royal degradê (`bg-royal-letter`) com trama de linho em gradiente CSS leve (`--linen-grain`), cantoneiras geométricas (`CornerFiligree`), reflexo especular estático de joalheria (`.interactive-sheen`), colagem editorial da Carol (`CarolHeroCollage.tsx`), citação de Walt Disney emoldurada, altar da data `17/07` com botão integrado **"Salvar na Agenda"** (Google Agenda / `.ics`), **contador regressivo** em cápsulas de cristal (`CountdownTimer.tsx`) ativado após a abertura e card de traje **"Esporte Fino"**.
3. **Ações Rápidas (`InteractiveActions.tsx`):** 2 medalhões em composição diagonal equilibrada (esquerda/direita) com aro duplo cromado, subtítulos descritivos e micro-indicadores de ação:
   * **Local da Festa (`LocationSheet.tsx`):** Cartão perolado de endereço copiável, mapa embed com moldura cromada, rotas via Google Maps/Waze e salvar na agenda (Google Agenda / `.ics`).
   * **Confirmar Presença (`RsvpSheet.tsx`):** Formulário validado com alertas na paleta oficial, seleção de presença, número de acompanhantes, contador de caracteres, micro-celebração estelar (`fireMiniCelebration`) e envio direto para o WhatsApp.

Veja também: [[00-INDEX]], [[01-arquitetura-e-estrutura]], [[02-envelope-3d-e-animacoes]], [[03-design-system-e-responsividade]].

