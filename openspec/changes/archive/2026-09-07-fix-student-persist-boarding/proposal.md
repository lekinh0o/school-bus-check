## Why

Nos testes, o aluno não aparece na listagem após Salvar, e a rua de embarque parece restrita às ruas já cadastradas na rota. Sem persistência confiável e sem poder digitar uma rua nova, o cadastro do aluno não fecha o fluxo real da van.

## What Changes

- Corrigir o submit em `app/students/[id].tsx` para sempre despachar `addStudent`/`updateStudent` e `assignSeat` com o mesmo `studentId`, e garantir que o slice `students` (e o assento no veículo) persistam no AsyncStorage.
- Unificar `boardingStreet` em um campo de texto livre, com chips/sugestões a partir de `streetsCovered` da rota escolhida (não um seletor exclusivo).
- Ao salvar, se a rua digitada ainda não estiver em `streetsCovered`, incluir no fim via `updateRoute`.
- Logs temporários só em desenvolvimento para confirmar que a action chega ao reducer; remover antes de considerar a change fechada.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `student-registry`: persistência observável do aluno na listagem após salvar; rua de embarque livre com sugestões da rota e autoinclusão em `streetsCovered`.

## Impact

- `app/students/[id].tsx` (submit e UI da rua)
- `store/studentSlice.ts`, `store/vehicleSlice.ts` (`assignSeat`), `store/routeSlice.ts` (`updateRoute`)
- Possível `store/storage.ts` / `store/store.ts` se a persistência estiver falhando no adapter (timeout/manualPersist)
- Sem novos campos em `Student`
- Git na implementação: a partir da branch que já tem o CRUD de alunos (`feat/ajustes-e-melhorias-cadastros` ou `main` depois do merge)
