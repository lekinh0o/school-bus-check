## Context

Ver proposal.md. `app/(tabs)/index.tsx` só tem boas-vindas. A execução está em `app/routes/execute/[id].tsx`: sentido na própria tela, uma coluna, sem tabs, sem foto, sem mapa. `BusSeatMap` mostra número, não foto. Alunos têm `photoUri` e `contactPhones`. Sessão: `activeExecution` + seletores. Não há `Linking`. Branch de apply: `fix/ui-execucao-rota-completa` a partir de `main` atualizado.

Conflito com o change `execucao-desembarque-seguro` (ainda ativo): lá o pular avança mesmo com pendentes; aqui Próximo só se ninguém foi marcado. A trava de não encerrar com `PRESENT` permanece.

## Goals / Non-Goals

**Goals:**
- Início como porta da execução; sheet → `startRouteExecution` → `execute/[id]`.
- Tabs, cabeçalho fixo, fotos, contato, travas de Concluir/Próximo, auto-avanço, resumo com mapa.

**Non-Goals:**
- GPS. Nova lib de tabs nativa (tabs locais na tela bastam).
- Substituir a aba de chamada manhã/tarde.
- Mudar o cadastro de rotas.

## Decisions

1. **Partida**  
   Lista em Início = `selectAllRoutes`. Sheet espelha o padrão Modal do `VehicleListModal`. Iniciar Trajeto despacha e `router.push('/routes/execute/'+id)`. Cadastros Executar abre o mesmo sheet.

2. **Tabs**  
   Estado local `execution` | `resumo` na tela, não Stack aninhado. Cabeçalho da tab Execução fora do scroll da lista (`View` topo + `ScrollView` lista).

3. **Timeline visual vs `pointsList`**  
   Timeline do cabeçalho inclui `startPoint` (bandeira de partida/chegada) como na spec de UI. `pointsList` operacional continua sem o start (só boarding + escola). Ícones: Feather `flag` / `check` / `clock` (ampulheta). IDA: flag azul início, checks/ampulhetas nos pontos, flag xadrez escola (usar `flag` + cor distinta se não houver ícone xadrez no Feather).

4. **Presente/Ausente vs `DROPPED_OFF`**  
   Embarque: Presente → `PRESENT`, Ausente → `ABSENT`. Desembarque: o botão “Presente/Desembarcou” → `DROPPED_OFF`; Ausente no desembarque não se aplica à criança já na van — Ausente permanece só no embarque. No desembarque só o botão de desembarque (verde).  
   Alternativa: dois botões no desembarque. Rejeitada — criança já está na van.

5. **Próximo vs segurança**  
   Próximo = `skipCurrentPoint` só se `selectStudentsForCurrentPoint` ainda for a lista inicial do ponto (ninguém marcado) **e** o ponto for de embarque. Em desembarque, Próximo desabilitado (não pular criança na van). Concluir = `advanceToNextPoint` se `selectIsPointComplete`. Auto-avanço: após `markStudentStatus`, se o ponto ficou completo e não é o último, `advanceToNextPoint`.

6. **Anterior**  
   Novo reducer `goToPreviousPoint` (index > 0). Não apaga status.

7. **Resumo / mapa**  
   Resolver veículo: se todos os alunos da rota compartilham `vehicleId`, usar esse; senão o mais frequente. `BusSeatMap` ganha `studentsById`, `executionStatusByStudentId` opcionais. Cadastro continua sem esses props.

8. **Contato**  
   Primeiro `contactPhones[0]`: `Linking.openURL('tel:...')`. Ícone de WhatsApp abre `https://wa.me/55...` se o número tiver 10+ dígitos.

9. **Corrigir para Pendente**  
   `markStudentStatus` aceita voltar para `PENDING` a partir de PRESENT/ABSENT (não de DROPPED_OFF se isso recolocaria na van sem embarque — permitir PENDING a partir de ABSENT/PRESENT; DROPPED_OFF → PRESENT só se o motorista recolocar na van). Simplificar: Resumo pode setar PENDING, PRESENT, ABSENT; DROPPED_OFF só no fluxo de desembarque da tab Execução.

## Risks / Trade-offs

- [Próximo no desembarque] → desabilitado de propósito para não furar a regra anti-esquecimento.
- [Vários veículos na mesma rota] → mapa usa o veículo majoritário; alunos de outro veículo não aparecem na planta.
- [Feather sem bandeira xadrez] → duas cores de `flag` (azul vs brand/preto).

## Migration Plan

Só UI + 1 reducer. Sem version persist. Rollback = revert. Sessão antiga reabre na tela nova.

## Open Questions

Nenhuma que bloqueie o apply.
