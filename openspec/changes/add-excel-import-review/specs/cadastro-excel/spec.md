## ADDED Requirements

### Requirement: Rascunho retomável de revisão
Após analisar um arquivo, o sistema SHALL manter no armazenamento privado do aplicativo um único rascunho ativo com uma cópia imutável do Excel original, metadados, correções e decisões do usuário. O plano derivado MUST ser reconstruído e revalidado contra os cadastros atuais ao retomar, e MUST NOT ser aceito como válido apenas por ter sido calculado anteriormente. Fechar o fluxo ou reiniciar o aplicativo MUST preservar o rascunho. Concluir a importação ou escolher explicitamente descartá-la SHALL remover seus arquivos locais sem alterar outros cadastros.

#### Scenario: Retomar após reiniciar
- **WHEN** o aplicativo é encerrado durante uma revisão e aberto novamente
- **THEN** o usuário pode retomar o arquivo, as correções e as decisões salvas

#### Scenario: Revalidar ao retomar
- **WHEN** o usuário retoma um rascunho depois que os cadastros mestres mudaram
- **THEN** o sistema reprocessa o original e as correções, atualiza problemas e totais e não aplica o plano antigo

#### Scenario: Selecionar outro arquivo com rascunho existente
- **WHEN** existe um rascunho ativo e o usuário tenta iniciar outra importação
- **THEN** o sistema exige escolher entre retomar o rascunho ou descartá-lo antes de aceitar outro arquivo

#### Scenario: Descartar rascunho
- **WHEN** o usuário confirma Descartar importação
- **THEN** original, correções e decisões locais são removidos e nenhum cadastro mestre é alterado

#### Scenario: Falha ao salvar o progresso
- **WHEN** uma correção ou decisão não pode ser salva no armazenamento local
- **THEN** o sistema informa que a alteração ainda não está protegida para retomada e MUST NOT indicar salvamento concluído

### Requirement: Estado multidimensional da linha
Cada linha revisável SHALL representar separadamente: a operação planejada (`novo`, `atualização` ou nenhuma), o resultado de validação (`válido`, `atenção`, `erro` ou `conflito`), a decisão do usuário (`incluir` ou `ignorar`) e a existência de correções. O indicador de correção MUST NOT substituir o resultado de validação, e os totais do plano SHALL ser derivados dessas dimensões.

#### Scenario: Correção permanece inválida
- **WHEN** o usuário altera um campo mas a linha continua com outro erro impeditivo após revalidar
- **THEN** a linha aparece como corrigida e continua marcada como erro

#### Scenario: Linha nova corrigida
- **WHEN** uma linha de novo cadastro recebe uma correção válida
- **THEN** ela continua classificada como novo cadastro e também aparece como corrigida

### Requirement: Correção auditável sem alterar o Excel
O sistema SHALL permitir corrigir somente campos definidos no contrato da entidade importada. Cada correção MUST manter na sessão a entidade, a linha original, o campo, o valor original, o valor efetivo e a origem da decisão (`edição manual`, `referência selecionada` ou `sugestão aceita`). O arquivo Excel original MUST NOT ser sobrescrito.

#### Scenario: Corrigir telefone inválido
- **WHEN** o usuário substitui um telefone inválido e salva a correção
- **THEN** a sessão mantém o telefone original e o corrigido, e usa o corrigido na revalidação

#### Scenario: Tentar corrigir campo fora do contrato
- **WHEN** a interface apresenta os campos editáveis de uma linha
- **THEN** ela MUST NOT oferecer foto, ID interno ou outro campo ausente do contrato Excel da entidade

### Requirement: Resolução explícita de relacionamentos
Para escola, rota, veículo e ponto de embarque, a central SHALL permitir selecionar uma opção existente e compatível no estado atual do aplicativo. A sessão MUST guardar a referência interna selecionada e seu rótulo de auditoria sem expor o ID no contrato visual do Excel. Selecionar uma referência MUST NOT atualizar nem criar o cadastro mestre antes da confirmação. A central MUST NOT criar uma dependência ausente silenciosamente.

#### Scenario: Selecionar escola existente
- **WHEN** um aluno referencia uma escola não encontrada e o usuário seleciona uma escola existente
- **THEN** a correção guarda a escola escolhida no plano e nenhum cadastro é alterado antes da confirmação

#### Scenario: Nomes de escola duplicados
- **WHEN** existem escolas com o mesmo nome e o usuário escolhe uma delas na central
- **THEN** a referência interna escolhida desambigua o vínculo sem inserir o ID interno no Excel

#### Scenario: Dependência não existe
- **WHEN** não existe escola, rota ou veículo compatível para selecionar
- **THEN** a linha permanece impeditiva e a central MUST NOT criar a dependência automaticamente

### Requirement: Revalidação integral após correção
Salvar, remover ou substituir uma correção SHALL revalidar o plano completo contra os cadastros atuais, preservando a ordem de dependência veículos, escolas, rotas e alunos. O sistema MUST recalcular problemas, operações e totais; salvar uma correção MUST NOT tornar a linha válida sem executar a validação. Linhas dependentes SHALL refletir os efeitos da correção.

#### Scenario: Correção resolve linhas dependentes
- **WHEN** uma correção válida em uma rota resolve a referência usada por alunos do mesmo arquivo
- **THEN** a revalidação atualiza a rota, os alunos dependentes e os totais do plano

#### Scenario: Correção cria duplicidade
- **WHEN** uma matrícula é corrigida para um valor já usado por outra linha ou cadastro
- **THEN** a revalidação marca o conflito e impede a persistência dessas linhas

#### Scenario: Correção ainda inválida
- **WHEN** o valor salvo não atende ao contrato do campo
- **THEN** a revalidação mantém a linha com problema e informa o erro resultante

### Requirement: Exclusão explícita de registros
O usuário SHALL poder marcar uma linha como ignorada mediante ação explícita. A central MUST identificar que a linha não será importada, permitir desfazer a decisão e incluir os ignorados nos filtros e no resumo final. Ignorar uma linha MUST provocar revalidação das linhas que dependem dela.

#### Scenario: Ignorar registro
- **WHEN** o usuário confirma a ação de ignorar uma linha
- **THEN** a linha deixa de ser candidata à persistência e aparece no total de ignorados

#### Scenario: Desfazer ignorar
- **WHEN** o usuário restaura uma linha ignorada
- **THEN** a linha volta ao plano e é revalidada antes de poder ser incluída

### Requirement: Fluxo de revisão em etapas
A revisão SHALL distinguir as etapas Análise, Revisão e Confirmação e indicar a etapa atual. A Análise SHALL apresentar arquivo, abas encontradas e totais derivados do plano; a Revisão SHALL concentrar busca, filtros, problemas e correções; a Confirmação SHALL apresentar exatamente os registros aptos, novos, atualizações, ignorados e problemas restantes. Voltar entre as etapas MUST preservar o rascunho e MUST NOT alterar os cadastros mestres.

#### Scenario: Avançar da análise
- **WHEN** a análise do arquivo termina
- **THEN** o sistema apresenta os totais reais e permite abrir a revisão dos registros

#### Scenario: Voltar da confirmação
- **WHEN** o usuário volta da confirmação para a revisão
- **THEN** correções, decisões, filtros relevantes e totais do rascunho permanecem disponíveis

#### Scenario: Correção revalidada com sucesso
- **WHEN** o usuário salva uma correção e a linha fica apta após a revalidação
- **THEN** o sistema confirma que a alteração foi aplicada ao rascunho e oferece Corrigir próximo ou Voltar para revisão

#### Scenario: Correção mantém problema
- **WHEN** o usuário salva uma correção e a linha continua impeditiva após a revalidação
- **THEN** o sistema apresenta os problemas restantes e MUST NOT exibir a linha como corrigida com sucesso

### Requirement: Central de revisão navegável
A central SHALL listar registros das quatro entidades com identificação da entidade, linha original, operação, validação, indicador de correção e problemas associados. Ela SHALL oferecer busca, filtros para problemas, aptos, ignorados e todos, ação para abrir a correção e resumo calculado do plano. Estados sem resultado, listas extensas, Safe Area, contraste e ações acessíveis MUST ser tratados sem esconder problemas.

#### Scenario: Filtrar problemas
- **WHEN** o usuário seleciona o filtro de problemas
- **THEN** a central mostra somente linhas com erro, conflito ou atenção e preserva a linha original e a descrição do problema

#### Scenario: Buscar registro
- **WHEN** o usuário pesquisa por nome ou identificador visível
- **THEN** a lista mostra as linhas correspondentes dentro do filtro selecionado

#### Scenario: Abrir correção
- **WHEN** o usuário aciona Corrigir em uma linha
- **THEN** a interface apresenta os valores originais, os valores efetivos, os problemas atuais e somente os campos editáveis daquela entidade

#### Scenario: Ações da revisão
- **WHEN** o usuário está na lista de revisão
- **THEN** o sistema mantém visíveis as ações de revalidar o plano e, quando permitido, importar somente os registros aptos com sua quantidade real

## MODIFIED Requirements

### Requirement: Preview antes de persistir
Antes de qualquer persistência definitiva nos cadastros mestres, o sistema SHALL produzir um plano com: abas encontradas; quantidade de linhas por entidade; aptas; inválidas; novos; atualizações; duplicidades/conflitos; referências não encontradas; corrigidas; ignoradas; e problemas por linha com entidade/aba e campo quando possível. Salvar o rascunho de revisão MUST NOT aplicar inclusões, atualizações ou vínculos aos cadastros. Sair para continuar depois MUST preservar o rascunho e deixar os cadastros iguais aos de antes da importação. Se restarem problemas impeditivos, a confirmação completa MUST permanecer bloqueada; importar somente as linhas aptas e incluídas SHALL exigir uma escolha explícita que informe exatamente quantas linhas serão importadas e ignoradas.

#### Scenario: Preview com erros
- **WHEN** 127 linhas de alunos têm 125 aptas e 2 com erro impeditivo
- **THEN** o preview mostra esses totais, bloqueia a importação completa e oferece explicitamente importar somente as 125 aptas, informando que 2 ficarão de fora

#### Scenario: Preview sem erros
- **WHEN** todas as linhas incluídas estão aptas após a revalidação
- **THEN** o sistema permite confirmar a importação completa

#### Scenario: Sair e continuar depois
- **WHEN** o usuário vê o preview ou corrige registros e escolhe sair sem descartar
- **THEN** nenhum cadastro muda e o rascunho permanece disponível para retomada

#### Scenario: Cancelar
- **WHEN** o usuário vê o preview ou corrige registros e confirma o descarte da importação
- **THEN** nenhum cadastro muda e o rascunho é removido

### Requirement: Persistência confirmada
Após confirmação, o sistema SHALL revalidar o plano contra o estado atual e persistir somente linhas aptas cuja decisão seja incluir, na ordem: veículos, escolas, rotas, alunos. IDs internos MUST ser gerados no cliente para registros novos, como no cadastro manual. O `Student` legado de chamada MUST NOT ser alterado por esta importação. Se a revalidação final introduzir um problema impeditivo, o sistema MUST retornar à revisão com os novos totais e MUST NOT executar persistência parcial silenciosa.

#### Scenario: Confirmar mistos
- **WHEN** o plano confirmado tem veículos novos e alunos aptos e incluídos
- **THEN** os veículos novos existem antes dos alunos serem gravados, e os alunos ficam persistidos com vínculos internos corretos

#### Scenario: Importar apenas aptos
- **WHEN** existem linhas impeditivas ou ignoradas e o usuário escolhe explicitamente importar somente os registros aptos
- **THEN** apenas linhas aptas e incluídas são persistidas e o resultado identifica as linhas que ficaram de fora

#### Scenario: Cadastro muda durante a revisão
- **WHEN** o estado mestre muda e torna inválida uma linha depois do último preview
- **THEN** a confirmação revalida o plano, não persiste nenhuma linha naquela tentativa e retorna à revisão com o conflito atualizado

#### Scenario: Importação concluída remove rascunho
- **WHEN** todas as operações confirmadas terminam com sucesso
- **THEN** o sistema apresenta o resultado e remove o rascunho ativo
