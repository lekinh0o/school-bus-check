## Why

Hoje o app já pede justificativa para **VOLTA sem IDA no mesmo dia**, mas não impede um novo ciclo quando a **IDA foi feita e a VOLTA nunca foi registrada**. Sem tipo de operação no cadastro, toda rota parece Ida e Volta. O motorista precisa fechar o ciclo anterior (ou justificar a volta omitida) antes de iniciar outra Ida, como um ponto de par.

## What Changes

- Cada rota passa a ter **tipo de operação**: Ida e Volta obrigatórias (padrão), apenas Ida, ou apenas Volta.
- O painel de iniciar trajeto restringe o sentido conforme o tipo (não oferece Volta em rota só de Ida, e vice-versa).
- Rotas **Ida e Volta**: se a última viagem encerrada da rota for uma **IDA sem VOLTA depois**, o início de uma **nova IDA** fica bloqueado até o motorista justificar a volta omitida.
- Completar a Volta pendente (iniciar VOLTA daquele ciclo) **não** exige essa justificativa.
- A justificativa fecha o ciclo antigo no histórico daquela Ida (auditoria) e só então libera o novo trajeto.
- Rotas só Ida ou só Volta **não** usam essa trava de ciclo par. Rota só Volta também **não** usa o modal atual de “nenhuma IDA hoje”.
- Persistência local: rotas antigas sem o campo passam a `IDA_E_VOLTA`.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `route-registry`: cadastro e listagem incluem tipo de operação; default Ida e Volta.
- `route-execution`: painel de sentido respeita o tipo; trava de ciclo par incompleto ao iniciar nova Ida; modal de justificativa da volta omitida. A regra “IDA sem extra” deixa de valer para rotas Ida e Volta com ciclo aberto.
- `execution-history`: justificativa de volta omitida fica no registro da Ida incompleta (e visível no detalhe).

## Impact

- Tipos: `OperationType` em `Route`; extensão de `CycleJustification` / kinds para a volta omitida.
- Persistência: nova migration em `store/store.ts` (hoje versão 5).
- UI: `app/routes/[id].tsx`, listagens de rota, `components/StartRouteSheet.tsx`, detalhe de histórico.
- Estado: helper/seletor sobre `executionHistory` (não existe `historySlice`); ação para anexar justificativa na Ida antiga antes de `startRouteExecution`.
- Não há backend. Branch sugerida na implementação: `feat/validacao-ciclo-par-rotas` a partir de `main`.
