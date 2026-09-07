## Context

Ver proposal.md (Why / What Changes). O slice `schoolSlice` já existe com Entity Adapter (`addSchool`, `updateSchool`, `removeSchool`, `selectAllSchools`, `selectSchoolById`) e está no `persistReducer`. O padrão de UI a espelhar é o módulo de veículos: stack Expo Router fora das tabs (`app/vehicles/_layout.tsx` + `app/vehicles/[id].tsx`), registrado em `app/_layout.tsx`. Cadastros hoje marca Escolas como `enabled: false` e mostra Alert “Em breve”. Veículos usam bottom sheet; a spec pede **tela de listagem** (`/schools`), não modal.

## Goals / Non-Goals

**Goals:**
- Reusar o slice e o tipo `School` sem novos campos.
- Stack `app/schools` paralela a `app/vehicles` (index + `[id]`).
- Formulário controlado com `useState`, NativeWind, sem lib de forms.
- Edição via `updateSchool({ id, changes })` sem substituir `studentIds`/`routeIds`.

**Non-Goals:**
- Foto da escola, geocoding, validação de telefone além de não-vazio.
- CRUD de rotas/alunos ou recálculo de vínculos ao excluir escola.
- Testes automatizados nesta change.

## Decisions

1. **Listagem em tela cheia, não bottom sheet**  
   A tarefa pede `/app/schools/index.tsx`. Cadastros navega com `router.push('/schools')`.  
   Alternativa considerada: reusar o padrão `VehicleListModal`. Rejeitada porque a spec exige rota de listagem.

2. **Rota dinâmica `[id]` com sentinela `new`**  
   Igual veículos: `id === 'new'` cria; caso contrário `selectSchoolById`. FAB/botão “Adicionar Nova Escola” vai para `/schools/new`.  
   Alternativa: `create.tsx` separado. Rejeitada para consistência com veículos.

3. **Criação gera `Date.now().toString()` e arrays vazios**  
   Conforme a tarefa. Edição envia só `{ name, address, principal, phone }` em `changes`, para não zerar vínculos.

4. **Registrar `schools` no Stack raiz**  
   Sem isso o grupo de rotas não entra na árvore (mesmo problema evitado em `vehicles`).

5. **Ícones Feather** (`edit-2`, `trash-2`) como em `VehicleListModal`, `Alert.alert` nativo para exclusão. No web o Alert pode degenerar; aceitável nesta fase.

6. **Typed routes**  
   Se o union do Expo Router ainda não incluir `/schools`, usar `as Href` como no modal de veículos.

## Risks / Trade-offs

- [Lista vazia vs. FAB] → Mostrar empty state **e** botão de adicionar (topo ou FAB) para cumprir os dois cenários da spec.
- [Excluir escola com rotas/alunos] → Não cascatear agora; documentado como non-goal. Risco de IDs órfãos até o CRUD de rotas/alunos.
- [Persistência Android] → Reusa o bootstrap já existente; sem mudança de storage.

## Migration Plan

Nenhuma migração de dados: escolas novas nascem vazias. Rollback = reverter os arquivos de UI/rotas; o slice permanece compatível.
