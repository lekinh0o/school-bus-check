## Context

Ver `proposal.md` para a motivação e `specs/cadastro-excel/spec.md` para o comportamento. O motor atual recebe um buffer, parseia linhas canônicas em `workbook.ts`, classifica cada linha em um único `RowStatus` em `plan.ts` e devolve payloads prontos para `apply.ts`. A UI conserva apenas o `ImportPlan`; valores originais e células canônicas deixam de estar disponíveis, e `applyImportPlan` retorna `void`.

O estado mestre permanece nos slices RTK existentes e é persistido por `redux-persist` sobre AsyncStorage. Um rascunho com milhares de linhas não deve entrar nessa raiz: no Android, AsyncStorage possui limite padrão total de 6 MB e limite aproximado de 2 MB por entrada, além do custo de serializar o estado. `expo-file-system` já está instalado e `Paths.document` fornece armazenamento privado durável até exclusão explícita ou desinstalação. Os testes do motor usam `node:test` via `tsx`; ainda não existe infraestrutura de teste de componentes React Native.

O produto forneceu uma referência conceitual composta por dez telas para o fluxo Excel. Ela orienta hierarquia, densidade, estados semânticos e ações, mas não é uma especificação pixel a pixel. Esta change usa apenas os estados de análise, revisão, correção, feedback da correção e confirmação; entrada completa, progresso, conclusão, detalhes e histórico permanecem no restante da issue #31.

## Goals / Non-Goals

**Goals:**

- Tornar o pipeline fonte → correções → plano determinístico, puro e testável.
- Preservar fonte e auditoria sem manter ou reescrever o arquivo binário.
- Resolver referências selecionadas pelo usuário de forma inequívoca, inclusive quando rótulos se repetem.
- Revalidar dependências e impedir qualquer dispatch quando a validação final falhar.
- Retomar com segurança uma revisão longa sem persistir um plano derivado obsoleto.
- Manter o plano carregado somente durante o fluxo e usar listas virtualizadas em arquivos grandes.

**Non-Goals:**

- Manter vários rascunhos simultâneos.
- Retomar automaticamente uma persistência que já tenha começado.
- Alterar o cadastro mestre ao editar o preview.
- Oferecer criação de escola, rota, veículo ou ponto durante a revisão.
- Implementar fuzzy matching, correção em lote, histórico de importações ou progresso de persistência.
- Substituir o contrato ou a biblioteca XLSX existente.

## Decisions

### 1. Repositório de rascunho em arquivos privados

Haverá no máximo um rascunho em `Paths.document/import-review/active/`:

```text
source.xlsx
manifest.json
journal.json
```

`source.xlsx` será uma cópia imutável dos bytes selecionados. Preservar o XLSX compactado ocupa menos disco do que materializar todas as linhas em JSON e mantém a fonte exata. `manifest.json` terá versão do formato, nome/tamanho do arquivo, datas e estado do rascunho. Somente caminhos relativos serão conhecidos; URIs absolutas serão reconstruídas a partir de `Paths.document`.

`journal.json` terá apenas:

```text
corrections Record<RowKey, Record<FieldKey, Correction>>
decisions   Record<RowKey, include | ignore>
```

`RowKey` combinará entidade e linha original (`students:17`), que é estável no arquivo imutável. Objetos e arrays simples serão usados no lugar de `Map`/`Set` para manter o journal serializável.

Ao abrir ou retomar, a aplicação lerá `source.xlsx`, gerará a fonte canônica em memória, aplicará o journal e construirá um plano atual. Fonte parseada e plano não serão persistidos. Cada correção/decisão confirmada entrará numa fila de escrita do journal; a escrita usará arquivo temporário e substituição do final para não deixar JSON truncado. O estado só mostrará “salvo” depois da conclusão. O app tentará esvaziar a fila ao ir para background.

Ao concluir ou descartar, o diretório `active` será removido. Ao selecionar um novo arquivo com diretório ativo, a UI exigirá retomar ou descartar antes de criar outro. Manifesto com versão incompatível ou arquivo ausente será apresentado como rascunho não recuperável, com ação explícita para limpar e reimportar.

Alternativas rejeitadas:

- Mutar o workbook: perde a auditoria e torna desfazer ambíguo.
- Persistir fonte/plano no Redux/AsyncStorage: esbarra em limites, reserializa dados grandes e pode restaurar plano obsoleto.
- Persistir a fonte canônica como JSON: ocupa mais disco e exige migração do conteúdo parseado.
- Guardar somente o plano atual: payloads derivados não permitem reeditar nem revalidar corretamente.
- Vários rascunhos: aumentam seleção, limpeza e risco de dados obsoletos sem atender ao fluxo inicial.

### 2. Separar classificação, validação e decisão

`PlannedRow.status` deixará de ser a única dimensão. A linha planejada terá, conceitualmente:

```text
operation   create | update | none
validation valid | warning | error | conflict
decision   include | ignore
corrected  boolean
issues     ImportIssue[]
```

`ImportIssue` representará código, severidade, campo e mensagem. Totais e filtros serão seletores derivados; nenhuma contagem será atualizada manualmente pela UI.

Para reduzir risco, `buildImportPlan(snapshot, buffer)` permanecerá como wrapper de compatibilidade para testes e chamadas existentes. O núcleo novo receberá a fonte canônica e o estado de revisão. `applyImportPlan` passará a aceitar somente o plano final multidimensional.

Alternativa rejeitada: adicionar `corrected` ao union atual. Isso continuaria impedindo combinações como “novo + corrigido + erro”.

### 3. Correção de valor e correção de referência são tipos distintos

Uma correção escalar guardará campo, valor original, valor efetivo e origem. Uma correção de relação guardará também `entityKind`, `entityId` e rótulo apresentado. IDs internos ficam apenas na sessão/plano; não viram células nem aparecem no arquivo.

O planner resolverá primeiro uma referência selecionada explicitamente e verificará se ela ainda existe e é compatível. Sem seleção, continuará aplicando as regras exatas atuais do Excel. Para pontos de embarque, a opção será limitada à rota efetiva da linha. Rotas serão limitadas à escola efetiva; assentos serão validados contra o veículo efetivo.

Uma entidade planejada no próprio arquivo continua sendo resolvida pelas regras do contrato. A seleção manual nesta change lista entidades já persistidas; ela não cria dependências nem fabrica IDs para linhas ainda não confirmadas.

Alternativa rejeitada: substituir a célula pelo nome escolhido. Nomes repetidos voltariam a produzir ambiguidade e perderiam a decisão explícita.

### 4. Toda alteração reconstrói o plano completo

Salvar/remover correção ou alternar `include`/`ignore` aplicará overlays à fonte e executará o planner completo na ordem veículos → escolas → rotas → alunos. Linhas ignoradas não participarão como futuras dependências; por isso ignorar também pode invalidar linhas posteriores.

O primeiro passo de confirmação reconstruirá novamente o plano com um snapshot atual da store. Somente se o modo solicitado for permitido ocorrerá `applyImportPlan`. Como validação e dispatch são síncronos no mesmo turno JavaScript, não haverá dispatch antes da decisão final; os próprios dispatches do apply continuam na ordem existente.

Para a primeira versão, revalidação será síncrona com estado visual de atividade. Listas usarão `FlatList`; otimização incremental ou worker fica adiada até existir medição que a justifique.

Alternativas rejeitadas:

- Revalidar apenas a linha editada: falha com duplicidades, ocupação de assento e referências entre abas.
- Considerar válido ao salvar: confunde edição com validação.

### 5. Confirmação tem modos explícitos

A central derivará dois comandos:

- `importAll`: habilitado somente quando todas as linhas incluídas estão aptas.
- `importEligible`: oferecido quando existem impeditivas ou ignoradas e exige confirmação com contagens.

Antes de qualquer apply, o comando produz um plano final novo. Se o resultado diferir de forma impeditiva, a sessão adota esse plano e volta à revisão sem dispatch. O apply devolverá um resumo com processadas, criadas, atualizadas e deixadas de fora para feedback imediato; esse resumo não será persistido como histórico.

Alternativa rejeitada: manter um botão genérico Confirmar que descarta inválidas silenciosamente.

### 6. UI dividida, sem lógica do planner nos componentes

`CadastroExcelPanel` continuará responsável por abrir picker/exportação e por consultar o repositório do rascunho ao montar. A revisão será extraída para componentes em `components/excel/`, com uma superfície de tela inteira:

- cabeçalho e resumo;
- filtros e busca;
- `FlatList` de registros;
- detalhe/correção da linha;
- seleção de referências a partir dos selectors atuais;
- revisão final e confirmação explícita.

Um hook/controlador local carregará o rascunho para memória e coordenará comandos puros, persistência do journal e estados `saving`/`saved`/`save_error`; componentes não editarão payloads de apply diretamente. A apresentação reutilizará `palette`, tokens NativeWind, Safe Area e padrões de botão/card existentes. Vermelho será reservado a impedimentos, âmbar a atenção/conflito, verde a aptos e azul a informação/revalidação.

Não será criado Context ou slice paralelo para entidades. A correção poderá ser uma tela interna ou modal sobre a central, desde que voltar preserve a sessão local.

### 7. Aplicação da referência visual

A superfície de revisão usará uma máquina de estados de apresentação sobre a mesma sessão:

```text
analysis -> review -> correction -> correction-feedback
               |                            |
               +----------------------------+
               |
               +-> confirmation
```

- **Análise do arquivo:** stepper `Análise / Revisão / Confirmação`, card do arquivo, abas detectadas e grade compacta com aptos, novos, atualizações e problemas. Todos os números vêm do plano.
- **Revisar importação:** filtros `Com problemas / Aptos / Ignorados / Todos`, busca, filtro adicional e cards que exibem entidade, linha original, problema e ação Corrigir. As ações de importar somente aptos e revalidar ficam acessíveis no rodapé.
- **Corrigir registro:** resumo da linha e do problema no topo, campos agrupados por entidade, valores originais/e efetivos e seletores compatíveis. Salvar fica no rodapé; nenhuma ação cria dependências.
- **Registro corrigido:** só aparece como sucesso quando a revalidação torna a linha apta; oferece Corrigir próximo e Voltar para revisão. Se restarem problemas, a tela permanece no contexto de correção e mostra o resultado real.
- **Confirmação:** repete os totais finais, diferencia novos, atualizações, ignorados e problemas, e apresenta a ação permitida pelo modo de confirmação.

A composição reutilizará `palette`, `cardShadow`, tokens NativeWind, tipografia e raios existentes. Verde representa apto/sucesso, âmbar representa atenção ou atualização, vermelho representa impedimento e azul representa informação/revalidação. Valores, entidades e contagens do mockup são apenas exemplos.

Adaptações obrigatórias:

- não mostrar “Cadastrar nova escola” ou criação equivalente;
- não marcar como opcionais campos obrigatórios do contrato da entidade;
- acrescentar ignorados, retomada e estado `saving`/`saved`/`save_error`, ausentes do conceito;
- usar `FlatList` e estados vazios em vez de limitar visualmente a quantidade de linhas;
- respeitar Safe Area, teclado, telas Android pequenas e navegação por gestos ou três botões;
- manter ações principais no rodapé sem cobrir conteúdo, usando scroll quando a altura útil for insuficiente;
- não implementar nesta change as telas conceituais de entrada completa, progresso, conclusão, detalhes ou histórico.

Alternativa rejeitada: reproduzir dimensões e conteúdo do mockup literalmente. Isso quebraria o contrato de campos, o Design System atual e a responsividade.

### 8. Estratégia de testes

Os serviços puros cobrirão criação da sessão, correção escalar, seleção por ID, remoção da correção, revalidação dependente, conflito, ignorar/desfazer e confirmação contra snapshot alterado usando o runner Node existente. O repositório de rascunho receberá uma interface de arquivos substituível para testar criação, escrita atômica, retomada, manifesto incompatível, limpeza e falha de escrita sem acessar APIs nativas. O controlador da central será mantido puro o bastante para testar transições sem renderizar React Native.

Como o projeto não possui runner de componentes, a integração visual será validada manualmente no Android para stepper, cards de análise, busca, filtros, abertura/fechamento, feedback válido e ainda inválido, retomada após reinício, teclado, Safe Area, lista extensa, rodapés e confirmação. A conferência comparará hierarquia e estados semânticos com a referência, sem exigir cópia pixel a pixel. Adicionar um runner React Native não será pré-requisito desta change.

## Risks / Trade-offs

- [Replanejar tudo pode ficar lento em arquivos grandes] → usar atividade real e lista virtualizada; medir antes de introduzir cache incremental.
- [Retomar exige reler XLSX e replanejar tudo] → mostrar etapa de revalidação e medir arquivos representativos; nunca bloquear a UI fingindo que o plano antigo é atual.
- [Disco cheio ou encerramento durante escrita pode perder o último journal] → escrita temporária + substituição, fila serial e estado visual de erro/não salvo.
- [O XLSX contém dados pessoais no diretório de documentos] → usar diretório privado, não compartilhar o rascunho e apagar em conclusão/descarte; não persistir URI absoluta.
- [Rascunho antigo pode ficar incompatível após atualização] → versionar manifesto e oferecer limpeza/reimportação, sem tentar aplicar formato desconhecido.
- [Uma entidade selecionada pode ser removida durante a revisão] → a revalidação final verifica o snapshot atual e retorna à central sem dispatch.
- [Refatorar `RowStatus` afeta planner, apply e testes existentes] → manter wrapper público temporário e migrar testes do motor antes da UI.
- [Linha identificada apenas por entidade + número depende da fonte imutável] → não reordenar nem remover a fonte; decisões de ignorar vivem em overlay.
- [Testes puros não detectam regressões de layout] → executar roteiro Android em tela pequena e documentar o resultado na implementação.

## Migration Plan

1. Introduzir fonte/sessão, novo modelo de linha e repositório versionado de rascunho mantendo o wrapper atual.
2. Migrar planner, apply e testes para o plano multidimensional.
3. Integrar retomada e central; substituir o modal textual somente quando o novo fluxo estiver coberto.
4. Não há migração de `redux-persist`; rascunhos usam arquivos separados e cadastros mantêm o mesmo formato.
5. Rollback restaura o painel anterior e remove com segurança o diretório de rascunho da versão conhecida. Se a remoção falhar, o código anterior simplesmente não lê esses arquivos.
