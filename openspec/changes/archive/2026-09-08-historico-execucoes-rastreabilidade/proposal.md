## Why

Hoje a sessão de execução some quando outra viagem começa, e não há horário de passagem pelos pontos nem de marcação de cada aluno. Sem esse log, o motorista não consegue responder a um responsável com a hora exata em que a van concluiu ou pulou um local, nem quanto durou o trajeto.

## What Changes

- Capturar timestamps ISO no clique de iniciar trajeto, de marcar status do aluno, de concluir/pular ponto e de encerrar a rota.
- Guardar cada sessão `COMPLETED` em um histórico persistido (somente leitura), com logs de ponto, marcações de aluno e métricas.
- Mostrar “Últimas Viagens” no Início, abaixo da lista para iniciar rota, com duração total e resumo.
- Abrir uma tela de detalhe com timeline de auditoria (hora por ponto; pulados tachados/cinza) e aba de mapa/lista somente leitura, mantendo o contato com o responsável.

## Capabilities

### New Capabilities

- `execution-history`: listagem e detalhe somente leitura de viagens encerradas, com duração, timeline de pontos com horário e status individual com `recordedAt`.

### Modified Capabilities

- `route-execution`: a sessão em andamento passa a registrar `startedAt`, logs de ponto (`COMPLETED` | `SKIPPED` + horário) e `recordedAt` em cada alteração de status; ao encerrar, a viagem entra no histórico em vez de ser descartada.

## Impact

- Tipos em `types/execution.ts`, reducers em `store/attendanceSlice.ts` (`startRouteExecution`, `markStudentStatus`, `advanceToNextPoint`, `skipCurrentPoint`, `finishRouteExecution`) e persistência via redux-persist.
- Dashboard `app/(tabs)/index.tsx` (lista de histórico; `FlatList` para as viagens).
- Nova rota Expo `app/history/[id].tsx`.
- Reuso de `BusSeatMap` e contato (`lib/contactGuardian.ts`); prop `readOnly` para ocultar alteração de status.
- Chamada diária (`setMorningStatus` / `setAfternoonStatus`) permanece independente.
