## 1. Branch e blocos reutilizáveis

- [x] 1.1 Partir de `main` atualizado e criar `feat/evolucao-ui-ux-operacional`; confirmar com `git branch --show-current`
- [x] 1.2 `AppAlert` com tipos info / warning / error (ícone, fundo, dispensar); conferir os três visuais
- [x] 1.3 `SnakePathTimeline` (S, conectores, nós ≥ `h-12 w-12`); conferir com mais pontos do que uma linha
- [x] 1.4 Modal de foto (long press) e seletor de telefones (1 = WhatsApp; N = lista + WhatsApp/Ligar) em `lib/contactGuardian` + UI; conferir um vs vários números

## 2. Início e histórico

- [x] 2.1 Início: seção Rotas e seção Histórico recente (recorte) + Ver todos; `FlatList` sem lista única empilhada; conferir scroll
- [x] 2.2 Tela `app/history/index.tsx` com todas as viagens; tocar abre o detalhe existente; conferir Ver todos

## 3. Execução

- [x] 3.1 Tab Execução: hero da parada atual + `SnakePathTimeline` no lugar da faixa horizontal; conferir IDA e VOLTA
- [x] 3.2 Long press na foto, contato com seletor, concluir inválido dispara `AppAlert` ERRO; falta na ida usa tipo ALERTA; conferir fluxos na execução e no Resumo

## 4. Detalhe do histórico e checagem

- [x] 4.1 Detalhe da viagem: percurso em S além da auditoria; foto e contato iguais à execução; conferir uma viagem com vários pontos
- [x] 4.2 `npx tsc --noEmit` passa; Cadastros ainda usa a timeline horizontal compacta
