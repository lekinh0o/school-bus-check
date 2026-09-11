## Context

Ver proposta. Primeira passagem da #22 já aplicou tokens (`primary` → `#0F6B4D`) e CTAs Ida/Volta via `StartRouteSheet`. Cadastros ainda usa `bg-primary-light` + `border-primary` no card inteiro. Início ainda empilha timeline no card e um botão verde grande de pendência. Execução ainda usa hero escuro da #19. Tabs reais: só Início e Cadastros; Histórico é stack `/history`; não há Configurações. Mockups de Cadastros e Execução/Resumo são a família verde; o print de Início traz estrutura válida mas paleta azul — decisão confirmada: estrutura do print, verde institucional nos CTAs e no ativo da tab.

## Goals / Non-Goals

**Goals:**

- Reproduzir composição dos três mockups (Início, Cadastros, Execução/Resumo) com primária verde única.
- Cadastros: card branco + poço pastel + faixa/pílula de contador.
- Execução: hierarquia do mockup (header claro, abas, hero mint, chips, aluno) só em classes/JSX; lógica #19 intacta.
- Tokens pastel e superfícies; sombras leves; sem segundo tema.

**Non-Goals:**

- Recriar GPS, Haversine, geofence, Maps/Waze, reducers, persist.
- Quatro abas do mockup com destinos inventados (Rotas/Histórico/Config como tabs se a rota não existir).
- Copiar Ida amarela / Volta azul / tab azul do print de Início.
- Paper, Tamagui, módulo de notificações.

## Decisions

1. **Mockup = composição; Cadastros/Execução = paleta.** Início usa data+turno numa linha, banner rosa/aviso para pendência, card de rota com poço + status + dois CTAs + horários abaixo. CTAs: verde primário / variante verde (outline ou `primary-dark`), ícones sol/lua se couberem sem nova lib. Alternativa (copiar azul do print) rejeitada: quebraria a família.

2. **Cadastros não usa fill da primária no card.** Fundo `surface` branco; poços `pastel-vehicle|school|route|student`; contador em pílula mint full-width no rodapé do card. Navegação atual (modal veículos, `/schools`, `/routes`, `/students`) inalterada.

3. **Início: sem `RouteTimeline` no card.** Timeline permanece na execução e no cadastro de rota. Histórico recente: um agrupamento visual (um card com linhas ou linhas no mesmo ritmo), não o card alto atual; `HistoryTripCard` pode ser compactado ou um variante, sem segundo dado.

4. **Hero da execução pode deixar de ser escuro.** O mockup é header branco + card mint. Distância, geofence, Maps/Waze, som e travas ficam; só a casca muda. Alternativa (manter hero escuro “porque #19”) rejeitada para esta correção visual.

5. **Tab bar:** estilizar a existente (branco, labels, ativo verde). MUST NOT adicionar tabs Histórico/Config. Documentar o gap vs mockup nas limitações da entrega.

6. **Pendência:** banner compacto toca o mesmo `openSheet(route, 'IDA', true)`. Sem slice novo.

7. **Sino + ícone de alerta:** dois controles circulares no header. Sino continua `AppAlert` vazio. O alerta MAY só reforçar visualmente pendência já calculada (sem store). Sem persistência.

8. **Não extrair Button genérico** salvo o mesmo padrão em três telas. Preferir classes. Poços pastel: tokens, não hex soltos nas telas.

## Risks / Trade-offs

- [Quebrar #19 ao clarear o hero] → Diff só em `ExecutionHeroCard` / tela execute; proibir `lib/geo.ts` / `useExecutionLocation` / `openNavigation` / reducers.
- [Timeline horizontal do mockup vs `SnakePathTimeline` atual] → Preferir restyle da timeline existente para leitura horizontal se couber sem reescrever dados; se o componente não permitir, aproximar visualmente sem mudar ordem das paradas.
- [Tab bar de 2 vs mockup de 4] → Aceito; não inventar Config.
- [Contraste Ida/Volta ambos verdes] → Usar preenchido vs outline/variante, não azul.

## Migration Plan

1. Já na branch `feat/redesign-mobile-design-system`.
2. Tokens pastel → Cadastros → Início → Execução/Resumo → Histórico → estilo da tab bar.
3. Sem migration de persistência.

## Open Questions

Nenhuma: paleta do Início (verde, não azul) e tab bar sem destinos fictícios estão decididas.
