## Why

Hoje cada rota grava um sentido fixo (`IDA`/`VOLTA`) e chama as paradas de “rua”. Na operação a mesma linha serve nos dois sentidos, e o ponto de parada é uma referência de embarque, não necessariamente uma rua. Sem isso o motorista cadastra rotas duplicadas e o aluno não encontra o vocabulário do dia a dia.

## What Changes

- **BREAKING (persistência):** `Route.streetsCovered` vira `boardingPoints`; `Student.boardingStreet` vira `boardingPoint`; `Route.direction` deixa de existir no cadastro (sentido só na execução).
- Cadastro de rota: rótulos “Ponto de embarque”, ordem subir/descer, sem escolha obrigatória de IDA/VOLTA.
- Listagem de rotas: timeline na ordem cadastrada (ida conceitual); sem badge de sentido persistido.
- Nova tela de execução: o motorista escolhe IDA (casa → escola) ou VOLTA (escola → casa); a timeline inverte os pontos na volta.
- Cadastro de aluno: campo “Ponto de embarque”, chips de `boardingPoints`, auto-inclusão no fim da lista ao salvar ponto novo.
- Tipos em `types/index.ts` (não há `src/types`). Persistência: migração redux-persist na store.

## Capabilities

### New Capabilities
- `route-execution`: escolha de sentido no momento de executar a rota e timeline bidirecional (ida na ordem salva, volta invertida).

### Modified Capabilities
- `route-registry`: cadastro sem direção fixa; pontos de embarque no lugar de ruas.
- `student-registry`: ponto de embarque no aluno e injeção na rota.

## Impact

- `types/index.ts`, `store/routeSlice.ts`, `store/store.ts` (migração), `app/routes/[id].tsx`, `app/routes/index.tsx`, `app/routes/_layout.tsx`, novo `app/routes/execute/[id].tsx`.
- `components/RouteTimeline.tsx`, `app/students/[id].tsx`.
- Branch de implementação: `feat/rota-bidirecional-e-pontos-embarque` a partir de `main` (apply, não deste planning).
