---
name: obsidian-vault-docs
description: Create, read, and maintain Obsidian Flavored Markdown (OFM), Obsidian Bases, and JSON Canvas files in the Docs/ Vault using wikilinks, embeds, callouts, YAML properties, and Mermaid diagrams. Activate automatically whenever reading or documenting notes inside Docs/ or managing the project's knowledge base.
---

# Obsidian Vault Docs (`kepano/obsidian-skills` Standard)

Esta skill capacita o agente a ler, criar e manter notas em **Obsidian Flavored Markdown (OFM)**, **Obsidian Bases** e **JSON Canvas** dentro do Vault oficial do projeto localizado em `Docs/`.

---

## 1. YAML Frontmatter (Obsidian Properties)

Toda nota `.md` em `Docs/` **deve** iniciar com bloco YAML válido na linha 1:

```yaml
---
title: Título Legível da Nota
aliases:
  - Apelido ou termo de busca
tags:
  - area/subtema
  - convite-carol
status: active # draft | active | archived
updated: 2026-11-13
related:
  - "[[00-INDEX]]"
---
```

**Regras de Properties:**
- Sempre envolva wikilinks dentro do YAML com aspas duplas (`"[[00-INDEX]]"`), pois colchetes sem aspas são interpretados como arrays YAML inválidos.
- Use `tags` em `kebab-case` sem `#` no frontmatter.
- Atualize o campo `updated` (`YYYY-MM-DD`) sempre que modificar uma nota.

---

## 2. Wikilinks, Links Relativos e Embeds

Para maximizar a compatibilidade tanto com o **Graph View** do Obsidian quanto com o preview do **GitHub/VS Code**:

- **Wikilinks internos (preferencial para Graph View):**
  - Nota: `[[01-arquitetura-e-estrutura]]`
  - Com alias: `[[01-arquitetura-e-estrutura|Arquitetura do Projeto]]`
  - Seção específica: `[[02-envelope-3d-e-animacoes#Máquina de Estados|Máquina de Estados]]`
  - Bloco específico: `[[06-aprendizados-e-troubleshooting#^safari-preserve-3d]]` (definido com `^safari-preserve-3d` ao final do parágrafo).
- **Links Markdown relativos:** `[Arquitetura](./01-arquitetura-e-estrutura.md)` podem ser combinados em índices ou tabelas quando útil para navegação fora do Obsidian.
- **Links externos (web):** sempre use Markdown padrão `[Vercel](https://vercel.com)`.
- **Embeds:** use `![[nome-da-nota]]` ou `![[nome-da-nota#Seção]]` para transcluir conteúdo vivo sem duplicar texto.

---

## 3. Callouts Nativos do Obsidian

Use Callouts para destacar regras, alertas, bugs e decisões:

```markdown
> [!important] Regra Obrigatória
> Texto de destaque permanente.

> [!warning] Atenção
> Risco técnico ou restrição de plataforma.

> [!tip]- Dica Dobrável (inicia fechada com `-`)
> Conteúdo recolhido por padrão; use `+` para iniciar aberto.

> [!bug] Bug Resolvido
> Descrição da causa raiz e solução.

> [!example] Exemplo
> Trecho ilustrativo.
```

Tipos suportados nativamente: `note`, `abstract`, `info`, `todo`, `tip`, `success`, `question`, `warning`, `failure`, `danger`, `bug`, `example`, `quote`, `important`.

---

## 4. Diagramas Mermaid no Obsidian

O Obsidian renderiza Mermaid nativamente em blocos ` ```mermaid `:

- Prefira `flowchart TD` / `flowchart LR`, `stateDiagram-v2` e `sequenceDiagram`.
- Sempre coloque labels com caracteres especiais (parênteses, colchetes, barras) entre aspas: `A["Envelope (idle)"] --> B["Abrindo (unsealing)"]`.
- Evite tags HTML (`<br/>`) dentro de nós Mermaid.

---

## 5. JSON Canvas (`.canvas`) e Obsidian Bases (`.base`)

Quando necessário mapear grafos arquiteturais visuais ou visões tabulares do Vault:

- **JSON Canvas (`.canvas`):** Segue a especificação aberta JSON Canvas 1.0 (`{ "nodes": [...], "edges": [...] }`), onde nós podem referenciar arquivos do vault (`"type": "file", "file": "02-envelope-3d-e-animacoes.md"`) ou blocos de texto (`"type": "text"`).
- **Obsidian Bases (`.base`):** Arquivos YAML declarativos com `filters` e `views` para filtrar e tabular notas pelas Properties (`status`, `tags`, `updated`).

---

## 6. Fluxo Obrigatório no Vault `Docs/`

1. **Nunca altere ou delete `Docs/.obsidian/`** (exceto preservar que `workspace*.json` permaneça no `.gitignore`).
2. **Antes de codar:** leia `Docs/00-INDEX.md` e as notas relacionadas ao módulo.
3. **Após codar:** registre decisões em `Docs/05-changelog-e-decisoes.md`, armadilhas/soluções em `Docs/06-aprendizados-e-troubleshooting.md` e atualize as notas técnicas afetadas.

