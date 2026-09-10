## Context

Ver proposta. Já existe `cycleJustification` na **sessão nova** quando a VOLTA começa sem IDA do dia (`StartRouteSheet` + `startRouteExecution`). O histórico vive em `attendance.executionHistory` (não há `historySlice`). Persistência `redux-persist` versão 5. Tipo `Route` não tem operação. Sentido da sessão continua IDA/VOLTA.

## Goals / Non-Goals

**Goals:**

- Campo `operationType` na rota, default e migrate `IDA_E_VOLTA`.
- Helper puro que, dado histórico + `routeId`, devolve a Ida incompleta (se houver).
- Modal de ciclo incompleto **antes** de `startRouteExecution` da nova Ida; persistir o motivo na `RouteHistory` daquela Ida.
- Painel de sentido filtrado pelo tipo; rota `SOMENTE_VOLTA` ignora o modal “nenhuma IDA hoje”.

**Non-Goals:**

- Backend, sync entre aparelhos, calendário escolar, fechar ciclo automaticamente à meia-noite.
- Mudar a regra de “criança na van” ou o fluxo de execução ponto a ponto.
- Exigir justificativa para iniciar a Volta que fecha o par.

## Decisions

1. **Ciclo incompleto = última viagem encerrada da rota é IDA sem VOLTA com `startedAt` posterior.** Ordenar por `startedAt`. Ignorar sessão `IN_PROGRESS`. Não exigir que a Ida seja “ontem”: qualquer Ida mais recente sem Volta depois trava a *próxima Ida*. Completar Volta não trava.

   Alternativa: só “dia anterior”. Rejeitada porque uma segunda Ida no mesmo dia também quebraria o par.

2. **Justificativa na Ida antiga, não na viagem nova.** Ação tipo `justifyIncompleteCycle({ routeId, justification })` atualiza aquela `RouteHistory`. A nova Ida pode ir sem `cycleJustification` (a auditoria fica no ciclo fechado). O modal de VOLTA sem IDA do dia continua gravando na *nova* Volta.

   Kinds novos (além dos atuais): `return_done_offline` | `period_cancelled` | `free_text` (texto em `note`). Reutilizar `free_text` para “Outro”.

3. **`operationType` obrigatório no modelo após migrate**, não opcional na prática: TypeScript `operationType: OperationType`; rotas sem campo na persistência ganham `IDA_E_VOLTA` na migration 6.

4. **UI do cadastro:** três opções no mesmo padrão visual do período (pressables), não dropdown nativo.

5. **Dois modais no sheet:** (a) ciclo incompleto ao iniciar Ida; (b) VOLTA sem IDA do dia. Sequência: se Ida + ciclo incompleto → (a); senão segue o fluxo atual de Volta.

6. **Não criar slice novo.** Seletores em `attendanceSlice` + helper em `executionSession.ts` ou `lib/` com `localDateKey` só para o texto da data no modal.

## Risks / Trade-offs

- [Duas justificativas no mesmo objeto `cycleJustification`] → Mitigation: kinds distintos; detalhe do histórico já ramifica por `kind`.
- [Ida em andamento não encerrada] → Mitigation: só viagens `COMPLETED` no histórico; sessão ativa já impede outro start na prática do fluxo atual.
- [Migration] → Mitigation: versão 6 copia `IDA_E_VOLTA` em toda rota; rollback = não usar o campo (código trata ausente como Ida e Volta).

## Migration Plan

1. Branch `feat/validacao-ciclo-par-rotas` a partir de `main` atualizado.
2. Migration persist 5 → 6.
3. Sem dados remotos para migrar.

## Open Questions

Nenhuma que altere spec ou tarefas: chips do modal seguem o texto da issue.
