## Context

Ver proposal.md (Why / What Changes) e os deltas em `specs/`. O `routeSlice` já expõe `addRoute` / `updateRoute` / `removeRoute` e `selectAllRoutes` / `selectRouteById`. `School.routeIds` existe e a listagem de escolas mostra `M Rotas` a partir desse array. Tipos em `types/index.ts` (`RoutePeriod` = `'Manha' | 'Tarde' | 'Noite'`). UI a espelhar: `app/schools/` (stack fora das tabs, `[id]` com sentinela `new`, NativeWind, Feather, `Alert.alert`). Não há `@react-native-picker/picker` no projeto.

## Goals / Non-Goals

**Goals:**
- Reusar o slice e o tipo `Route` sem novos campos.
- Stack `app/routes` paralela a `app/schools`.
- Formulário controlado com `useState`; ruas só no estado local até Salvar.
- Manter `School.routeIds` alinhado com criar / mudar escola / excluir rota.

**Non-Goals:**
- CRUD de alunos, veículo, mapa ou geocoding.
- Usar `addStreetToRoute` no formulário (ele muta a store imediatamente; a spec pede lista local até persistir).
- Cascata ao excluir escola (rotas órfãs já cobertas pelo cenário “escola ausente”).
- Lib de date/time picker; horários são strings como no tipo atual.
- Testes automatizados nesta change.

## Decisions

1. **Git na implementação, não no planejamento**  
   A spec do usuário pede `checkout main` + `pull` + `feat/cadastro-de-rotas` antes do código. A primeira tarefa de apply faz isso. Esta change OpenSpec chama-se `add-routes-crud` (padrão kebab das changes).  
   Alternativa: criar a branch agora. Rejeitada para não misturar planejamento com movimento de git.

2. **Listagem em tela cheia**  
   Cadastros usa `router.push('/routes')`. Card mostra `startPoint`, rótulo de período, `{startTime} às {endTime}` e `selectSchoolById` para o nome.  
   Alternativa: modal como veículos. Rejeitada: a spec pede rota de listagem.

3. **Rota `[id]` com sentinela `new`**  
   Igual escolas. FAB → `/routes/new`. ID de criação: `Date.now().toString()`.

4. **Período e escola sem Picker nativo**  
   Três botões para `RoutePeriod` (UI: Manhã / Tarde / Noite → valores `Manha` | `Tarde` | `Noite`). Escolas: lista de `selectAllSchools` selecionável (Pressable).  
   Alternativa: adicionar `@react-native-picker/picker`. Rejeitada para não criar dependência.

5. **Ruas só no `useState`**  
   Input + “+” faz `trim`, ignora vazio, evita duplicata case-sensitive, limpa o input. “X” remove por índice. Salvar manda `streetsCovered` completo em `addRoute` / `updateRoute`.

6. **Sincronizar `routeIds`**  
   Helper local na tela (ou funções puras no mesmo arquivo): ao criar, `updateSchool` com `routeIds` incluindo o novo id; ao excluir, filtrar; ao mudar `schoolId`, remover da antiga e incluir na nova. Não alterar `studentIds`.  
   Alternativa: contar rotas na listagem de escolas via `selectAllRoutes`. Rejeitada porque a spec de escolas já usa vínculos armazenados em `routeIds`.

7. **Registrar `routes` no Stack raiz**  
   Mesmo padrão de `schools` / `vehicles`.

## Risks / Trade-offs

- [Nenhuma escola] → Empty state no seletor; Salvar permanece desabilitado sem `schoolId`.
- [Escola excluída com rotas] → Card mostra fallback; edição ainda funciona se o usuário escolher outra escola.
- [Alert no web] → Aceitável, como em escolas.
- [Duplicar `routeIds`] → Helper MUST NOT inserir o mesmo id duas vezes.

## Migration Plan

Nenhuma migração: rotas novas nascem no persist. Rollback = reverter UI/rotas e os `updateSchool` de `routeIds`. Slice de rotas permanece.

## Open Questions

Nenhuma. Horários como texto livre e ruas vazias permitidas estão decididos nas specs.
