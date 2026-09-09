## 1. Git

- [x] 1.1 Em `main` atualizado, criar ou usar `fix/ui-execucao-rota-completa`; verificar `git branch --show-current`

## 2. Partida

- [x] 2.1 Lista de rotas no Início + bottom sheet (IDA/VOLTA, Iniciar Trajeto despacha `startRouteExecution` e navega); verificar que tocar a rota não cria sessão
- [x] 2.2 Cadastros Executar abre o mesmo sheet; verificar que não entra mais em `execute/[id]` só com sentido local

## 3. Tela de execução

- [x] 3.1 Tabs Execução / Resumo e cabeçalho fixo (presentes, ausentes, pulados + timeline por sentido); verificar que o scroll da lista não leva o cabeçalho embora
- [x] 3.2 Lista do ponto: foto `w-16 h-16`, Presente/Ausente (rótulos embarque/desembarque), contato, Anterior / Concluir / Próximo, auto-avanço; verificar Concluir desabilitado com pendente, Próximo só com zero marcações no embarque, e Próximo desabilitado no desembarque
- [x] 3.3 Tab Resumo: `BusSeatMap` com foto e borda amarela se `ABSENT`, lista geral para corrigir status e contato; verificar falta no mapa e correção refletida na tab Execução
- [x] 3.4 `npx tsc --noEmit`; verificar exit 0
