## 1. Geo e som

- [x] 1.1 `lib/geo.ts`: Haversine, raio 50 m, transição de chegada, `formatDistance`; testes pontuais
- [x] 1.2 `lib/executionStop.ts`: coordenadas da parada atual (escola / início / embarque) reusando `entityCoords`
- [x] 1.3 Hook local `useExecutionLocation`: permissão, watch, cleanup, retry; sem persistir posição
- [x] 1.4 Instalar `expo-audio`; chime + falha silenciosa; WAV em `assets/sounds/`

## 2. UI da execução

- [x] 2.1 `ExecutionHeroCard` + Navegar via `openNavigation`; estados (carregando, indisponível, sem coords, distância, chegou, ponto concluído)
- [x] 2.2 `StudentAvatar` com tamanho maior na execução; botões Presente/Ausente/Desembarque grandes; contato inalterado
- [x] 2.3 Barra inferior: mesmas travas; mensagem com quantidade de alunos pendentes; `SnakePathTimeline` compacta
- [x] 2.4 `npx tsc --noEmit`; testes de geo; não quebrar aba Resumo
