## 1. Branch e modelo

- [x] 1.1 Partir de `main` atualizado e criar `feat/historico-execucoes-rastreabilidade`; confirmar com `git branch --show-current` e `git status`
- [x] 1.2 Estender `types/execution.ts` com `PointLog`, `recordedAt` em `ExecutionStudentAttendance`, campos de tempo/`pointLogs` em `ActiveExecution` e tipo `RouteHistory`; `npx tsc --noEmit` passa nos tipos

## 2. Sessão e persistência

- [x] 2.1 Em `executionSession.ts` (ou helper no slice), gravar log de ponto sem duplicar `pointId`; `npx tsc --noEmit` passa
- [x] 2.2 Em `startRouteExecution` / `markStudentStatus` / avanço / pular / `finishRouteExecution`, gravar ISO (`startedAt`, `recordedAt`, logs, `finishedAt`), copiar snapshot para `executionHistory`, zerar `activeExecution`; sessão nova não apaga o array — verificar no fluxo mental/reducers e `npx tsc --noEmit`
- [x] 2.3 Bump persist para versão 4 com `executionHistory: []` e defaults em sessão antiga; migration compilando em `store/store.ts`

## 3. UI

- [x] 3.1 `BusSeatMap` com `readOnly` (toque não seleciona); planta de cadastro inalterada ao omitir a prop
- [x] 3.2 Início: `FlatList` de “Últimas Viagens” abaixo do header de rotas; card com título, data, IDA/VOLTA, duração e métricas; toque navega para `/history/[id]` sem `startRouteExecution`
- [x] 3.3 Tela `app/history/[id].tsx` registrada no stack: aba Timeline (hora, pulado tachado/cinza) e aba Resumo (mapa amarelo se ausente, `recordedAt`, contato ativo, sem botões de status)
- [x] 3.4 Encerrar uma rota na execução e conferir card + detalhe no app; `npx tsc --noEmit` passa
