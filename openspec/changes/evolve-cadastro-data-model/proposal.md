## Why

Os cadastros de escola e aluno só aceitam formulários completos e não têm identificadores de negócio (registro, carteirinha/matrícula). Isso impede preparar importação/exportação em Excel e manter registros parciais sem quebrar os `id` internos e os vínculos já persistidos.

## What Changes

- Acrescentar **Registro** opcional no cadastro de escola (campo técnico `registry`).
- Acrescentar **Carteirinha / Matrícula** opcional no cadastro de aluno (campo técnico `enrollmentCode`).
- Relaxar campos descritivos preenchidos pelo usuário em escola e aluno quando a ausência não quebra integridade estrutural (vínculos e `id` interno).
- Tratar valor vazio no formulário (e, no futuro, no Excel) como campo omitido (`undefined`), não como string vazia persistida.
- Distinguir “campo opcional em branco” de “relacionamento inválido” (id de escola/rota/veículo inexistente).
- Manter `id` gerado pelo app, `selectId` dos adapters e as relações atuais (`schoolId`, `routeId`, `vehicleId`, `seatNumber`, `boardingPoint`, `studentIds`, `routeIds`).
- Compatibilidade com dados já persistidos: campos novos ausentes são válidos; sem migração destrutiva.

## Capabilities

### New Capabilities

- (nenhuma) Identificadores de negócio e opcionalidade entram nas capacidades de cadastro já existentes.

### Modified Capabilities

- `school-registry`: escola pode ter `registry` opcional; endereço, diretor(a) e telefone passam a ser opcionais; nome e `id` continuam obrigatórios; listagem tolera descritivos ausentes.
- `student-registry`: aluno pode ter `enrollmentCode` opcional; idade, responsável, telefones e série passam a ser opcionais; nome e vínculos estruturais continuam obrigatórios no fluxo de cadastro da UI; listagem tolera descritivos ausentes.
- `cadastro-input-validation`: validação de formato (telefone, inteiro positivo) aplica-se só quando o campo opcional está preenchido; vazio não é erro de formato.

## Impact

- Tipos: `types/index.ts` (`School`, `Student`). Não alterar o `Student` legado em `types/attendance.ts`.
- Formulários e listas: `app/schools/[id].tsx`, `app/schools/index.tsx`, `app/students/[id].tsx`, `app/students/index.tsx`.
- Slices: `store/schoolSlice.ts` e `store/studentSlice.ts` continuam selecionando por `id`; persistência `redux-persist` em `store/store.ts` (versão 7 hoje) — apenas migração não destrutiva se for preciso normalizar strings vazias.
- Relacionamentos, mapa de assentos, execução de rota e veículos/rotas: fora do relaxamento de obrigatoriedade.
- Importação/exportação Excel: fora desta change (só o modelo fica pronto).
- GitHub: [issue #29](https://github.com/lekinh0o/school-bus-check/issues/29).
