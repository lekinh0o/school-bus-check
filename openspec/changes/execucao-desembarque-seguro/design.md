## Context

Ver proposal.md. Hoje `app/routes/execute/[id].tsx` guarda o sentido em `useState` e só desenha a timeline. `store/attendanceSlice.ts` é a chamada diária com mock de três alunos, `shift`, `setMorningStatus` / `setAfternoonStatus` (`types/attendance.ts`: `boarding_home`, `school_dropoff`, etc.). Os alunos reais da rota estão em `studentSlice` (`boardingPoint`, `routeId`). `RouteDirection` já existe em `types/index.ts`. Persistência: `persistReducer` raiz, version 3.

A spec de `route-execution` hoje termina na escolha de sentido e na timeline (ida inclui ponto inicial; volta termina no ponto inicial). A lista operacional desta change **não** inclui o ponto inicial da van: só `boardingPoints` + escola, porque o controle anti-esquecimento é por aluno e ponto de embarque.

## Goals / Non-Goals

**Goals:**
- Sessão serializável `activeExecution` no slice de attendance, com seletores de trava.
- Tela de execução conduz ponto a ponto depois do sentido.
- Nomes de tipo que não colidem com a chamada diária.

**Non-Goals:**
- Substituir a aba de chamada manhã/tarde.
- GPS, mapa, ou gravar sentido no cadastro da rota.
- Relatório histórico de sessões além de persistir a sessão ativa (uma de cada vez).

## Decisions

1. **Estado extra, não troca da chamada**  
   `AttendanceState` ganha `activeExecution: ActiveExecution | null`. `students` mock, `attendance` diária e `shift` permanecem.  
   Alternativa: zerar o slice só com `activeExecution`. Rejeitada — quebraria `useAttendance` e as regras de manhã/tarde do projeto.

2. **Tipos**  
   Em `types/execution.ts` (não `src/types`): `ExecutionStatus = 'PENDING' | 'PRESENT' | 'ABSENT' | 'DROPPED_OFF'`, `ExecutionStudentAttendance`, `ActiveExecution`. Não reutilizar `AttendanceStatus` / `StudentAttendance` de `types/attendance.ts`.

3. **`pointsList` (ids/nomes)**  
   Ida: `[...boardingPoints, schoolId]`. Volta: `[schoolId, ...boardingPoints.slice().reverse()]`.  
   O token da escola é `schoolId`; o da parada de aluno é o texto de `boardingPoint`. A UI resolve o nome da escola. O `startPoint` da timeline visual pode continuar na timeline, mas **não** entra em `pointsList` operacional.  
   Alternativa: incluir `startPoint` no fim da volta. Rejeitada nesta change — nenhum aluno tem `boardingPoint` igual ao start só por ser o start.

4. **Seed de `attendances`**  
   Todos os `Student` com `routeId` igual à rota, `status: PENDING`, `boardingPoint` do cadastro. Aluno sem ponto não entra na sessão (o cadastro já exige ponto).

5. **Reducers**  
   `startRouteExecution({ routeId, direction })` lê rota e alunos via extra argument ou payload já montado na tela (preferir payload montado na tela para o reducer ficar puro: `route`, `schoolId`, `students`).  
   `markStudentStatus`, `advanceToNextPoint` (no-op se o ponto não estiver completo), `skipCurrentPoint`, `finishRouteExecution` (no-op se houver `PRESENT`).

6. **Seletores**  
   `createSelector`: `selectActiveExecution`, `selectCurrentPointName` (nome da escola se o token for `schoolId`), `selectExecutionStats`, `selectStudentsForCurrentPoint`, `selectIsPointComplete`, `selectCanFinishRoute` (`!Object.values(attendances).some(a => a.status === 'PRESENT')` e último índice).

7. **Pular**  
   Não converte PENDING em ABSENT. Criança não embarcada não está na van. No último ponto, skip segue a mesma trava de `selectCanFinishRoute`.

8. **Uma sessão**  
   Nova `startRouteExecution` substitui a anterior. Não há fila de sessões.

## Risks / Trade-offs

- [Colisão de nomes no spec do usuário] → tipos prefixados `Execution*`.
- [Timeline vs lista operacional] → motorista vê ponto inicial na timeline mas o primeiro checklist da ida é o primeiro `boardingPoint`.
- [Pular embarque] → alunos ficam PENDING até o fim; `selectCanFinishRoute` ainda passa se não houver PRESENT. Risco operacional aceito: pulo ≠ criança dentro.
- [Persistência de sessão a meio] → van fecha o app e reabre no mesmo ponto; se isso for indesejado, limpar no `finish` e oferecer “descartar sessão” depois.

## Migration Plan

Sem migrate de version: campo novo `activeExecution: null` no initial state. Rollback = revert do commit. Sessão `IN_PROGRESS` persistida some se o usuário limpar storage.

## Open Questions

Nenhuma que altere spec. Mapeamento PRESENT→`boarding_home` / DROPPED_OFF→`school_dropoff` na aba de chamada fica para um change futuro.
