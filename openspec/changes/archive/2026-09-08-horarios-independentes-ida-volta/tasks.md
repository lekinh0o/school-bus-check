## 1. Branch e modelo

- [x] 1.1 Partir de `main` atualizado e criar `feat/horarios-independentes-ida-volta`; confirmar com `git branch --show-current`
- [x] 1.2 Atualizar `Route` em `types/index.ts`: quatro campos `departureTimeIda`, `arrivalTimeIda`, `departureTimeVolta`, `arrivalTimeVolta`; remover `startTime`/`endTime`; manter `period`. `npx tsc --noEmit` aponta só os call sites antigos
- [x] 1.3 Helper puro `getRouteTimeWindow` / formatação `início às fim` em `lib/` a partir de `Route` + `RouteDirection`; verificar com um caso IDA 06:00–07:10 vs VOLTA 11:00–12:10

## 2. Persistência

- [x] 2.1 Migration persist `5` em `store/store.ts`: copiar `startTime`/`endTime` para os dois pares se os novos campos faltarem; não sobrescrever se já existirem; remover chaves antigas; `version: 5`. Conferir o padrão das migrations 2–4

## 3. Cadastro e listagens

- [x] 3.1 Formulário `app/routes/[id].tsx`: duas seções (ida e volta), quatro inputs com `formatTimeInput` / `isValidHhMm`; salvar só com os quatro válidos; edição carrega os quatro. Conferir criar e editar
- [x] 3.2 Cards `app/routes/index.tsx` e `app/(tabs)/index.tsx` mostram as duas janelas (não um único intervalo). Conferir visualmente os dois sentidos no mesmo card

## 4. Execução

- [x] 4.1 `StartRouteSheet`: ao selecionar IDA ou VOLTA, exibir o par daquele sentido (troca imediata). Conferir no modal
- [x] 4.2 `app/routes/execute/[id].tsx`: cabeçalho (ou subtítulo) com o par do `activeExecution.direction`. Conferir IDA vs VOLTA
- [x] 4.3 `npx tsc --noEmit` passa e não restam referências a `route.startTime` / `route.endTime`
