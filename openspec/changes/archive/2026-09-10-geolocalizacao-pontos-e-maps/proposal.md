## Why

O motorista precisa abrir o GPS da parada atual na central multimídia (Google Maps / Waze), mas os pontos de embarque são só nomes. Sem latitude/longitude persistidas, não há deep link nem base para geofence futuro.

## What Changes

- Cada ponto de embarque da rota passa a ser um objeto com identificador, nome e coordenadas **opcionais** (não obrigatórias no cadastro).
- **BREAKING** no modelo persistido: `Route.boardingPoints` deixa de ser `string[]`. Rotas antigas MUST ser migradas localmente (nome vira objeto; sem GPS).
- O cadastro da rota marca no mapa o **ponto de início** e os pontos de embarque. O cadastro da escola marca o local da escola. GPS atual do aparelho fica como atalho nos embarques.
- Na tab Execução, Maps/Waze usam as coordenadas da parada atual (embarque, início ou escola).
- O vínculo do aluno com o ponto continua sendo o **nome** (texto). Novo ponto criado pelo cadastro de aluno entra na rota sem coordenadas.
- Fora desta change: geofence, áudio, migrar `Student.boardingPoint` para id.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `route-registry`: pontos de embarque estruturados; mapa no início e nos embarques.
- `school-registry`: localização opcional da escola no mapa.
- `student-registry`: sugestões e persistência usam o nome do objeto; ponto novo na rota nasce sem coordenadas.
- `route-execution`: atalho Maps/Waze na parada atual (embarque, início ou escola).

## Impact

- Tipos: `BoardingPoint` em `types/index.ts`; `Route.boardingPoints`.
- Persistência: migration **7** em `store/store.ts` (hoje versão 6).
- Reducers: `routeSlice` (`addBoardingPointToRoute`), `startRouteExecution` / `buildOperationalPointsList` (lista operacional continua `string[]` de nomes + `schoolId`).
- UI: `app/routes/[id].tsx`, `app/students/[id].tsx`, `app/routes/execute/[id].tsx`, timelines.
- Dependência: `expo-location` (permissão na hora de capturar); `Linking` do React Native. Sem backend.
- Branch sugerida na implementação: `feat/geolocalizacao-pontos-e-maps` a partir de `main`.
