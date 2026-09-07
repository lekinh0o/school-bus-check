## 1. Git e pré-requisito

- [x] 1.1 Atualizar `main` (`git checkout main` e `git pull origin main`), criar `feat/ajustes-e-melhorias-cadastros` e trazer `openspec/changes/improve-cadastros/`; verificar o nome da branch e a pasta da change
- [x] 1.2 Confirmar que `app/students/[id].tsx` e `app/students/index.tsx` existem nesta branch (aplicar/mergear `add-students-crud` antes se faltarem); verificar os dois arquivos presentes antes das tarefas 4.x

## 2. Tipos, persistência e máscaras

- [x] 2.1 Atualizar `types/index.ts`: `School.photoUri?`, `Student.photoUri?`, `Route.title`, `Route.direction` (`IDA` | `VOLTA`), `Route.responsiblePhotoUri?`; verificar o projeto tipar esses campos
- [x] 2.2 Criar `lib/inputMasks.ts` (placa antigo/Mercosul, telefone BR ≥ 10 dígitos, `HH:MM`, inteiro positivo) e usar nos formulários; verificar rejeição de valores inválidos no Salvar
- [x] 2.3 Migrar persist (`version` + `createMigrate`) para rotas sem `title`/`direction`; verificar que o app abre com dados antigos de rota

## 3. Veículos, escolas e rotas

- [x] 3.1 Em `app/vehicles/[id].tsx`, máscara/validação de placa e assentos > 0; verificar placa inválida não salva e assentos só inteiros positivos
- [x] 3.2 Em `app/schools/[id].tsx`, máscara de telefone, `expo-image-picker` e persistir `photoUri`; verificar foto no formulário e telefone curto bloqueando Salvar
- [x] 3.3 Em `app/schools/index.tsx`, miniatura no card quando houver foto; verificar lista com e sem foto
- [x] 3.4 Em `app/routes/[id].tsx`, campos `title` e `direction` (IDA/VOLTA), foto do responsável, horários `HH:MM`, setas subir/descer nas ruas; verificar ordem persistida e save bloqueado sem título/sentido/horário válido
- [x] 3.5 Criar `components/RouteTimeline.tsx` e usar em `app/routes/index.tsx` (início → ruas → escola) com scroll horizontal; card também mostra título e sentido; verificar timeline com ruas e sem ruas

## 4. Alunos (somente com telas existentes)

- [x] 4.1 Em `app/students/[id].tsx`, foto do aluno (`photoUri`) e máscara nos dois telefones; verificar avatar no formulário e telefone curto não salvando
- [x] 4.2 Em `app/students/index.tsx`, avatar circular no card (foto ou placeholder); verificar lista com e sem foto

## 5. Fechamento

- [x] 5.1 Rodar `npx tsc --noEmit`; verificar exit code 0
- [x] 5.2 Atualizar `.cursorrules` (novos campos de rota/escola/aluno e máscaras); verificar o arquivo mencionar título/sentido/fotos
