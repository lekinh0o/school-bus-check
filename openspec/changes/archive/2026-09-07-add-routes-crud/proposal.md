## Why

O slice `routes` e o tipo `Route` já existem, mas Cadastros ainda trata Rotas como “Em breve”. Sem listagem e formulário, o usuário não consegue vincular uma rota a uma escola nem registrar o percurso (`streetsCovered`), e o contador de rotas na listagem de escolas permanece zerado.

## What Changes

- Habilitar o card **Rotas** em Cadastros para navegar à listagem (`/routes`).
- Nova stack Expo Router `app/routes/`: index (lista) e `[id]` (criar com `new` / editar com id existente).
- CRUD na UI via `addRoute`, `updateRoute` e `removeRoute` (exports do `routeSlice`; adapter `addOne` / `updateOne` / `removeOne`).
- Listagem com ponto de início, período, horário (`startTime` às `endTime`), nome da escola de destino (via `schoolId`), editar e excluir com `Alert.alert`.
- Formulário com responsável, monitor, ponto de início, horários, período (Manhã / Tarde / Noite), escola obrigatória e lista dinâmica de ruas.
- Ao criar, editar o `schoolId` ou excluir, atualizar `School.routeIds` da escola vinculada para o resumo de rotas em Cadastros de escolas permanecer correto.
- Sem alteração do tipo `Route`, sem CRUD de alunos, sem uso de `addStreetToRoute` no formulário (ruas ficam no estado local até Salvar).

## Capabilities

### New Capabilities

- `route-registry`: cadastro, listagem, edição e exclusão de rotas no app, a partir de Cadastros, com vínculo a escola e ruas percorridas.

### Modified Capabilities

- `school-registry`: o resumo `N Rotas` na listagem de escolas deve refletir rotas realmente vinculadas (`routeIds` atualizado pelo CRUD de rotas).

## Impact

- `app/(tabs)/cadastros.tsx` (navegação do card Rotas)
- `app/_layout.tsx` (registrar stack `routes`)
- Novos arquivos: `app/routes/_layout.tsx`, `app/routes/index.tsx`, `app/routes/[id].tsx`
- Store existente: `store/routeSlice.ts`, `store/schoolSlice.ts` (`updateSchool` para `routeIds`)
- Tipos em `types/index.ts` (`Route`, `RoutePeriod`, `School.routeIds`) — sem novos campos
- Persistência já cobre `routes` e `schools` no `persistReducer`; sem novas dependências npm
- Git na implementação: `main` atualizado e branch `feat/cadastro-de-rotas` (não nesta fase de planejamento)
