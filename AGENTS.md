# Protocolo de Engenharia e Base de Conhecimento (`convite-carol-18` / `convitecarol.site`)

Este repositório utiliza uma **Base de Conhecimento viva no estilo Obsidian (Second Brain / Zettelkasten técnico)** localizada no Vault oficial **`Docs/`** (`C:\Users\la181\Documents\carol\Docs`), em conjunto com a Agent Skill **`obsidian-vault-docs`** (`.agents/skills/obsidian-markdown/SKILL.md`).

---

## 1. Regra de Leitura Prévia (Context First)

* **ANTES** de propor planos, editar código, criar componentes, refatorar estilos ou corrigir bugs, o agente **DEVE obrigatoriamente** ler `Docs/00-INDEX.md`, `Docs/00-visao-geral-e-identidade.md` e as notas da pasta `Docs/` relacionadas ao módulo que será alterado.
* **Nunca** assuma como o código funciona sem consultar simultaneamente a documentação viva em `Docs/` e os arquivos-fonte atuais em `src/`.

---

## 2. Regra de Atualização Contínua (Trace & Document)

* **TODA** alteração feita no projeto (nova feature, refatoração, ajuste visual, correção de bug ou decisão arquitetural) **DEVE** ser documentada na pasta `Docs/` antes de encerrar a tarefa.
* Registre decisões arquiteturais (ADRs) e mudanças relevantes em `Docs/05-changelog-e-decisoes.md` e bugs/armadilhas resolvidas em `Docs/06-aprendizados-e-troubleshooting.md`, além de manter atualizadas `Docs/00-visao-geral-e-identidade.md` e as notas específicas do módulo alterado (`01`, `02`, `03`, `04`).
* **Nunca** deixe a documentação em `Docs/` defasada em relação ao código-fonte.

---

## 3. Padrão Nativo Obsidian Vault (`Docs/`)

* O cofre oficial do Obsidian está em **`Docs/`** (atenção ao `D` maiúsculo).
* **Preserve** quaisquer configurações existentes em `Docs/.obsidian/` e garanta que `Docs/.obsidian/workspace*.json` permaneça no `.gitignore` para não versionar estado local de janelas.
* Utilize **links bidirecionais/cruzados** com Wikilinks (`[[nome-do-arquivo]]`, `[[nome-do-arquivo#secao|alias]]`) e links Markdown relativos (`[Título](./nome-do-arquivo.md)`) para manter o **Graph View** limpo e navegável tanto no Obsidian quanto no GitHub/VS Code.
* Utilize **Callouts do Obsidian** (`> [!important]`, `> [!warning]`, `> [!tip]`, `> [!bug]`) e **diagramas Mermaid** (`flowchart`, `stateDiagram-v2`, `sequenceDiagram`) para documentar fluxos técnicos e estados.
* Toda nota `.md` em `Docs/` deve começar com **YAML Frontmatter (Obsidian Properties)** contendo:
  * `title`, `aliases`, `tags`, `status`, `updated`, `related` (com wikilinks entre aspas no YAML, ex.: `"[[00-INDEX]]"`).

---

## 4. Diretrizes Invioláveis do Projeto

* **Identidade Visual:** Paleta estrita **Azul Royal**, **Branco/Off-White Perolado** e **Prata Metálico**. **Proibição estrita de elementos florais** — utilizar exclusivamente lacinhos de fita acetinada (`BowDecoration.tsx`).
* **Configuração Única:** Dados do evento (nome, idade, data/hora, citações, traje, local, WhatsApp e Pix) vivem centralizados em `src/config/event.ts`.
* **Ambiente Windows/PowerShell:** Sempre executar comandos npm via `npm.cmd` (ex.: `npm.cmd run typecheck`, `npm.cmd run build`).

