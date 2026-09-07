## Why

O app já persiste escolas no Redux (`schoolSlice` + `createEntityAdapter`), mas o dashboard de Cadastros ainda trata Escolas como “Em breve”. Sem listagem e formulário, o usuário não consegue cadastrar escolas no fluxo offline, e as entidades Relacionais (rotas/alunos) ficam sem dono visível.

## What Changes

- Habilitar o card **Escolas** em Cadastros para navegar à listagem (`/schools`).
- Nova stack Expo Router `app/schools/`: index (lista) e `[id]` (criar com `new` / editar com id existente).
- CRUD na UI: `addSchool`, `updateSchool`, `removeSchool` (já exportados pelo slice).
- Listagem com nome, diretor, resumo de alunos/rotas vinculados, editar e excluir com `Alert.alert`.
- Formulário com name, address, principal, phone; criação inicializa `studentIds` e `routeIds` como `[]`.
- Sem foto, sem alteração do modelo `School`, sem telas de rotas/alunos nesta change.

## Capabilities

### New Capabilities

- `school-registry`: cadastro, listagem, edição e exclusão de escolas no app, a partir de Cadastros.

### Modified Capabilities

- (nenhuma — ainda não há specs em `openspec/specs/`)

## Impact

- `app/(tabs)/cadastros.tsx` (navegação do card Escolas)
- `app/_layout.tsx` (registrar stack `schools`)
- Novos arquivos: `app/schools/_layout.tsx`, `app/schools/index.tsx`, `app/schools/[id].tsx`
- Store existente: `store/schoolSlice.ts` (`selectAllSchools`, `selectSchoolById`, `addSchool`, `updateSchool`, `removeSchool`)
- Tipo `School` em `types/index.ts` (sem mudança de campos)
- Persistência já cobre `schools` no `persistReducer`; sem novas dependências npm
