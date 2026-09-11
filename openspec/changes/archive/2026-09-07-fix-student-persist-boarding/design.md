## Context

Ver proposal.md. O formulário já chama `addStudent`/`updateStudent`, `assignSeat` e `updateRoute` quando a rua é nova (`resolvedStreet` = `customStreet` ou `boardingStreet`). A UI atual usa **dois** estados (`boardingStreet` + `customStreet`) e lista de ruas como botões, o que parece um dropdown rígido. Persistência: `persistReducer` na raiz inclui `students`; `storage.ts` usa timeout de 2s que resolve mesmo se o `setItem` atrasar. `persistor` está em `manualPersist`. Main spec `student-registry` ainda não está em `openspec/specs/` (só nos deltas de `add-students-crud` / `improve-cadastros`).

## Goals / Non-Goals

**Goals:**
- Aluno na listagem após Salvar; assento ocupado; rua livre + chips + autoinclusão.
- Encontrar e corrigir a causa real (submit silencioso, persist, ou estado da rua), não só “despachar de novo”.

**Non-Goals:**
- Novo tipo `Student`.
- Logs permanentes em produção.
- Reordenar ruas no formulário do aluno.

## Decisions

1. **Um campo de rua**  
   Estado único `boardingStreet`. Chips preenchem o input; o usuário edita o texto.  
   Alternativa: manter `customStreet` separado. Rejeitada — é a fonte da “rigidez”.

2. **Submit síncrono e explícito**  
   Gerar `studentId` antes dos dispatches; `addStudent`/`updateStudent` primeiro; em seguida `assignSeat` com o **mesmo** id; depois `updateSchool` / `updateRoute` se a rua for nova (`trim`, comparação case-sensitive como hoje). Não usar `push` mutável no array persistido — sempre `[...streetsCovered, rua]`.

3. **Diagnóstico de persist**  
   Logs em `__DEV__` no `extraReducers` ou no reducer via wrapper **temporário**; confirmar `students/addOne` no store. Se o aluno some após reload: inspecionar `storage.setItem` (timeout) e `manualPersist`. Corrigir a causa; tirar os logs na última tarefa.

4. **canSubmit**  
   Se o Salvar parece “não fazer nada”, o botão desabilitado por rua/assento/telefone é o primeiro suspeito. Feedback visual já existe (botão cinza); não exigir toast nesta change.

5. **Git**  
   Implementar na branch que já tem `app/students/` (hoje `feat/ajustes-e-melhorias-cadastros`), não criar CRUD paralelo.

## Risks / Trade-offs

- [Timeout do AsyncStorage] → se for a causa, aumentar timeout ou não resolver sucesso no timeout do `setItem`.
- [Rota sem `title` em dados velhos] → não bloqueia rua; chips usam `streetsCovered`.
- [Duplicata de rua] → não inserir se `includes` após `trim`.

## Migration Plan

Nenhuma migração de schema. Rollback = reverter o formulário.

## Open Questions

Nenhuma. Comparação de ruas permanece exata após `trim` (sem case-fold nesta change).
