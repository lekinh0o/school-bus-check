## Context

See proposal.md for motivation. A sessão vive em `attendance.activeExecution` (`types/execution.ts`). `startRouteExecution` gera um `id` com `Date.now().toString()` mas não grava ISO; `finishRouteExecution` só marca `COMPLETED` e a próxima partida sobrescreve o objeto. Chamada diária (`attendance.attendance`) permanece à parte. Persistência já é redux-persist na raiz (`store/store.ts`, migrate 3).

## Goals / Non-Goals

**Goals:**
- Estender o modelo da sessão com ISO strings serializáveis e copiar um snapshot imutável para `executionHistory` no encerramento.
- Uma tela de detalhe que lê o snapshot; a sessão ao vivo continua em `app/routes/execute/[id].tsx`.

**Non-Goals:**
- Sincronizar histórico com a chamada manhã/tarde.
- Relatórios, exportação, edição de logs depois de encerrar.
- Relógio de servidor (o relógio do aparelho é a fonte).

## Decisions

1. **Histórico no slice de presença, não um slice novo.** `AttendanceState.executionHistory: RouteHistory[]`. A persistência já inclui `attendance`; evita um segundo persist key. Alternativa (slice `history`) só valeria se o volume crescer e precisar de política de retenção isolada.

2. **Nomes de tipo.** Não reutilizar `StudentAttendance` de `types/attendance.ts`. Estender `ExecutionStudentAttendance` com `recordedAt?: string`. Novo `PointLog` (`pointId` = token de `pointsList`, `status`, `timestamp`) e `RouteHistory` (snapshot: `id`, `routeId`, `schoolId`, `direction`, `startedAt`, `finishedAt`, `pointLogs`, `attendances`, `metrics`). O campo do usuário `boardingPoint` no log mapeia para o token do ponto (id de embarque ou `schoolId`).

3. **Quando gravar log de ponto.** Helper único chamado em auto-avanço, `advanceToNextPoint` (Concluir) e `skipCurrentPoint`. No `finishRouteExecution`, se o último ponto ainda não tiver log, gravar `COMPLETED` e então `finishedAt`, métricas e push no histórico. `goToPreviousPoint` não remove logs (auditoria do que já aconteceu).

4. **`recordedAt` na correção.** Qualquer mudança efetiva de status na sessão ao vivo atualiza `recordedAt` (último clique vence), inclusive na tab Resumo. No histórico, a lista só exibe o valor persistido.

5. **Encerrar limpa `activeExecution`.** Depois do snapshot, `activeExecution = null` para o Início não tratar viagem morta como em andamento. Alternativa (deixar `COMPLETED` no ativo) conflitaria com “iniciar outra” e com a UI de execução.

6. **Dashboard.** `FlatList` das viagens (mais recente primeiro) com `ListHeaderComponent` = lista de rotas para iniciar. Duração: diferença `finishedAt - startedAt` formatada em minutos (arredondar para cima se < 1 min mostrar “1 min”). Sentido: IDA / VOLTA com ícone solar/lua no card.

7. **Detalhe.** Rota Expo `app/history/[id].tsx` (stack no `_layout` raiz, como `routes`). Abas Timeline | Resumo. Nomes de ponto: lookup em `boardingPoints` / escola; planta: mesmo critério da execução (veículo majoritário dos alunos da rota). `BusSeatMap` ganha `readOnly` para não tratar toque como seleção; botões de status ficam fora da árvore.

8. **ISO no reducer.** `new Date().toISOString()` no momento da action (serializável). Sem `Date` no state.

9. **Migrate persist 4.** `executionHistory: []` se ausente. Sessões `IN_PROGRESS` antigas sem `startedAt`/`pointLogs` recebem defaults vazios / `startedAt` omitido até nova partida.

## Risks / Trade-offs

- [Relógio do aparelho errado] → Mitigação: timestamps são relativos àquele device; suficiente para auditoria local.
- [Auto-avanço e Concluir duplicarem log] → Mitigação: log só se o `pointId` ainda não existir em `pointLogs`.
- [AsyncStorage crescer] → Mitigação: v1 sem teto; se necessário, cortar as mais antigas depois (não muda o contrato da spec).
- [Histórico órfão se a rota for apagada] → Mitigação: guardar `routeId` e resolver título com fallback (“Rota removida”).

## Migration Plan

- Bump `persist` version para 4; migration preenche `executionHistory`.
- Rollback: reverter o migrate não apaga dados novos; clientes antigos ignoram campos extra no persist até o próximo load com código novo.

## Open Questions

Nenhum que altere spec ou tarefas; retenção máxima fica para um change futuro se o storage pesar.
