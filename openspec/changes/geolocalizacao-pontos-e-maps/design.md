## Context

Ver proposta. Hoje `Route.boardingPoints` é `string[]`; o aluno guarda o mesmo texto em `boardingPoint`; a sessão usa `pointsList: string[]` (nomes + `schoolId`) para casar presença. Persistência versão **6**. Não há `expo-location`. Timelines (`RouteTimeline`, `SnakePathTimeline`) recebem arrays de string.

## Goals / Non-Goals

**Goals:**

- Tipo `BoardingPoint` e migration 7 sem perder nomes.
- Cadastro de rota grava GPS opcional; execução abre Maps/Waze via `Linking`.
- Lista operacional e aluno continuam chaveados pelo **nome**.

**Non-Goals:**

- Google Maps SDK / chave de API paga no cadastro (o mapa do cadastro usa OpenStreetMap).
- Geofence, áudio, coords de `startPoint` e escola.
- Trocar `Student.boardingPoint` para o `id` do ponto.

## Decisions

1. **Lat/lng opcionais.** Tipo: `latitude?: number; longitude?: number` (ambos presentes ou ambos ausentes). Nunca usar `0,0` como “vazio”.
   Alternativa: `number` obrigatório. Rejeitada: quebra rotas atuais e o cadastro rápido.

2. **`pointsList` permanece `string[]` de nomes.** Helper `boardingPointNames(route)` alimenta `uniqueRouteStops` / `buildOperationalPointsList`. Resolução do GPS na execução: achar o objeto cujo `name` === token atual.
   Alternativa: tokens = `id`. Rejeitada nesta change (histórico e alunos ainda usam nome).

3. **Unicidade por nome** na rota, como hoje. `id` existe para evolução futura, gerado no cliente ao adicionar.

4. **Captura no cadastro:** mapa (busca de endereço + toque/arraste do pino) é o caminho principal. GPS atual do aparelho é atalho só para quem já está no ponto. Sem campos de lat/lng como UX principal.

5. **Deep links:** Google Maps `https://www.google.com/maps/search/?api=1&query=lat,lng`; Waze `https://waze.com/ul?ll=lat,lng&navigate=yes`. Helper em `lib/` (não `src/utils`). Escolha Maps vs Waze no toque (dois botões ou action sheet). Usar `AppAlert` nos erros.

6. **`addBoardingPointToRoute`:** empilha `{ id, name }` sem coords.

7. **Timelines:** mapear `.name` na borda da UI; não espalhar o objeto nas props da timeline se um helper de nomes bastar.

## Risks / Trade-offs

- [Renomear ponto desalinha aluno] → Mitigation: nesta change não há UI de rename; duplicata de nome bloqueada. Migração para id fica para depois.
- [Parada atual = escola ou início] → Mitigation: alerta “sem coordenadas”; não inventar geo.
- [Waze/Maps não instalado] → Mitigation: `Linking.canOpenURL` / catch + alerta.
- [Permissão de localização] → Mitigation: ponto permanece sem GPS.

## Migration Plan

1. Branch `feat/geolocalizacao-pontos-e-maps` a partir de `main` atualizado.
2. Migration persist 6 → 7: cada item string vira `{ id, name }`; objeto já válido permanece; item inválido descartado.
3. Instalar `expo-location` (Expo SDK 57).
4. Sem dados remotos.

## Open Questions

Nenhuma que altere spec: visual do atalho (um botão que pergunta o app vs dois ícones) fica a critério da implementação, desde que Maps e Waze existam.
