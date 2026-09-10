## Why

O motorista precisa abrir o GPS da parada atual na central multimídia (Google Maps / Waze), mas os pontos de embarque são só nomes. Sem latitude/longitude persistidas, não há deep link nem base para geofence futuro.

## What Changes

- Cada ponto de embarque da rota passa a ser um objeto com identificador, nome e coordenadas **opcionais** (não obrigatórias no cadastro).
- **BREAKING** no modelo persistido: `Route.boardingPoints` deixa de ser `string[]`. Rotas antigas MUST ser migradas localmente (nome vira objeto; sem GPS).
- O cadastro da rota marca o local **no mapa** (busca de endereço ou toque no pino), sem exigir ir até a rua. GPS atual do aparelho fica como atalho.
- Na tab Execução, um atalho abre Maps ou Waze no ponto atual quando houver coordenadas; senão, alerta amigável.
- O vínculo do aluno com o ponto continua sendo o **nome** (texto). Novo ponto criado pelo cadastro de aluno entra na rota sem coordenadas.
- Fora desta change: geofence, áudio, coordenadas de ponto de início e da escola, migrar `Student.boardingPoint` para id.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `route-registry`: pontos de embarque estruturados; mapa no formulário; listagens/timeline usam o nome.
- `student-registry`: sugestões e persistência usam o nome do objeto; ponto novo na rota nasce sem coordenadas.
- `route-execution`: atalho de navegação externa na parada atual; deep link Maps/Waze; alerta se faltar GPS ou o app não abrir.

## Impact

- Tipos: `BoardingPoint` em `types/index.ts`; `Route.boardingPoints`.
- Persistência: migration **7** em `store/store.ts` (hoje versão 6).
- Reducers: `routeSlice` (`addBoardingPointToRoute`), `startRouteExecution` / `buildOperationalPointsList` (lista operacional continua `string[]` de nomes + `schoolId`).
- UI: `app/routes/[id].tsx`, `app/students/[id].tsx`, `app/routes/execute/[id].tsx`, timelines.
- Dependência: `expo-location` (permissão na hora de capturar); `Linking` do React Native. Sem backend.
- Branch sugerida na implementação: `feat/geolocalizacao-pontos-e-maps` a partir de `main`.
