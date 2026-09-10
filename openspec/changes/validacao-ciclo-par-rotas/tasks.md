## 1. Modelo e persistência

- [x] 1.1 Criar branch `feat/validacao-ciclo-par-rotas` a partir de `main` atualizado (`git checkout main && git pull && git checkout -b feat/validacao-ciclo-par-rotas`)
- [x] 1.2 Adicionar `OperationType` e `operationType` em `Route` (`types/index.ts`); estender `CycleJustificationKind` com `return_done_offline` e `period_cancelled`; `npx tsc --noEmit` passa
- [x] 1.3 Migration persist versão 6: rotas sem `operationType` recebem `IDA_E_VOLTA`; conferir `store/store.ts` versão 6

## 2. Ciclo incompleto no estado

- [x] 2.1 Helper puro (histórico + `routeId`) que devolve a última Ida sem Volta posterior ou `undefined`; casos: só Ida, Ida+Volta, Volta sozinha
- [x] 2.2 Seletor + ação `justifyIncompleteCycle` que grava `cycleJustification` naquela `RouteHistory`; conferir que a nova sessão de Ida não precisa copiar esse motivo

## 3. Cadastro e listagens

- [x] 3.1 Formulário `app/routes/[id].tsx`: seletor de tipo (padrão Ida e Volta) no mesmo padrão do período; salvar e reabrir preserva o valor
- [x] 3.2 Cards em `app/routes/index.tsx` e Início mostram o tipo de operação

## 4. Painel de início e histórico

- [x] 4.1 `StartRouteSheet`: sentidos permitidos pelo tipo; rota só Volta não abre o modal “nenhuma IDA hoje”
- [x] 4.2 Ao iniciar Ida com ciclo incompleto: modal “Ciclo Anterior Incompleto” (chips + Outro); confirmar justifica a Ida antiga e inicia o trajeto; iniciar Volta no par pendente não abre esse modal
- [x] 4.3 Detalhe `app/history/[id].tsx` exibe os novos kinds de justificativa na Ida; `npx tsc --noEmit` passa
