## Why

A primeira passagem da #22 consolidou tokens, mas a apresentação ainda não reproduz os mockups aprovados: Cadastros usa cards verdes saturados, o Início não segue a hierarquia dos prints, e a Execução ainda parece um cockpit paralelo. Os mockups são a fonte de verdade visual; a implementação atual e o Design System genérico ficam abaixo disso.

## What Changes

- Trata os mockups de Início, Cadastros e Execução/Resumo como contrato de **composição** (ordem, cards, faixas, CTAs). Paleta do Início no print azul/amarelo MUST NOT ser copiada: CTAs e tab ativa usam a família **verde institucional** de Cadastros/Execução.
- Corrige Cadastros para card branco, ícone em poço pastel distinto por entidade, título escuro, descrição cinza e contador em faixa/pílula mint com seta — MUST NOT preencher o card com verde de marca.
- Realinha Início (header + sino/alerta, banner de pendência compacto, card de rota sem timeline, Ida/Volta lado a lado, histórico recente em linhas) e Execução/Resumo (header claro, abas, hero mint, timeline de paradas, métricas, aluno, ações) sem reabrir #17/#19.
- Tabs extras do mockup (Histórico, Configurações) MUST NOT virar rotas fictícias: Histórico já existe no stack; Config não existe. A barra real permanece Início + Cadastros, com o visual da família (branco, ícone + label, ativo em verde).
- Sem alteração de Redux, persistência, presença, GPS, geofence, Maps/Waze ou `StartRouteSheet` como única porta de start.

## Capabilities

### New Capabilities

- `mobile-design-system`: tokens, tipografia, espaçamento e linguagem visual das superfícies operacionais, com Cadastros no padrão mockup (branco + pastel + faixa).

### Modified Capabilities

- `route-execution`: composição do Início e da Execução/Resumo conforme mockups, sem mudar GPS, geofence, Maps/Waze, travas ou marcação.
- `execution-history`: lista, detalhe e recorte do Início na mesma família visual (linhas compactas no recorte recente).

## Impact

- UI: `app/(tabs)/index.tsx`, `app/(tabs)/cadastros.tsx`, `app/(tabs)/_layout.tsx` (estilo da tab bar, sem destinos novos), `app/routes/execute/[id].tsx`, `app/history/index.tsx`, `app/history/[id].tsx`.
- Tokens: `tailwind.config.js`, `constants/Colors.ts` — poços pastel e superfícies; primária verde única.
- Componentes existentes restilizados; #19 só JSX/classes (`ExecutionHeroCard`, bottom bar, timeline, mapa). Sem duplicar cockpit.
