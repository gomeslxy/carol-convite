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
updated: 2026-11-17
related:
  - "[[00-INDEX]]"
  - "[[01-arquitetura-e-estrutura]]"
  - "[[02-envelope-3d-e-animacoes]]"
  - "[[03-design-system-e-responsividade]]"
---

# 00 · Visão Geral e Identidade (`convitecarol.site`)

> [!info] Propósito do Projeto
> **Convite Digital Interativo — 18 Anos da Carol (Caroline Maria)** (`https://convitecarol.site`), projetado com estética editorial contínua em papel texturizado claro *mobile-first* (`100dvh`) para compartilhamento rápido via WhatsApp e experiência completa em Desktop.

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
> * **Paleta Oficial:** **Azul Royal / Marinho Nobre** (`#071739`, `#0A2463`, `#172554` a `#3B82F6`), **Branco / Papel Off-White Texturizado** (`#FFFFFF` / `#F8FAFC` / `#F1F2F4` / `#EEF2F7`) e **Prata Metálico** (`#E2E8F0` a `#64748B`).
> * **Proibição de Elementos Florais:** É terminantemente proibido usar flores, folhas ou arranjos florais em qualquer SVG, imagem ou ornamento.
> * **Ornamento Exclusivo:** Utilizar **lacinhos de fita acetinada** (`BowDecoration.tsx`), filigranas geométricas/arabescos imperiais em prata e azul royal, estrelas facetadas em prata/glitter azul (`GlitterBlueStar`, `MetallicSilverStar`), globos espelhados vetoriais e balões glossy azul royal.
> * **Proibição Estrita de Sugestões de Presentes / Pix:** É terminantemente proibido incluir qualquer menção, botão, modal, ícone, chave Pix ou lista de sugestões de presentes no convite (considerado inconveniente para o evento).
> * **Data e Traje Oficiais:** **17 de Julho de 2027** (`17/07`), às **19:30**, com traje **Esporte Fino** (tons de azul royal e prata reservados à aniversariante).

---

## Experiência Interativa Contínua

1. **Capa Bipartida Interativa (`CoverGate.tsx`):** Tela cheia (`100dvh`) com duas portas verticais em papel artesanal off-white/pérola (`#F4F5F7`, `bg-paper-fine`), sombra interna (`inset`) e filete prata/azul-marinho na junção central realista, cantoneiras e molduras lineares minimalistas em prata fosca (`#B8C0CC`) e azul royal (`#0A2463`). Ao centro, o **brasão barroco perolado com coroa e inicial `"C"` em azul royal** (`brasao-barroco-c.png`), com `drop-shadow` multicamada realista (sem efeitos de brilho/shimmer) e o texto curvo **`✦ TOQUE PARA ABRIR ✦`** contornando a base do brasão. Ao tocar/clicar, dispara resposta tátil *spring*, dispersão de partículas (`fireLuxuryCelebration`), dissolve o brasão em `350ms` e desliza as portas laterais em `950ms` (`cubic-bezier(0.22, 1, 0.36, 1)`).
2. **Pôster Hero Animado (`HeroPoster.tsx`):** Recriação 100% em código (React + SVG + Tailwind + Framer Motion) do pôster principal sem corte reto na base, com 3 globos espelhados 3D (`MirrorDiscoBall`) com *parallax* no scroll, letreiro metálico `"HAPPY BiRthdAy"` em blocos retangulares com entrada *staggered*, estrelas em glitter azul royal e prata 3D chanfrada, bloco editorial da data (`Julho · SÁB | 17 | 19:30 · 2027`) e a foto P&B da Carol bebê (`carol-cutout.png`) vestindo chapéu cônico em glitter azul royal com pompom, laço azul acetinado e cluster de balões glossy azul royal.
3. **Continuação Contínua em Papel Texturizado (`InvitationContent.tsx`):** O mesmo papel artesanal (`bg-poster-paper`) segue sem interrupções do pôster ao rodapé, conectado nas laterais por `GlitterBlueStar` e `MetallicSilverStar`:
   * **Apresentação & Contagem Regressiva:** Pílula azul-marinho **`CAROL • 18 ANOS`** entre filetes, citação de Walt Disney e texto de convite em tipografia serifada clássica, **`CountdownTimer`** no estilo visual do bloco de data do pôster e atalhos para **Google Agenda** e **iPhone / Outlook (`.ics`)**.
   * **Local da Festa (Seção Integrada):** Título serifado ladeado por linhas horizontais, nome do espaço (`Espaço Royal Eventos`), endereço completo, faixa de **Horário (`19:30`)** e **Traje (`Esporte Fino`)**, mapa embed do Google Maps e botões funcionais para **Google Maps**, **Waze** e **Copiar Endereço**.
   * **Confirmação de Presença / RSVP (Seção Integrada):** Formulário completo com seletor de presença, nome completo, quantidade total de pessoas, campos dinâmicos para **nome de cada acompanhante**, recado opcional, celebração estelar (`fireMiniCelebration`), **feedback visual de confirmação na tela** e envio formatado para o **WhatsApp**.

Veja também: [[00-INDEX]], [[01-arquitetura-e-estrutura]], [[02-envelope-3d-e-animacoes]], [[03-design-system-e-responsividade]].
