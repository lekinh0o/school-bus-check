## 1. Branch e modelo

- [x] 1.1 Partir de `main` atualizado e criar `feat/inteligencia-operacional-ida-volta`; confirmar com `git branch --show-current`
- [x] 1.2 Helper `localDateKey` (YYYY-MM-DD local) e tipos `cycleJustification` em `ActiveExecution` / `RouteHistory`; `npx tsc --noEmit` passa
- [x] 1.3 Payload opcional em `startRouteExecution` e cópia no snapshot de `finishRouteExecution`; `npx tsc --noEmit` passa

## 2. Seletores e início

- [x] 2.1 Seletores memoizados: IDA encerrada da rota no dia e ids `ABSENT` da última IDA; não usam a chamada diária
- [x] 2.2 `StartRouteSheet`: VOLTA sem IDA abre modal bloqueante (três opções; texto livre só com nota); IDA e VOLTA com IDA seguem diretos — conferir no fluxo do sheet

## 3. UI de execução e histórico

- [x] 3.1 Badge “Faltou na Ida” nas tabs Execução e Resumo da VOLTA, sem desabilitar Presente/Ausente
- [x] 3.2 Detalhe do histórico mostra a justificativa de ciclo quando existir
- [x] 3.3 `npx tsc --noEmit` passa
