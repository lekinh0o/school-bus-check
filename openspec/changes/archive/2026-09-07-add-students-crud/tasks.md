## 1. Git

- [x] 1.1 Atualizar `main` (`git checkout main` e `git pull origin main`), criar `feat/cadastro-de-alunos` e garantir que `openspec/changes/add-students-crud/` esteja nessa branch; verificar `git branch --show-current` igual a `feat/cadastro-de-alunos` e a pasta da change presente

## 2. Rotas e navegação

- [x] 2.1 Criar `app/students/_layout.tsx` (Stack `index` + `[id]`) e registrar `<Stack.Screen name="students" />` em `app/_layout.tsx`; verificar que `/students` e `/students/new` entram na árvore do Expo Router
- [x] 2.2 Em `app/(tabs)/cadastros.tsx`, habilitar o card Alunos (`enabled: true`, hint real) e `router.push('/students')` (ou `as Href`); verificar que o toque abre a listagem e não o Alert “Em breve”

## 3. Listagem

- [x] 3.1 Implementar `app/students/index.tsx` com `selectAllStudents`, cards NativeWind (nome, série, escola, rota, assento, fallback se vínculo ausente), Feather editar/excluir e empty state; verificar lista vazia vs. com dados
- [x] 3.2 FAB ou botão “Adicionar Novo Aluno” para `/students/new`; verificar navegação ao formulário
- [x] 3.3 Editar vai para `/students/{id}`; excluir usa `Alert.alert` e, se confirmado, `removeSeat`, `removeStudent` e tira o id de `School.studentIds` (cancelar não muda nada); verificar os dois fluxos

## 4. Mapa de assentos e formulário

- [x] 4.1 Criar `components/SeatMapPicker.tsx` (grid wrap, livre selecionável, ocupado por outro bloqueado e distinto, assento do aluno editado selecionável); verificar toque em livre vs. ocupado
- [x] 4.2 Implementar `app/students/[id].tsx`: criar se `id === 'new'`; senão preencher de `selectStudentById`; dois telefones; idade numérica; lista de escolas; rotas filtradas por `schoolId`; ruas da rota + input “Outra rua”; lista de veículos + SeatMapPicker; Salvar desabilitado se faltar obrigatório ou assento inválido
- [x] 4.3 Trocar escola limpa rota e rua; trocar rota limpa rua; trocar veículo limpa assento (exceto o do próprio aluno no mesmo veículo); verificar os resets
- [x] 4.4 Salvar criação: `Date.now().toString()`, `addStudent`, `assignSeat`, `updateSchool` em `studentIds`, `updateRoute` se rua nova, `router.back()`; verificar aluno na lista, assento ocupado e `N Alunos` na escola
- [x] 4.5 Salvar edição: `removeSeat` se veículo/assento mudou, `updateStudent`, `assignSeat`, ajustar `studentIds` se escola mudou, rua nova na rota; verificar troca de assento e de escola

## 5. Fechamento

- [x] 5.1 Rodar `npx tsc --noEmit` e corrigir erros; verificar exit code 0
- [x] 5.2 Atualizar `.cursorrules` com `app/students/` e `SeatMapPicker`; verificar o arquivo mencionar alunos
