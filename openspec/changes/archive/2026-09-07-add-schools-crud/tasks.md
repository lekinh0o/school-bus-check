## 1. Rotas e navegação

- [x] 1.1 Criar `app/schools/_layout.tsx` (Stack com `index` e `[id]`) e registrar `<Stack.Screen name="schools" />` em `app/_layout.tsx`; verificar que `/schools` e `/schools/new` entram na árvore do Expo Router
- [x] 1.2 Em `app/(tabs)/cadastros.tsx`, habilitar o card Escolas (`enabled: true`, hint real) e navegar com `router.push('/schools')` (ou `as Href` se o typed routes exigir); verificar que o toque abre a listagem e não o Alert “Em breve”

## 2. Listagem

- [x] 2.1 Implementar `app/schools/index.tsx` com `selectAllSchools`, cards NativeWind (nome, diretor, `N Alunos | M Rotas`), ícones Feather editar/excluir e empty state; verificar lista vazia vs. lista com dados mockados via Redux
- [x] 2.2 Botão de destaque ou FAB “Adicionar Nova Escola” para `/schools/new`; verificar navegação ao formulário de criação
- [x] 2.3 Editar navega para `/schools/{id}`; excluir mostra `Alert.alert` e, se confirmado, `removeSchool(id)` (cancelar não remove); verificar os dois fluxos

## 3. Formulário criar / editar

- [x] 3.1 Implementar `app/schools/[id].tsx`: `id === 'new'` cria; senão `selectSchoolById` preenche name, address, principal, phone; inputs NativeWind e botão Salvar desabilitado se algum campo estiver vazio
- [x] 3.2 Salvar criação: `Date.now().toString()`, `studentIds: []`, `routeIds: []`, `addSchool`, depois `router.back()`; verificar escola nova na listagem
- [x] 3.3 Salvar edição: `updateSchool({ id, changes: { name, address, principal, phone } })` sem sobrescrever vínculos; `router.back()`; verificar campos atualizados e counts de alunos/rotas inalterados

## 4. Fechamento

- [x] 4.1 Rodar `npx tsc --noEmit` e corrigir erros de rotas/tipos; verificar exit code 0
