## 1. Diagnóstico e persistência

- [x] 1.1 Reproduzir Salvar aluno válido e conferir se `addStudent`/`assignSeat` disparam (log `__DEV__` no `studentSlice` ou no submit); verificar a action no reducer e o aluno em `selectAllStudents` antes do `router.back()`
- [x] 1.2 Se o aluno some após reabrir o app, corrigir persistência (`storage.ts` timeout/`setItem`, `manualPersist` em `store.ts`) até o aluno reaparecer na listagem após reload; verificar o fluxo criar → lista → reload
- [x] 1.3 Remover logs temporários; verificar que não restam `console.log` de debug no slice/formulário

## 2. Rua de embarque

- [x] 2.1 Em `app/students/[id].tsx`, um único input de texto para `boardingStreet` e chips/sugestões de `streetsCovered` da rota (toque preenche o input); verificar chip, digitação livre e campo vazio bloqueando Salvar
- [x] 2.2 No submit, se a rua `trim` não estiver em `streetsCovered`, `updateRoute` com a rua no fim do array; verificar aluno na lista, rua na rota e assento ocupado no veículo

## 3. Fechamento

- [x] 3.1 Rodar `npx tsc --noEmit`; verificar exit code 0
