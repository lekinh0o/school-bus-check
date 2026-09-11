## Context

Ver proposal.md e os deltas. Veículos já usam `expo-image-picker` e `photoUri`. Rotas e escolas estão em `app/routes` e `app/schools`; **não há** `app/students/` neste workspace — só o plano `add-students-crud`. Tipos em `types/index.ts`. Persistência `redux-persist` versão 1 hoje: rotas antigas não terão `title` / `direction`.

## Goals / Non-Goals

**Goals:**
- Máscaras/validação compartilhadas; fotos no padrão do veículo; rota com título, sentido, ordem de ruas e timeline.
- Migrar estado persistido de rotas para os novos campos obrigatórios.

**Non-Goals:**
- Upload remoto de imagens.
- Recalcular presença.
- Reordenar ruas por drag-and-drop.
- Implementar o CRUD de alunos nesta change (só foto/máscara nas telas quando já existirem).

## Decisions

1. **Git no apply**  
   `feat/ajustes-e-melhorias-cadastros` a partir de `main` puxado. Se `main` ainda não tiver alunos, o apply desta change MUST ocorrer numa branch que já contenha `app/students/` (merge/cherry-pick de `add-students-crud`) antes das tarefas de aluno. Sem as telas, pausar essas tarefas — não inventar CRUD paralelo.

2. **Tipos obrigatórios em `Route`**  
   `title: string` e `direction: 'IDA' | 'VOLTA'`. Foto opcional. Escola/aluno: só `photoUri?`.

3. **Migração persist**  
   Subir `persistConfig.version` e `createMigrate`: rotas sem `title` recebem `startPoint` (ou `"Rota"`); sem `direction` recebem `'IDA'`. Evita quebrar rehydrate.

4. **Máscaras em `lib/inputMasks.ts`**  
   Funções puras: placa (uppercase + regex antigo/Mercosul), telefone (só dígitos, máscara, `isValidPhone`), `isValidHhMm`, `parsePositiveInt`. Usar nos quatro formulários.  
   Alternativa: validar só no submit sem máscara. Rejeitada pela spec.

5. **Foto**  
   Reusar o fluxo de `app/vehicles/[id].tsx` (`launchImageLibraryAsync`). Sem novo pacote.

6. **Timeline**  
   `components/RouteTimeline.tsx`: `ScrollView` horizontal, `flex-row`, nós início / ruas / escola. Usar no card de `app/routes/index.tsx` (não criar tela de detalhe nova).

7. **Setas de rua**  
   Swap de índice no `useState` local; persistir o array na ordem ao salvar. Primeiro item: subir desabilitado; último: descer desabilitado.

8. **Listagem de rotas**  
   Card passa a destacar `title` e `IDA`/`VOLTA`; mantém horário e escola.

## Risks / Trade-offs

- [Rotas antigas no device] → migrate no persist.
- [Alunos ainda não mergeados] → tarefas 4.x só com `app/students` presente.
- [URI de foto local some se o usuário apagar o arquivo] → mesmo risco do veículo; aceitável offline.

## Migration Plan

Deploy: atualizar tipos + migrate. Rollback: reverter UI e migrate; campos extras no JSON persistido são ignorados se o tipo voltar atrás.

## Open Questions

Nenhuma. Sentido é exatamente `IDA` | `VOLTA` (não reusar `RoutePeriod`). Timeline na listagem, não numa rota extra.
