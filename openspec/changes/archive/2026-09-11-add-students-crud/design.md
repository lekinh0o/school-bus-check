## Context

Ver proposal.md e os deltas em `specs/`. `studentSlice` já exporta `addStudent` / `updateStudent` / `removeStudent`. `assignSeat` e `removeSeat` já existem em `vehicleSlice` (não checam ocupação — a UI deve impedir). `School.studentIds` e `Route.streetsCovered` / `schoolId` já estão no modelo. O formulário de veículo desenha um grid de quadrados sem ocupação; a seleção ocupada/livre nasce no cadastro de alunos. Padrão de stack: `app/schools/` e `app/routes/`. Tipos em `types/index.ts` (não `src/types`). Dois telefones: `contactPhones` é `string[]`.

## Goals / Non-Goals

**Goals:**
- Reusar slices e o tipo `Student` sem novos campos.
- Formulário em cadeia (escola → rotas da escola → ruas da rota → veículo → assento).
- Manter `studentIds`, `seatsMap` e, se rua nova, `streetsCovered` alinhados ao salvar/excluir.

**Non-Goals:**
- Presença diária / `attendanceSlice`.
- Cascata ao excluir escola, rota ou veículo (cards usam fallback se o vínculo sumiu).
- Alterar `assignSeat` para recusar ocupado (a tela não oferece o assento).
- Lib de picker; sem novos pacotes npm.
- Testes automatizados nesta change.

## Decisions

1. **Git só no apply**  
   Branch `feat/cadastro-de-alunos` a partir de `main` atualizado. OpenSpec: `add-students-crud`.

2. **Stack `app/students` + `[id]` com `new`**  
   Igual escolas/rotas. ID: `Date.now().toString()`. Cadastros: `router.push('/students')`.

3. **Dois campos de telefone fixos**  
   Estado `phone1` e `phone2`; ao salvar `contactPhones: [phone1.trim(), phone2.trim()]`. Edição: preenche os dois primeiros; extras além de 2 são preservados concatenando o restante após os dois editados, para não apagar dados.  
   Alternativa: lista dinâmica ilimitada. Rejeitada: a spec pede mínimo 2 e dois campos bastam para o primeiro corte.

4. **Cadeia e resets**  
   Trocar escola limpa rota, rua e (se quiser consistência de destino) não mexe no veículo. Trocar rota limpa rua. Trocar veículo limpa assento, exceto se o assento atual ainda existir e for do próprio aluno no mesmo veículo.

5. **Rotas filtradas**  
   `selectAllRoutes` filtrado por `route.schoolId === schoolId`. Sem filtro global.

6. **Rua nova**  
   Lista das ruas da rota + input “Outra rua”. Se o texto trimado não estiver em `streetsCovered`, `updateRoute` com a lista acrescida no mesmo save. Não usar o rótulo “Novo Aluno” (interpretação: rua nova).

7. **Mapa de assentos**  
   Componente `components/SeatMapPicker.tsx`: `flex-wrap` como em `app/vehicles/[id].tsx`. Livre: verde (`bg-brand-light`); ocupado por outro: cinza/vermelho, não pressionável; selecionado / próprio aluno: borda `brand`. `seatNumber` 1-based alinhado ao `seatsMap`.

8. **Ordem no save**  
   Criar: `addStudent` → `assignSeat` → `updateSchool` (`studentIds`) → `updateRoute` se rua nova.  
   Editar: `removeSeat` no assento antigo se veículo/assento mudou → `updateStudent` → `assignSeat` → ajustar `studentIds` se escola mudou → rua nova na rota.  
   Excluir: `removeSeat` → `removeStudent` → tirar de `studentIds`.

9. **Idade**  
   Input numérico; `Number.parseInt`; inválido ou ≤ 0 bloqueia Salvar.

## Risks / Trade-offs

- [Nenhuma escola/rota/veículo] → empty states; Salvar desabilitado.
- [Rota sem ruas] → só o input de rua nova; ainda obrigatório ter rua.
- [assignSeat em assento ocupado] → UI não oferece; se estado inconsistente, ainda assim o reducer sobrescreve — aceitável nesta fase.
- [Telefones extras] → preservados no edit para não perder dados.

## Migration Plan

Sem migração. Rollback = reverter telas/componente e os `updateSchool` / `assignSeat`. Slices permanecem.

## Open Questions

Nenhuma. Filtrar rotas pela escola, dois telefones fixos, rua nova persistida na rota e mapa no formulário de aluno estão decididos.
