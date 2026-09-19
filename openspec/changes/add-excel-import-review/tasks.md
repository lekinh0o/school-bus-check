## 1. Modelo do plano corrigível

- [ ] 1.1 Evoluir `lib/excel/types.ts` para representar operação, validação, decisão, problemas, correções escalares/referenciais, valores originais/efetivos e totais derivados com dados serializáveis; verificar com `npx tsc --noEmit`
- [ ] 1.2 Expor em `lib/excel/workbook.ts` a fonte canônica parseada e a identidade estável entidade+linha, preservando `buildImportPlan(snapshot, buffer)` como entrada compatível; verificar com testes de uma aba, várias abas, linhas vazias e cabeçalhos inválidos
- [ ] 1.3 Refatorar o planner para receber fonte, correções e decisões, resolver primeiro referências internas explícitas e continuar usando matching exato quando não houver correção; verificar matrícula duplicada, nomes ambíguos, escola/rota/veículo/ponto selecionados e referência removida
- [ ] 1.4 Fazer linhas ignoradas deixarem de participar como cadastros planejados e recalcular dependentes e totais na ordem veículos → escolas → rotas → alunos; verificar com teste que ignorar e restaurar uma escola/rota altera corretamente as linhas dependentes
- [ ] 1.5 Criar comandos puros de sessão para salvar/remover correção, ignorar/restaurar linha e reconstruir todo o plano sem mutar a fonte; verificar correção válida, ainda inválida, conflito criado pela correção e desfazer

## 2. Rascunho retomável

- [ ] 2.1 Confirmar nas docs Expo SDK 57 o uso de `File`, `Directory` e `Paths.document`, então criar a interface do repositório de rascunho e a implementação nativa em `lib/excel/`; verificar criação de `source.xlsx`, `manifest.json` e `journal.json` no diretório privado
- [ ] 2.2 Implementar manifesto versionado com caminho relativo, metadados do arquivo e estado do rascunho, sem armazenar fonte ou plano no Redux/AsyncStorage; verificar por teste que manifesto e journal não contêm `ImportPlan` nem URI absoluta
- [ ] 2.3 Implementar fila serial de escrita atômica do journal por arquivo temporário e substituição, expondo `saving`, `saved` e `save_error`; verificar com repositório fake concorrência, falha de escrita, preservação do último JSON válido e nova tentativa
- [ ] 2.4 Implementar criar, detectar, carregar, revalidar, descartar e limpar o único rascunho ativo; verificar retomada após reinicialização simulada, manifesto incompatível, fonte ausente e remoção explícita
- [ ] 2.5 Integrar flush pendente ao envio do app para background sem indicar salvamento antes da conclusão; verificar transições de `AppState` com o controlador isolado e confirmar que falha permanece visível
- [ ] 2.6 Criar fixture representativa com milhares de alunos e medir tamanho em disco, tempo de abertura e revalidação em Android; registrar os valores no resumo da implementação e verificar que o journal cresce apenas com correções/decisões

## 3. Confirmação e persistência segura

- [ ] 3.1 Adaptar `applyImportPlan` ao plano multidimensional para persistir somente linhas aptas e incluídas na ordem existente e retornar resumo de criados, atualizados, importados e deixados de fora; verificar com testes dos quatro cadastros e vínculos de aluno
- [ ] 3.2 Implementar os comandos `importAll` e `importEligible` com contagens derivadas, bloqueando importação completa com impedimentos e exigindo escolha explícita para importar apenas aptos; verificar que nenhum dispatch ocorre antes da decisão
- [ ] 3.3 Revalidar com `store.getState()` imediatamente antes do apply e voltar à revisão se surgir conflito; verificar com teste que alteração de escola, veículo ou assento durante a revisão produz zero dispatch naquela tentativa
- [ ] 3.4 Remover o rascunho somente depois de todos os dispatches confirmados terminarem e preservá-lo quando a validação final ou o apply falhar; verificar sucesso, falha e nova retomada

## 4. Controlador e fluxo visual

- [ ] 4.1 Criar controlador/hook local para carregar o rascunho, coordenar `analysis`, `review`, `correction`, `correction-feedback` e `confirmation`, salvar o journal e expor seletores de totais/filtros; verificar as transições com testes puros sem renderizar React Native
- [ ] 4.2 Criar componentes reutilizáveis do stepper, cards de resumo, badges semânticos, estado de salvamento e rodapé de ações usando `palette`, `cardShadow` e tokens NativeWind existentes; verificar visualmente os quatro tons e estados desabilitados
- [ ] 4.3 Implementar a etapa Análise com dados reais do arquivo, abas e cards de aptos, novos, atualizações e problemas; verificar arquivo de uma aba, várias abas, aba ignorada e erro de cabeçalho
- [ ] 4.4 Implementar Revisão com `FlatList`, busca e filtros Com problemas/Aptos/Ignorados/Todos, exibindo entidade, linha, operação, validação, correções e problemas; verificar estado vazio, lista extensa e combinação de busca+filtro
- [ ] 4.5 Implementar o formulário de correção por entidade mostrando valores originais/efetivos e somente campos do contrato, reutilizando máscaras e validações existentes; verificar veículo, escola, rota e aluno sem expor IDs, fotos ou campos fora do Excel
- [ ] 4.6 Implementar seleção explícita de escola, rota, veículo e ponto com opções compatíveis do estado atual, sem ação de criar dependência; verificar nomes duplicados, rota filtrada pela escola, pontos da rota efetiva e referência removida antes de salvar
- [ ] 4.7 Implementar feedback pós-revalidação: sucesso apenas para linha apta, Corrigir próximo e Voltar para revisão, mantendo problemas restantes quando inválida; verificar ambos os resultados e persistência do journal
- [ ] 4.8 Implementar Confirmação com totais finais, importação completa ou apenas aptos, retorno à revisão e resultado imediato não persistido; verificar contagens reais de novos, atualizações, ignorados e impeditivos
- [ ] 4.9 Integrar a central ao `CadastroExcelPanel`, incluindo oferta para retomar/descartar rascunho existente e preservando o fluxo atual de exportação; verificar seleção de novo arquivo com rascunho ativo, sair para continuar depois e descarte confirmado

## 5. Responsividade, acessibilidade e qualidade

- [ ] 5.1 Ajustar Safe Area, teclado, scroll e rodapés para telas Android pequenas, gestos e navegação de três botões; verificar que ações e último campo permanecem acessíveis com teclado aberto
- [ ] 5.2 Conferir hierarquia, densidade, cards e cores contra o conceito visual da issue #31 sem copiar dimensões, textos ilustrativos ou campos opcionais incorretos; verificar manualmente Análise, Revisão, Correção, Feedback e Confirmação
- [ ] 5.3 Adicionar labels, roles, estados e áreas de toque acessíveis aos filtros, registros, seletores e ações; verificar navegação por leitor de tela e contraste sem usar somente cor para comunicar status
- [ ] 5.4 Ampliar os testes `lib/excel/*.test.ts` e o script `npm test` para cobrir sessão, journal, retomada, correções, ignore/desfazer, confirmação e regressões do motor existente; verificar `npm test`
- [ ] 5.5 Executar `npx tsc --noEmit`, `npm test` e `openspec validate add-excel-import-review --type change --strict`; corrigir todas as falhas e registrar comandos/resultados no fechamento da implementação
