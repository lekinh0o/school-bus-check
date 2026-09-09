## Context

See `proposal.md` for motivation. O Início junta rotas (`selectAllRoutes`) e `executionHistory` no mesmo `FlatList`. A timeline de cadastro e o cabeçalho da execução são faixas horizontais (`RouteTimeline` e `visualStops` em `execute/[id].tsx`), ícones ~40px. Contato chama `openGuardianContact(contactPhones[0])` (só WhatsApp). Não há toast global; bloqueios usam botão desabilitado. Histórico detalhado tem timeline de auditoria vertical, não o percurso visual. Sem backend.

## Goals / Non-Goals

**Goals:**

- Dashboard em duas seções; histórico recente (ex.: 5) + `app/history/index.tsx`.
- Componente de percurso em “S” compartilhado (execução + detalhe); cadastros permanece na faixa compacta.
- `AppAlert` com `kind: 'info' | 'warning' | 'error'`.
- Long press → modal de foto; seletor de telefones + `tel:` e `wa.me`.

**Non-Goals:**

- Não alterar persistência, presença diária nem regras de ciclo IDA/VOLTA.
- Não acrescentar rótulos Mãe/Pai em `Student`.
- Não redesenhar Cadastros nem o mapa de assentos.
- Sem biblioteca nova de toast se um modal NativeWind resolver.

## Decisions

### 1. Seções no Início, não abas de navegação

Duas seções no mesmo ecrã (Rotas / Histórico recente). Abas novas no tab bar atropelariam Cadastros.

**Alternativa:** só filtros — rejeitada porque o histórico ainda empurraria as rotas para baixo.

### 2. Percurso em S num componente próprio

`SnakePathTimeline` (nome a definir) recebe stops + estado (pendente / atual / feito). `RouteTimeline` horizontal fica no cadastro. Chunks de N nós por linha (ex. 4), linha ímpar LTR, par RTL, conectores `View`.

**Alternativa:** wrap do `flex-row` sem inverter — rejeitada porque o “S” pede sentido invertido na linha de baixo.

### 3. Alertas como componente controlado, não Context obrigatório

`AppAlert` local ou um hook simples. Migrar: concluir inválido (ERRO); badge de falta na ida (ALERTA). INFO fica disponível para avisos não bloqueantes. Justificativa de ciclo VOLTA permanece o modal específico já existente (não duplicar).

**Alternativa:** só `Alert.alert` nativo — rejeitada pelo spec de cores/tipos.

### 4. Concluir inválido: toque mostra ERRO

O botão pode permanecer visualmente secundário, mas o toque MUST disparar ERRO (não só `disabled` silencioso).

### 5. Contato

Lista `contactPhones` como “Telefone 1”, “Telefone 2” + máscara. Um número: WhatsApp direto. Vários: ActionSheet/modal → depois WhatsApp e Ligar.

## Risks / Trade-offs

- **[Risk]** “S” com labels longos quebra o layout. → Mitigation: `numberOfLines` e largura máxima por nó.
- **[Risk]** Long press compete com scroll. → Mitigation: só no avatar; delay padrão do RN.
- **[Trade-off]** Início mostra só N viagens; o resto na lista dedicada.

## Migration Plan

1. Apply: `git checkout main && git pull && git checkout -b feat/evolucao-ui-ux-operacional`.
2. Componentes, depois telas.
3. Sem migration persist.

## Open Questions

Nenhum que altere spec. Quantos itens no recorte do Início (5 vs 8) fica na implementação.
