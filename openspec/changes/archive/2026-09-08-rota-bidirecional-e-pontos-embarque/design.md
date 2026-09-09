## Context

Ver proposal.md. `Route` em `types/index.ts` tem `direction: 'IDA' | 'VOLTA'` e `streetsCovered`. `Student.boardingStreet` alimenta chips em `app/students/[id].tsx`. Persistência: `persistConfig.version` 2 com migração que preenche `title`/`direction`. Não existe `app/routes/execute/`. `RouteTimeline` recebe `startPoint`, `streets`, `schoolName` sempre na ordem ida. Tipos ficam em `types/index.ts`, não em `src/`.

## Goals / Non-Goals

**Goals:**
- Uma linha cadastrada; sentido só na execução.
- `boardingPoints` / `boardingPoint` no modelo e na UI.
- Migração de dados antigos sem perda de paradas nem do texto do aluno.

**Non-Goals:**
- Chamada diária (`attendanceSlice`) e status de presença por ponto.
- Mover `period` (Manhã/Tarde/Noite) para a tela de execução.
- GPS, mapa ou reordenar pontos na execução.

## Decisions

1. **Modelo**  
   `Route` perde `direction`. `streetsCovered` → `boardingPoints: string[]`. `Student.boardingStreet` → `boardingPoint`. `RouteDirection` permanece só para estado local da execução.  
   Alternativa: manter `direction` opcional no cadastro. Rejeitada — o spec pede linha unificada.

2. **VOLTA na timeline**  
   Escola → `boardingPoints` invertidos → `startPoint` (rótulo de retorno). IDA: `startPoint` → pontos → escola.  
   Alternativa: omitir o `startPoint` na volta. Rejeitada — o spec cita “Retorno” após os pontos.

3. **Migração persist version 3**  
   Em cada rota: `boardingPoints` = `streetsCovered` (ou `[]`); remover `direction`. Em cada aluno: `boardingPoint` = `boardingStreet`.  
   `addStreetToRoute` vira `addBoardingPointToRoute` (mesmo comportamento, outro campo).

4. **Tela de execução**  
   Expo Router: `app/routes/execute/[id].tsx`. Entrada: botão Executar no card da listagem. Sentido em painel inicial (dois botões grandes). Sem gravar o sentido na store da rota.

5. **Git no apply**  
   `checkout main`, `pull`, `checkout -b feat/rota-bidirecional-e-pontos-embarque`.

## Risks / Trade-offs

- [Rotas antigas com `direction: VOLTA`] → a sequência salva passa a ser a linha “ida”; o motorista escolhe VOLTA na execução para inverter. Não reordenar automaticamente no migrate (a ordem persistida é a verdade da linha).
- [Comparação de ponto] → `trim` e `includes` exato, como a rua hoje.
- [Listagem vs execução] → listagem sempre mostra ordem cadastrada; só a execução inverte.

## Migration Plan

Subir `version` para 3 com `createMigrate`. Rollback = reverter o commit e, se já rehidratou, os dados novos não voltam sozinhos para `streetsCovered`.

## Open Questions

Nenhuma. Acesso à execução = botão na listagem de rotas.
