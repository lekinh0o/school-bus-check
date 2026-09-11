## Why

O tipo `Student` e o `studentSlice` já existem, mas Cadastros ainda trata Alunos como “Em breve”. Sem o formulário em cadeia (escola → rota → rua → veículo/assento), o transporte não consegue registrar quem embarca onde nem ocupar o mapa de assentos.

## What Changes

- Habilitar o card **Alunos** em Cadastros para navegar à listagem (`/students`).
- Nova stack Expo Router `app/students/`: index (lista) e `[id]` (criar com `new` / editar com id existente).
- CRUD na UI via `addStudent`, `updateStudent` e `removeStudent`.
- Listagem com nome, série, escola, rota e assento; editar e excluir com `Alert.alert`.
- Formulário com dados pessoais, no mínimo dois telefones, escola, rotas filtradas pela escola, rua de embarque a partir de `streetsCovered` (com opção de rua nova), veículo e mapa de assentos selecionável.
- Ao salvar: `assignSeat`; ao excluir ou trocar assento/veículo: `removeSeat` no assento anterior.
- Atualizar `School.studentIds` na criação, troca de escola e exclusão.
- Se o usuário informar uma rua de embarque que ainda não está na rota, incluí-la em `streetsCovered` daquela rota.
- Sem alteração do tipo `Student`, sem CRUD de chamada/presença, sem novos campos no modelo.

## Capabilities

### New Capabilities

- `student-registry`: cadastro, listagem, edição e exclusão de alunos, com vínculos a escola, rota, rua de embarque, veículo e assento.

### Modified Capabilities

- `school-registry`: o resumo `N Alunos` na listagem de escolas deve refletir `studentIds` após criar, reatribuir ou excluir alunos.

## Impact

- `app/(tabs)/cadastros.tsx` (navegação do card Alunos)
- `app/_layout.tsx` (registrar stack `students`)
- Novos arquivos: `app/students/_layout.tsx`, `app/students/index.tsx`, `app/students/[id].tsx`; possível componente de mapa de assentos em `components/`
- Store: `store/studentSlice.ts`, `store/vehicleSlice.ts` (`assignSeat` / `removeSeat`), `store/schoolSlice.ts`, `store/routeSlice.ts` (`updateRoute` se rua nova)
- Tipos em `types/index.ts` — sem novos campos
- Persistência já cobre `students`; sem novas dependências npm
- Git na implementação: `main` atualizado e branch `feat/cadastro-de-alunos` (não nesta fase de planejamento)
