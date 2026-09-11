## Why

Os cadastros de veículo, escola e rota já funcionam, mas campos livres aceitam placa, telefone e horário inválidos, a rota não descreve título/sentido nem a ordem visual do percurso, e escolas (e alunos, quando o CRUD existir) não têm foto para identificação rápida.

## What Changes

- Validar placa (Mercosul `ABC1D23` ou antigo `ABC-1234`, maiúsculas), telefone BR com DDD (≥ 10 dígitos, máscara), horários `HH:MM` e inteiros positivos (idade, assentos).
- Estender `Route` com `title`, `direction` (`IDA` | `VOLTA`) e `responsiblePhotoUri` opcional; formulário com foto via `expo-image-picker`.
- Reordenar ruas no formulário (subir/descer) e persistir essa ordem em `streetsCovered`.
- Timeline horizontal na listagem (ou card) da rota: ponto inicial → ruas → escola.
- Estender `School` e `Student` com `photoUri` opcional; miniatura nos formulários e cards.
- Sem backend; persistência local como hoje. Fotos: URI local como no veículo.

## Capabilities

### New Capabilities

- `cadastro-input-validation`: regras observáveis de formato para placa, telefone, horário e inteiros positivos nos formulários de cadastro.

### Modified Capabilities

- `school-registry`: foto opcional da escola no formulário e na listagem; telefone da escola segue a máscara/validação BR.
- `route-registry`: título e sentido obrigatórios, foto do responsável, ordem das ruas, timeline do percurso, horários `HH:MM`.
- `student-registry`: foto opcional do aluno (avatar) no formulário e na listagem; telefones de contato com máscara BR. (Delta ADDED; o CRUD base está em `add-students-crud` — aplicar esta change com as telas de alunos já presentes.)

## Impact

- `types/index.ts` (`School.photoUri`, `Route.title` / `direction` / `responsiblePhotoUri`, `Student.photoUri`)
- `app/vehicles/[id].tsx`, `app/schools/[id].tsx`, `app/schools/index.tsx`
- `app/routes/[id].tsx`, `app/routes/index.tsx`, possível `components/RouteTimeline.tsx`
- `app/students/[id].tsx`, `app/students/index.tsx` (quando existirem)
- Helpers de máscara em arquivo compartilhado (ex. `lib/inputMasks.ts`)
- `expo-image-picker` já no projeto (veículos)
- Git na implementação: `feat/ajustes-e-melhorias-cadastros` a partir de `main` atualizado
