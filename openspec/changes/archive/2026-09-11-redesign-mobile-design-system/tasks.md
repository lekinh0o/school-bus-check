## 1. Tokens

- [x] 1.1 Estender `tailwind.config.js` e alinhar `constants/Colors.ts` aos tokens semânticos (primary*, success, warning, danger, surfaces, textos, border, disabled)
- [x] 1.2 Documentar escala 4–40 e raios de card/botão nas classes reutilizadas; sem nova lib de UI

## 2. Início e Cadastros (primeira passagem)

- [x] 2.1 Header do Início (título, data, período); sino sem store (alerta vazio)
- [x] 2.2 Cards de rota: escola, janelas, CTAs Ida/Volta independentes via `StartRouteSheet`; destaque de pendência com os selectors atuais
- [x] 2.3 Histórico recente continua em `HistoryTripCard`
- [x] 2.4 Cadastros: cards com ícone, descrição, contador real, mesma navegação

## 3. Execução, Resumo e Histórico (primeira passagem)

- [x] 3.1 Aplicar tokens em `ExecutionHeroCard`, lista de alunos, `ExecutionBottomBar`, aba Resumo/`BusSeatMap` **sem** alterar `lib/geo.ts`, hook de GPS, `openNavigation` nem reducers
- [x] 3.2 `app/history/index.tsx` e `app/history/[id].tsx` + `HistoryTripCard` no mesmo visual
- [x] 3.3 `npx tsc --noEmit`; `npm run test:geo` (não deve mudar); conferir scripts de lint/build se existirem

## 4. Correção visual (mockups)

- [x] 4.1 Incluir tokens de poços pastel (veículo, escola, rota, aluno) e superfície branca; verificar no `tailwind.config.js` / `Colors.ts` que Cadastros não precisa de fill `primary-light` no card inteiro
- [x] 4.2 Recompor Cadastros em grid 2×2: card branco, poço pastel, título escuro, hint cinza, pílula/faixa mint com contador + seta; manter modal de veículos e rotas atuais; conferir visual vs mockup de Cadastros
- [x] 4.3 Recompor Início: data por extenso + turno numa linha; sino e alerta circulares; banner de pendência compacto (mesmo `openSheet` de justificar); card de rota sem timeline, CTAs Ida/Volta verdes lado a lado e horários abaixo; histórico recente compacto; `Ver` leva ao Histórico existente
- [x] 4.4 Restilar tab bar existente (Início + Cadastros): fundo claro, labels, ativo verde; MUST NOT criar tabs Histórico/Config
- [x] 4.5 Alinhar Execução/Resumo à composição do mockup (header claro, abas, hero mint, métricas, card de aluno, resumo com mapa/lista/ações) **somente** em JSX/classes; verificar que `lib/geo.ts`, `useExecutionLocation`, `openNavigation` e reducers não foram alterados
- [x] 4.6 Compactar Histórico (lista e detalhe) na mesma família dos cards brancos do Início; dados inalterados
- [x] 4.7 `npx tsc --noEmit`; `npm run test:geo`; usar só scripts existentes em `package.json` para lint/build se houver
