## 1. Tipos e helper de vazio

- [x] 1.1 Em `types/index.ts`, acrescentar `School.registry?: string` e tornar `address`, `principal` e `phone` opcionais; verificar que `id`, `name`, `studentIds` e `routeIds` continuam obrigatórios
- [x] 1.2 Em `types/index.ts`, acrescentar `Student.enrollmentCode?: string` e tornar `age`, `responsible`, `contactPhones` e `grade` opcionais; verificar que `id`, `name`, `schoolId`, `routeId`, `boardingPoint`, `vehicleId` e `seatNumber` continuam obrigatórios e que `types/attendance.ts` não muda
- [x] 1.3 Criar helper (ex. `lib/optionalFields.ts`) que faz trim e devolve `undefined` para string vazia, e filtra telefones vazios; verificar com uso direto ou teste curto que `""` e `"  "` viram `undefined` e que telefone preenchido permanece

## 2. Persistência compatível

- [x] 2.1 Acrescentar migration 8 em `store/store.ts` que, em `schools` e `students`, remove chaves descritivas com string vazia e não altera `ids` nem vínculos; subir `persistConfig.version` para 8 e verificar que o migrate não apaga entidades
- [x] 2.2 Confirmar que `schoolSlice` e `studentSlice` continuam com `selectId` em `id`; verificar grep que nenhum selector passa a usar `registry` ou `enrollmentCode` como chave

## 3. Cadastro de escola

- [x] 3.1 Em `app/schools/[id].tsx`, adicionar campo **Registro**, persistir via helper, exigir só o nome, validar telefone apenas se preenchido e omitir descritivos vazios no payload; verificar que o botão de salvar habilita com nome e o resto vazio, e recusa telefone curto preenchido
- [x] 3.2 Ajustar checklist e dirty-check do formulário de escola para os campos opcionais e registro; verificar que reabrir escola antiga sem `registry` mostra o campo vazio e salva
- [x] 3.3 Em `app/schools/index.tsx`, mostrar registro quando existir e omitir diretor(a) quando vazio; verificar que a lista não quebra com `principal` ausente e que o resumo `N Alunos | M Rotas` permanece

## 4. Cadastro de aluno

- [x] 4.1 Em `app/students/[id].tsx`, adicionar campo **Carteirinha / Matrícula**, persistir `enrollmentCode` via helper e relaxar idade, responsável, telefones e série; verificar que salvar exige nome + escola + rota + ponto + veículo + assento, e que descritivos vazios não bloqueiam
- [x] 4.2 Validar telefone só se preenchido e idade só se preenchida (`parsePositiveInt`); montar `contactPhones` só com números válidos; verificar um telefone só, zero telefones, e recusa de telefone curto preenchido
- [x] 4.3 Manter recusa quando falta vínculo estrutural (escola sem rotas, assento ocupado, ids vazios); verificar que campo opcional vazio não é tratado como relacionamento inválido
- [x] 4.4 Em `app/students/index.tsx`, mostrar `enrollmentCode` quando existir e omitir série vazia; verificar listagem de aluno antigo sem o campo novo e com `grade` ausente
- [x] 4.5 Ajustar formulário para `age`/`responsible`/`contactPhones` indefinidos no `useEffect` (não `String(undefined)`); verificar edição de aluno persistido na versão 7

## 5. Callers e conferência

- [x] 5.1 Auditar usos de `school.principal`, `school.address`, `school.phone`, `student.age`, `student.grade`, `student.responsible` e `student.contactPhones` (incluindo `app/routes/execute/[id].tsx` e `app/history/[id].tsx`) e tratar ausência; verificar TypeScript (`npx tsc --noEmit`) e `npm test`
- [x] 5.2 Conferir que execução, mapa de assentos e exclusão de aluno ainda usam `id` interno e os FKs atuais; verificar que matrícula/registro não entram em `assignSeat` / `studentIds`
