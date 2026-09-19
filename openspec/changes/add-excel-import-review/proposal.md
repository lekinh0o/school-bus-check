## Why

O preview atual informa erros do Excel, mas não permite corrigi-los sem voltar à planilha e também confirma silenciosamente apenas as linhas válidas. Importações com muitos alunos podem exigir várias sessões de trabalho; a central precisa preservar o original, retomar correções com segurança, revalidar o resultado e deixar explícito o que será persistido.

## What Changes

- Introduzir um único rascunho ativo de revisão, salvo no armazenamento privado do aplicativo e retomável após fechar ou reiniciar.
- Preservar uma cópia imutável do Excel original e salvar separadamente somente metadados, correções e decisões; o plano derivado será reconstruído e revalidado ao retomar.
- Ao iniciar outra importação com rascunho existente, exigir escolha explícita entre retomar e descartar; concluir ou descartar remove os arquivos locais.
- Separar operação planejada (`novo`/`atualização`), resultado de validação, decisão de inclusão e indicador de correção, permitindo que uma linha corrigida continue inválida.
- Manter os valores originais imutáveis e registrar correções por linha e campo, incluindo referência interna escolhida, valor apresentado e motivo da alteração.
- Permitir editar somente campos do contrato Excel e resolver escola, rota, veículo e ponto de embarque com entidades existentes, sem alterar o cadastro mestre durante a revisão.
- Revalidar o plano completo após cada correção para atualizar linhas dependentes, conflitos e totais.
- Permitir ignorar registros somente por ação explícita e manter os ignorados visíveis no resumo.
- Exigir uma decisão explícita quando restarem registros impeditivos: continuar corrigindo ou importar apenas os registros aptos; a importação completa permanece bloqueada.
- Exibir revisão por status, busca, detalhe do problema, formulário de correção, feedback da revalidação e resumo final calculado.
- Não incluir criação de dependências no meio do fluxo, correções em lote, sugestões aproximadas automáticas, histórico persistido de importações ou o restante do wizard da issue #31.

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `cadastro-excel`: ampliar o preview para revisão retomável, correção auditável, revalidação, exclusão explícita e confirmação sem descarte silencioso de registros inválidos.

## Impact

- Evolução dos tipos e serviços puros em `lib/excel/` para representar fonte imutável, correções, decisões, replanejamento e ciclo de vida do rascunho.
- Armazenamento do arquivo-fonte e do journal em `expo-file-system` no diretório privado de documentos; o plano grande não será incluído no `redux-persist`/AsyncStorage.
- Substituição do preview textual de `components/CadastroExcelPanel.tsx` por uma central de revisão integrada ao fluxo de Cadastros.
- Reutilização dos selectors atuais de escolas, rotas, veículos e alunos; nenhuma entidade ou slice de cadastro é alterado antes da confirmação.
- Novos testes unitários do plano corrigível, persistência/retomada do rascunho e testes de interação da revisão; sem backend, nova dependência de planilha ou migração dos cadastros persistidos.
