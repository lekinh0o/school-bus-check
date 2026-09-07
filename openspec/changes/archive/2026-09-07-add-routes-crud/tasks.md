## 1. Git

- [x] 1.1 Atualizar `main` (`git checkout main` e `git pull origin main`), criar `feat/cadastro-de-rotas` e garantir que `openspec/changes/add-routes-crud/` esteja nessa branch (stash ou cherry-pick se o planejamento ficou em outra); verificar `git branch --show-current` igual a `feat/cadastro-de-rotas` e a pasta da change presente

## 2. Rotas e navegação

- [x] 2.1 Criar `app/routes/_layout.tsx` (Stack com `index` e `[id]`) e registrar `<Stack.Screen name="routes" />` em `app/_layout.tsx`; verificar que `/routes` e `/routes/new` entram na árvore do Expo Router
- [x] 2.2 Em `app/(tabs)/cadastros.tsx`, habilitar o card Rotas (`enabled: true`, hint real) e navegar com `router.push('/routes')` (ou `as Href`); verificar que o toque abre a listagem e não o Alert “Em breve”

## 3. Listagem

- [x] 3.1 Implementar `app/routes/index.tsx` com `selectAllRoutes`, cards NativeWind (`startPoint`, período, `{startTime} às {endTime}`, nome da escola via `selectSchoolById` ou fallback se a escola não existir), ícones Feather editar/excluir e empty state; verificar lista vazia vs. lista com dados
- [x] 3.2 Botão de destaque ou FAB “Adicionar Nova Rota” para `/routes/new`; verificar navegação ao formulário de criação
- [x] 3.3 Editar navega para `/routes/{id}`; excluir mostra `Alert.alert` e, se confirmado, `removeRoute` e remove o id de `School.routeIds` (cancelar não remove); verificar os dois fluxos

## 4. Formulário criar / editar

- [x] 4.1 Implementar `app/routes/[id].tsx`: `id === 'new'` cria; senão `selectRouteById` preenche campos e `streetsCovered`; botões de período (`Manha` | `Tarde` | `Noite` com rótulos Manhã/Tarde/Noite); lista de escolas com `selectAllSchools`; Salvar desabilitado se faltar campo obrigatório ou `schoolId`
- [x] 4.2 Lista de ruas: input + “+” (`trim`, ignorar vazio, limpar input) e “X” para remover; verificar adicionar, remover e tentativa com nome vazio
- [x] 4.3 Salvar criação: `Date.now().toString()`, `addRoute` com `streetsCovered` do estado local, `updateSchool` incluindo o id em `routeIds` da escola escolhida, `router.back()`; verificar rota na listagem e `M Rotas` na escola
- [x] 4.4 Salvar edição: `updateRoute` com o objeto completo (incluindo ruas); se `schoolId` mudar, tirar o id da escola antiga e pôr na nova; `router.back()`; verificar campos, ruas e contagens

## 5. Fechamento

- [x] 5.1 Rodar `npx tsc --noEmit` e corrigir erros de rotas/tipos; verificar exit code 0
- [x] 5.2 Atualizar `.cursorrules` com os caminhos de `app/routes/` se o bloco de cadastros listar só veículos/escolas; verificar o arquivo mencionar rotas
