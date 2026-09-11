## Context

A execução já resolve coordenadas da parada atual com `entityCoords` + `openNavigation` (Maps/Waze). `BoardingPoint`, `Route.startLatitude/Longitude` e `School.latitude/longitude` não mudam. Persistência continua versão 7. `expo-location` já está no app para o cadastro. Não há testes automatizados no repo; a lógica de distância entra em `lib/` para poder validar com um runner pontual.

## Goals / Non-Goals

**Goals:**

- Hero da parada atual, distância foreground, geofence 50 m com som único na transição, lista touch-first, barra inferior com motivo de bloqueio.
- Reusar #17; parar o watcher ao desmontar.

**Non-Goals:**

- Background location, geofence nativo de SO, persistir GPS do veículo, alterar attendanceSlice/regras de presença, redesign global (#22), segundo modelo de coordenadas.

## Decisions

1. **Foreground only.** `watchPositionAsync` com Accuracy Balanced, `timeInterval` ~3–5 s e `distanceInterval` ~8–15 m. Sem `startLocationUpdatesAsync` / `locationAlways`. Limitação: com o app em segundo plano o SO pode pausar atualizações; o OpenSpec não afirma tracking background.

2. **Haversine em `lib/geo.ts`**, usando `coordsFromValues`. Distância indefinida se qualquer par falhar.

3. **Geofence em memória no hook da tela** (`wasInside` por `routeId + pointIndex`). Transição `!wasInside && inside` dispara som. Sair e reentrar na mesma parada pode alertar de novo; permanecer dentro não.

4. **Som:** `expo-audio` + WAV curto em `assets/sounds/`. Falha silenciosa. `Vibration` nativo como reforço discreto.

5. **Hero e barra extraídos** (`ExecutionHeroCard`, barra no próprio execute). `StudentAvatar` ganha `size`. Não duplicar `StudentCard` (ele é da chamada diária legada).

6. **Localização não vai para Redux** — só estado local da tela, para não re-renderizar presença a cada GPS além do hero.

## Risks / Trade-offs

- [Bateria] → intervalo e distância mínimos no watcher.
- [Sem coords no ponto] → estado “não cadastrada”; Maps continua alertando via `openNavigation`.
- [Expo Go vs APK] → `expo-audio` precisa de rebuild nativo; visual não depende do som.

## Migration Plan

1. Branch `feat/execution-cockpit` a partir da geolocalização.
2. `npx expo install expo-audio`.
3. Sem migration de persistência.

## Open Questions

Nenhuma: raio fixo 50 m; sem background nesta change.
