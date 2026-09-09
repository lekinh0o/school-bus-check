## 1. Git e modelo

- [x] 1.1 Em `main` atualizado, criar ou usar `feat/rota-bidirecional-e-pontos-embarque`; verificar `git branch --show-current`
- [x] 1.2 Atualizar `types/index.ts`: `Route.boardingPoints`, sem `direction` no cadastro; `Student.boardingPoint`; verificar o tipo compilando nos slices
- [x] 1.3 Migração persist version 3 em `store/store.ts` (`streetsCovered` → `boardingPoints`, `boardingStreet` → `boardingPoint`, remover `direction`); verificar rehydrate de fixture antiga sem perder pontos

## 2. Rota

- [x] 2.1 Ajustar `routeSlice` (`addBoardingPointToRoute` / `boardingPoints`); verificar append com trim e sem duplicata
- [x] 2.2 Formulário `app/routes/[id].tsx`: rótulo Ponto de embarque, subir/descer, sem IDA/VOLTA obrigatório; verificar salvar sem sentido e lista persistida
- [x] 2.3 Listagem `app/routes/index.tsx`: timeline com `boardingPoints`, sem badge de sentido, botão Executar; verificar card e navegação

## 3. Execução

- [x] 3.1 Criar `app/routes/execute/[id].tsx` com painel IDA / VOLTA e timeline bidirecional; verificar ida = início → pontos → escola e volta = escola → pontos invertidos → início
- [x] 3.2 Adaptar `RouteTimeline` para receber a sequência já resolvida (ou flag de inverso); verificar as duas ordens sem mutar `boardingPoints` na store

## 4. Aluno

- [x] 4.1 `app/students/[id].tsx`: rótulo Ponto de embarque, chips de `boardingPoints`, persistir `boardingPoint`, injetar ponto novo na rota ao salvar; verificar chip, texto novo no fim da rota e campo vazio bloqueando Salvar
- [x] 4.2 Rodar `npx tsc --noEmit`; verificar exit 0
