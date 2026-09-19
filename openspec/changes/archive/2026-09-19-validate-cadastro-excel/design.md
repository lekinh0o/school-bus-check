## Context

See proposal.md — Why. Motor, apply e revisão já existem em `lib/excel/` e `CadastroExcelPanel`. A spec principal `cadastro-excel` é a fonte do contrato. `excel.test.ts` cobre abas, matching, um caso de isolamento de aluno e round-trip; faltam casos 1:1 com a matriz da issue 04. Não há script de lint. Issue 05 (lote, fuzzy, criar dependência) permanece fora.

## Goals / Non-Goals

**Goals:**
- Fechar a matriz da issue 04 no motor (Node) e um passeio manual curto na UI.
- Relatório com OpenSpec usado, contrato, comandos, limitações e critérios de aceite.
- Corrigir só o que a spec já exige e o código falhar.

**Non-Goals:**
- Nova coluna de rota, matching aproximado, lote, sugestões, histórico persistido de importação.
- Introduzir ESLint nesta change.
- Testes de componente React Native.

## Decisions

1. **Sem delta spec.** `skip_specs: true`: o comportamento já está em `cadastro-excel`. Testes e relatório não são requisitos novos. Alternativa: inventar um requirement de “auditoria” — rejeitada porque não é comportamento observável do app.

2. **Oráculo = spec, não o texto solto da issue.** “Código da rota” = título + escola. Duplicidade de rota = mesmo par no arquivo ou no cadastro. Alternativa: criar código de rota — rejeitada pela change #30.

3. **Isolamento por snapshot das quatro fatias.** Antes/depois de `applyImportPlan`, comparar JSON serializável de veículos, escolas, rotas e alunos. Entidade ausente no arquivo MUST ser deep-equal. Vínculos estruturais de aluno (`studentIds`, assento) só mudam quando a aba `Alunos` veio, como a spec já diz.

4. **Arquivo vazio vs ilegível.** Workbook XLSX sem abas do contrato → plano vazio, aba ausente não é erro. Buffer que o SheetJS não lê → o parser pode lançar; o controlador já captura e a UI mostra falha. Não engolir o throw no planner só para “passar teste”.

5. **Relatório na change.** `AUDIT.md` nesta pasta (vai com o archive). Não entra no `README` além de um link se o apply achar necessário; o produto da issue é o relatório, não um guia de usuário.

6. **Manual mínimo.** Quatro exportações individuais + uma completa; um arquivo de uma aba e um das quatro; um reimport do export. Kit `Downloads/test-bus` pode complementar, mas não substitui os testes Node.

## Risks / Trade-offs

- [UI sem teste automatizado] → Matriz manual explícita e limitações no `AUDIT.md`.
- [Falha real vs spec] → Corrigir código; se a spec estiver errada, parar e abrir delta — não silenciar.
- [Lint ausente] → Documentar; não inventar pipeline.

## Migration Plan

Nenhuma migração de persistência. Rollback = reverter os testes e o relatório.

## Open Questions

Nenhuma que altere o recorte: lint continua ausente; issue 05 continua fora.
