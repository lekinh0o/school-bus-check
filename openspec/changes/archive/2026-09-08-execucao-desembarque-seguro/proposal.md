## Why

A timeline de sentido não impede que um aluno embarque e nunca desembarque. No transporte escolar isso é risco de criança esquecida na van. A execução precisa de sessão com status por aluno e trava: a viagem só termina se ninguém estiver `PRESENT`.

## What Changes

- Sessão de execução ativa no Redux (`startRouteExecution`, ponto atual, lista ordenada de paradas, status por aluno).
- Quarto status operacional: `PENDING` | `PRESENT` | `ABSENT` | `DROPPED_OFF`. Quem embarcou (`PRESENT`) MUST desembarcar (`DROPPED_OFF`) antes de concluir.
- Ida: nos pontos de embarque marca `PRESENT`/`ABSENT`; na escola lista quem está na van e exige `DROPPED_OFF`.
- Volta: na escola marca `PRESENT`/`ABSENT`; nos pontos de desembarque lista os `PRESENT` daquele ponto e exige `DROPPED_OFF`.
- Avançar ponto, pular ponto e **bloquear finalizar** enquanto existir qualquer `PRESENT`.
- **Não é BREAKING** no cadastro da rota. A chamada diária da aba (manhã/tarde, `boarding_home` etc.) permanece; a sessão de execução é estado adicional, não substitui esses eventos neste change.

## Capabilities

### New Capabilities
- _(nenhuma)_ — o comportamento observável é da execução de rota já existente.

### Modified Capabilities
- `route-execution`: sessão ponto a ponto, lista de alunos do ponto, conclusão de ponto, pular ponto, e trava de encerramento se ainda houver aluno na van.

## Impact

- `store/attendanceSlice.ts` (sessão `activeExecution` + seletores), tipos em `types/` (nomes distintos dos `AttendanceStatus` / `StudentAttendance` da chamada diária).
- `app/routes/execute/[id].tsx` (depois de escolher IDA/VOLTA: percurso operacional).
- Alunos da rota: `store/studentSlice` (`routeId`, `boardingPoint`).
- Persistência: `activeExecution` entra no `persistReducer` já existente.
- Não altera `route-registry` nem remove `setMorningStatus` / `setAfternoonStatus` neste change.
