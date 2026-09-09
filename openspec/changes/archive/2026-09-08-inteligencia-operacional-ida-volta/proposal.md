## Why

Hoje dá para iniciar uma VOLTA sem nenhuma IDA encerrada no mesmo dia, e na volta o motorista não vê quem faltou de manhã na sessão de execução. Isso gera falha humana: trajeto da tarde sem registro de ida, ou embarque na escola sem o alerta de que a criança não veio de van.

## What Changes

- Antes de iniciar VOLTA, o sistema verifica se existe IDA concluída da mesma rota no dia local. Se não houver, um modal bloqueante exige justificativa (opções rápidas ou texto livre) e a grava na sessão/histórico.
- Na execução da VOLTA, quem esteve `ABSENT` na IDA do dia ganha um aviso visual “Faltou na Ida”; os botões de presente/ausente continuam ativos.
- IDA segue sem essa validação de ciclo.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `route-execution`: validação de ciclo par ao iniciar VOLTA; alerta informativo de ausência na ida durante a volta.
- `execution-history`: a viagem de VOLTA (e a sessão) pode carregar a justificativa de ciclo quando a IDA do dia não existia.

## Impact

- `StartRouteSheet`, `attendanceSlice` (`startRouteExecution`, `executionHistory`), `types/execution.ts`.
- Tela `app/routes/execute/[id].tsx` (tabs Execução e Resumo).
- Seletores memoizados sobre o histórico do dia; comparação de dia em `YYYY-MM-DD` a partir de `startedAt`.
- Chamada diária manhã/tarde não entra nesse cruzamento.
