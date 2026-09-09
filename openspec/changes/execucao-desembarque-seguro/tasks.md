## 1. Modelo

- [x] 1.1 Criar `types/execution.ts` (`ExecutionStatus`, `ExecutionStudentAttendance`, `ActiveExecution`) e verificar que não reexporta nem sobrescreve `AttendanceStatus` de `types/attendance.ts`
- [x] 1.2 Estender `attendanceSlice` com `activeExecution: null`, `startRouteExecution`, `markStudentStatus`, `advanceToNextPoint`, `skipCurrentPoint`, `finishRouteExecution` e os seletores da spec; verificar `npx tsc --noEmit` e que `setMorningStatus` / `setShift` continuam exportados

## 2. Travas

- [x] 2.1 Implementar `selectStudentsForCurrentPoint` e `selectIsPointComplete` (ida embarque vs escola; volta escola vs pontos); verificar ida no último ponto lista só `PRESENT` e volta no primeiro lista só `PENDING`
- [x] 2.2 `selectCanFinishRoute` e no-op de `finishRouteExecution` / `skipCurrentPoint` no último ponto se houver `PRESENT`; verificar que com um `PRESENT` o finish não muda `status` da sessão

## 3. Tela

- [x] 3.1 Em `app/routes/execute/[id].tsx`, após IDA/VOLTA disparar `startRouteExecution` com alunos da rota e `pointsList` do design; verificar que o sentido da sessão não troca no meio
- [x] 3.2 Lista do ponto atual com ações Presente / Ausente / Desembarcou, botão Concluir ponto desabilitado se incompleto, Pular, e Finalizar só no último ponto se `selectCanFinishRoute`; verificar a trava visual com um aluno ainda `PRESENT`
- [x] 3.3 Rodar `npx tsc --noEmit` de novo e verificar exit 0
