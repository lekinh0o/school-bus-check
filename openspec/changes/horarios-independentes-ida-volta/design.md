## Context

See `proposal.md` for motivation. Hoje `Route` tem um único `startTime`/`endTime` (`types/index.ts`). O formulário em `app/routes/[id].tsx` valida com `isValidHhMm` (`lib/inputMasks.ts`). Início e Cadastros mostram `startTime às endTime`. O sentido IDA/VOLTA só existe na sessão (`StartRouteSheet` + `activeExecution`); a rota não persiste sentido. Persistência: redux-persist versão **4** em `store/store.ts`. Sem backend.

## Goals / Non-Goals

**Goals:**

- Quatro campos `HH:MM` serializáveis no tipo `Route`, nomes alinhados à proposta (`departureTimeIda`, `arrivalTimeIda`, `departureTimeVolta`, `arrivalTimeVolta`).
- Helper único para resolver o par a partir de `Route` + `RouteDirection`, usado no painel, Início, Cadastros e execução.
- Migration persist **5** que preenche os quatro campos a partir de `startTime`/`endTime` quando os novos não existem.
- Manter `period` como classificação da linha.

**Non-Goals:**

- Não persistir sentido na rota.
- Não escolher sentido automaticamente pelo relógio.
- Não exigir que término seja depois do início (janela que cruza meia-noite fica permitida; só formato `HH:MM`).
- Não alterar regras de presença, justificativa de ciclo ou histórico de viagens.

## Decisions

### 1. Substituir `startTime`/`endTime` no tipo, não manter aliases

Após a migration, o TypeScript e o formulário usam só os quatro campos. Manter os nomes antigos no tipo duplicaria a fonte da verdade.

**Alternativa:** getters que mapeiam `startTime` conforme o contexto — rejeitada porque a listagem precisa das *duas* janelas ao mesmo tempo.

### 2. Migration: copiar o par antigo para os dois sentidos

Rotas já cadastradas tinham um intervalo único. Copiar `startTime` → `departureTimeIda` e `departureTimeVolta`, `endTime` → `arrivalTimeIda` e `arrivalTimeVolta`. O usuário corrige a volta (ou a ida) na edição. Se os quatro novos campos já existirem, não sobrescrever. Remover `startTime`/`endTime` do objeto persistido nesse passo para o estado gravado bater com o tipo.

**Alternativa:** deixar o par antigo só na ida e volta vazia — rejeitada porque quebraria o “salvar exige quatro `HH:MM`” até o usuário editar.

### 3. Helper `getRouteTimeWindow(route, direction)`

Função pura em `lib/` (ex.: `routeSchedule.ts`) retorna `{ start, end }` e uma formatação `início às fim`. Evita `if (IDA)` espalhado e facilita o painel reativo ao trocar o sentido.

### 4. UI do formulário em duas seções, `period` intacto

Seções “Turno da Ida” e “Turno da Volta” com os quatro inputs e a máscara já existente. `period` continua obrigatório (Manhã / Tarde / Noite) como hoje; não deriva dos horários.

### 5. Onde mostrar o quê

- Cards Início e Cadastros: as **duas** janelas (rótulos Ida / Volta).
- `StartRouteSheet`: só o par do sentido selecionado (atualiza ao tocar IDA/VOLTA).
- `app/routes/execute/[id].tsx`: o par do `activeExecution.direction`.

## Risks / Trade-offs

- **[Risk]** Rotas antigas ficam com ida e volta iguais até o usuário editar. → Mitigation: migration documentada; listagem deixa as duas janelas visíveis para o motorista perceber e corrigir.
- **[Risk]** Persist version skip (app antigo vs novo). → Mitigation: `createMigrate` já encadeia 2→3→4; adicionar só a chave `5` e subir `version: 5`.
- **[Trade-off]** Cards ficam um pouco mais densos (dois intervalos). Aceito para não esconder a volta.

## Migration Plan

1. Apply: `git checkout main && git pull && git checkout -b feat/horarios-independentes-ida-volta`.
2. Tipo + helper + migration 5 + UI.
3. Rollback: reverter o commit; dados já migrados no device continuam com os quatro campos (compatíveis se o código antigo for restaurado *sem* ler os novos — o app antigo quebraria o tipo). Rollback real só via persist antigo se o usuário ainda não tiver aberto o app novo; na prática o caminho é corrigir no formulário, não downgrade de schema.

## Open Questions

Nenhum que altere spec ou tarefas. Rótulos exatos (“Turno da Ida” vs “Manhã”) ficam a cargo da implementação, desde que as duas seções e os quatro campos estejam claros.
