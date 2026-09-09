## Context

See proposal.md for motivation. Histórico já está em `attendance.executionHistory` (`RouteHistory` com `startedAt` ISO). O início da viagem é `StartRouteSheet` → `startRouteExecution`. A chamada diária (`setMorningStatus`) não é fonte deste cruzamento.

## Goals / Non-Goals

**Goals:**
- Interromper VOLTA sem IDA encerrada no dia local até haver justificativa persistida.
- Badge informativo na VOLTA a partir do último registro IDA do dia da mesma `routeId`.

**Non-Goals:**
- Impedir embarque na volta de quem faltou na ida.
- Validar IDA contra VOLTA anterior ou cruzar rotas diferentes.
- Relógio de servidor / fuso além do dia local do aparelho.

## Decisions

1. **Dia local `YYYY-MM-DD`.** Helper `localDateKey(iso)` a partir de `startedAt` (e “hoje” com a mesma chave). Evita `toDateString()` cuja string depende de locale. Alternativa (`toDateString`) foi rejeitada por risco de formato.

2. **IDA “do dia” = última viagem `COMPLETED` com `direction === 'IDA'` e `routeId` igual, `localDateKey(startedAt) === hoje`.** Se houver duas idas, a mais recente (`startedAt` maior) alimenta o alerta de falta.

3. **Justificativa no modelo.** `cycleJustification?: { kind: 'forgot_morning' | 'afternoon_only' | 'free_text'; note?: string }` em `ActiveExecution` e copiado em `RouteHistory`. Texto livre exige `note` não vazio. `startRouteExecution` recebe o campo opcional; o sheet só dispara VOLTA sem IDA depois do modal.

4. **UI do ciclo.** Segundo `Modal` sobre o sheet (não substitui o seletor de sentido). Cancelar fecha o modal de justificativa e não inicia. Opções rápidas disparam o start na hora.

5. **Seletores `createSelector`.** `selectHasCompletedIdaToday(routeId)`, `selectIdaAbsentStudentIds` (Set/Record a partir da última IDA). Entrada: histórico + `routeId` da sessão + chave do dia. Não ler `attendance.attendance` (manhã/tarde).

6. **Histórico detalhe.** Se `cycleJustification` existir, mostrar o motivo no detalhe da viagem (auditoria).

7. **Persist.** Campo opcional; migrate não obrigatório (clientes antigos sem o campo = sem justificativa).

## Risks / Trade-offs

- [Meia-noite no meio da volta] → Mitigação: o alerta usa o dia da sessão de VOLTA (`startedAt` da sessão ativa), não “agora”, para não perder a IDA da madrugada se a volta cruzar 00:00. A validação de início usa o dia no clique de Iniciar.
- [IDA em andamento, não encerrada] → Mitigação: só conta IDA encerrada; o motorista ainda precisa justificar a VOLTA (não trata sessão aberta como ciclo completo).
- [Texto livre vazio] → Mitigação: confirmar desabilitado até haver texto.

## Migration Plan

- Sem bump de persist. Rollback = ignorar campos extras.

## Open Questions

Nenhum que altere spec ou tarefas.
