## 1. Modelo e persistência

- [x] 1.1 Criar branch `feat/geolocalizacao-pontos-e-maps` a partir de `main` atualizado (`git checkout main && git pull && git checkout -b feat/geolocalizacao-pontos-e-maps`)
- [x] 1.2 Adicionar `BoardingPoint` e `boardingPoints: BoardingPoint[]` em `types/index.ts`; helper de nomes (ex. `lib/boardingPoints.ts`); `npx tsc --noEmit` ainda pode falhar até os call sites
- [x] 1.3 Migration persist versão 7: strings viram `{ id, name }`; conferir `store/store.ts` versão 7
- [x] 1.4 Instalar `expo-location` compatível com Expo 57 e registrar permissão de localização no app (docs v57)

## 2. Cadastro e aluno

- [x] 2.1 Formulário `app/routes/[id].tsx`: lista de objetos; mapa para marcar o ponto (busca + pino); GPS atual só como atalho; nome duplicado bloqueado
- [x] 2.2 `addBoardingPointToRoute` e `app/students/[id].tsx`: sugestões pelo `.name`; ponto novo na rota sem coordenadas
- [x] 2.3 Listagens/timelines (`app/routes/index.tsx`, Início, histórico) passam `.name`; `StartRouteSheet` inicia sessão com nomes

## 3. Execução e mapas

- [x] 3.1 Helper `openNavigation` em `lib/` (Maps + Waze + falha); alerta se não houver lat/lng
- [x] 3.2 Tab Execução: atalho Maps/Waze na parada atual; sessão não encerra; `AppAlert` sem GPS ou app indisponível
- [x] 3.3 `npx tsc --noEmit` passa
