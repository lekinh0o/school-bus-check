## Why

Ida e volta da mesma linha acontecem em janelas diferentes (ex.: ida 06:00–07:10, volta 11:00–12:10). Um único par `startTime`/`endTime` na rota força o motorista a cadastrar um intervalo falso ou a duplicar rotas. Os horários precisam ser independentes por sentido, e a execução deve mostrar o par correspondente à escolha IDA ou VOLTA.

## What Changes

- **BREAKING** (modelo persistido): `Route` deixa de ter um único par `startTime`/`endTime`. Passa a persistir `departureTimeIda`, `arrivalTimeIda`, `departureTimeVolta` e `arrivalTimeVolta` (strings `HH:MM`).
- Formulário de rota (`app/routes/[id].tsx`): duas seções (Turno da Ida / Turno da Volta) com início e término; máscara `HH:MM` já usada no cadastro.
- Listagem (Cadastros e Início): deixa de mostrar um único `início às fim`; mostra as duas janelas (ou rótulos equivalentes).
- Execução: ao escolher IDA ou VOLTA no `StartRouteSheet` (e na tela `execute`), o app exibe e usa o bloco daquele sentido.
- Migração redux-persist: rotas antigas recebem os quatro campos a partir de `startTime`/`endTime` (cópia para os dois sentidos) para não quebrar o AsyncStorage.
- Campo `period` (Manhã / Tarde / Noite) **permanece** como classificação da linha; não substitui os horários por sentido.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `route-registry`: cadastro e listagem passam a exigir e exibir dois pares de horário (ida e volta), sem persistir sentido na rota.
- `cadastro-input-validation`: validação `HH:MM` aplica-se aos quatro campos, não só a `startTime`/`endTime`.
- `route-execution`: após escolher o sentido, a UI usa o par de horários daquele sentido.

## Impact

- Tipos: `types/index.ts` (`Route`).
- Persistência: `store/store.ts` (nova migration; versão atual do persist é 4).
- UI: `app/routes/[id].tsx`, `app/routes/index.tsx`, `app/(tabs)/index.tsx`, `components/StartRouteSheet.tsx`, `app/routes/execute/[id].tsx` (e qualquer helper de janela de horário).
- Sem backend; dados 100% serializáveis. Git: branch `feat/horarios-independentes-ida-volta` a partir de `main` no apply.
