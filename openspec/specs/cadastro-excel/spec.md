# cadastro-excel Specification

## Purpose

Permite importar e exportar os cadastros de alunos, escolas, rotas e veículos em arquivos Excel (.xlsx), por entidade isolada ou no mesmo arquivo, com preview antes de persistir e vínculos resolvidos por identificadores de negócio — não por IDs internos do aplicativo.

## Requirements

### Requirement: Detecção de abas pelo contrato
O sistema SHALL identificar entidades pelo nome canônico da aba (`Alunos`, `Escolas`, `Rotas`, `Veículos`) e pelos cabeçalhos do contrato, não pela posição da aba. A ordem das abas MUST NOT alterar o resultado. Aba ausente MUST NOT ser tratada como erro. Aba com nome fora do contrato MUST ser ignorada. Aba conhecida cujo conjunto de cabeçalhos obrigatórios não casa com o contrato MUST gerar erro daquela aba, indicando a aba.

#### Scenario: Somente alunos
- **WHEN** o arquivo contém só a aba `Alunos` com cabeçalhos válidos
- **THEN** o sistema planeja importação somente de alunos

#### Scenario: Abas em ordem diferente
- **WHEN** o arquivo contém `Veículos` depois de `Alunos` e `Escolas` no meio
- **THEN** o sistema reconhece as três entidades e MUST NOT exigir uma ordem fixa

#### Scenario: Aba extra
- **WHEN** o arquivo contém `Alunos` e uma aba `Notas`
- **THEN** o sistema importa alunos (se o restante for válido) e ignora `Notas` sem falhar o arquivo inteiro

#### Scenario: Cabeçalho inválido
- **WHEN** existe aba `Alunos` sem as colunas obrigatórias do contrato
- **THEN** o sistema MUST NOT persistir alunos e MUST reportar erro associado à aba `Alunos`

### Requirement: Contrato da aba Veículos
A aba `Veículos` SHALL usar as colunas: Placa (obrigatória), Responsável (obrigatório), Quantidade de assentos (obrigatória, inteiro positivo). Placa MUST seguir o formato brasileiro já exigido no cadastro. O sistema MUST NOT exigir nem gravar no Excel o identificador interno, o mapa de assentos ou foto.

#### Scenario: Veículo válido
- **WHEN** a linha tem placa válida, responsável e quantidade de assentos positiva
- **THEN** a linha é aceita no planejamento

#### Scenario: Placa inválida
- **WHEN** a placa preenchida não casa com o formato antigo nem Mercosul
- **THEN** a linha é inválida e o erro indica aba, linha e campo Placa

### Requirement: Contrato da aba Escolas
A aba `Escolas` SHALL usar as colunas: Registro (opcional), Nome (obrigatório), Endereço (opcional), Responsável/Direção (opcional), Telefone (opcional), Latitude (opcional), Longitude (opcional). Telefone preenchido MUST ser telefone brasileiro válido. O sistema MUST NOT exigir IDs internos, listas de alunos/rotas nem foto.

#### Scenario: Escola só com nome
- **WHEN** a linha tem nome e os demais campos vazios
- **THEN** a linha é aceita e os vazios são omitidos no registro novo

#### Scenario: Telefone inválido
- **WHEN** o telefone está preenchido com menos de 10 dígitos
- **THEN** a linha é inválida e o erro indica o campo Telefone

### Requirement: Contrato da aba Rotas
A aba `Rotas` SHALL usar as colunas: Título (obrigatório), Escola (obrigatória, registro ou nome exato), Responsável, Monitor, Ponto de início, horários de início e término da ida e da volta em `HH:MM`, Período (`Manhã`, `Tarde` ou `Noite`), Tipo de operação (`Ida e Volta`, `Somente Ida` ou `Somente Volta`), Pontos de embarque (opcional: nomes na ordem, separados por `|`). O sistema MUST NOT exigir código interno de rota, foto nem coordenadas do ponto de início.

#### Scenario: Rota válida com pontos
- **WHEN** a linha tem os obrigatórios e `Ponto A | Ponto B` em Pontos de embarque
- **THEN** o planejamento inclui a rota com dois pontos nessa ordem

#### Scenario: Horário inválido
- **WHEN** qualquer horário não está em `HH:MM` válido
- **THEN** a linha é inválida e o erro indica o campo de horário

### Requirement: Contrato da aba Alunos
A aba `Alunos` SHALL usar as colunas: Carteirinha / Matrícula (opcional), Nome (obrigatório), Idade (opcional, inteiro positivo se preenchida), Responsável (opcional), Telefone 1 (opcional), Telefone 2 (opcional), Série (opcional), Escola (obrigatória), Rota (obrigatória), Ponto de embarque (obrigatório), Veículo (obrigatório, placa), Assento (obrigatório, inteiro positivo). Telefone preenchido MUST ser brasileiro válido. O sistema MUST NOT exigir ID interno nem foto.

#### Scenario: Aluno sem descritivos
- **WHEN** nome e vínculos estão preenchidos e idade, responsável, telefones, série e carteirinha estão vazios
- **THEN** a linha pode ser válida se as referências e o assento forem resolvíveis

#### Scenario: Idade zero
- **WHEN** idade preenchida é zero
- **THEN** a linha é inválida e o erro indica o campo Idade

### Requirement: Importação parcial sem alterar entidades ausentes
O sistema SHALL processar somente as entidades cujas abas reconhecidas estão no arquivo. A persistência confirmada MUST NOT criar, atualizar nem excluir registros de um tipo cuja aba não veio. Sincronizar vínculos estruturais do aluno importado (`studentIds` da escola, ocupação de assento no veículo) MUST ser permitido. Importar só alunos MUST NOT alterar campos de cadastro de escola, rota ou veículo, MUST NOT criar escola/rota/veículo ausentes e MUST NOT acrescentar ponto de embarque novo na rota.

#### Scenario: Só alunos
- **WHEN** o arquivo tem apenas `Alunos` e o usuário confirma linhas válidas
- **THEN** escolas, rotas e veículos já persistidos mantêm seus campos de cadastro; só alunos (e os vínculos de assento/`studentIds` desses alunos) mudam

#### Scenario: Alunos e rotas
- **WHEN** o arquivo tem `Alunos` e `Rotas` e não tem `Escolas` nem `Veículos`
- **THEN** o sistema planeja alunos e rotas e MUST NOT tratar a falta das outras abas como erro

### Requirement: Identificação sem IDs internos
O Excel MUST NOT exigir coluna de ID interno. Veículo MUST ser identificado pela placa normalizada. Escola MUST ser identificada por Registro quando preenchido; sem registro, por nome exato (após trim). Rota MUST ser identificada pelo par título exato + escola já resolvida. Aluno MUST ser identificado por Carteirinha / Matrícula quando preenchida. Matching aproximado (similaridade, acentos ignorados no valor, abreviação) MUST NOT criar vínculo. Comparação de chaves de texto MUST usar o valor normalizado do contrato (trim; placa pelas regras de placa; matrícula/registro com zeros à esquerda preservados como texto).

#### Scenario: Aluno aponta escola pelo registro
- **WHEN** a coluna Escola contém um registro que existe em uma única escola persistida ou já planejada no mesmo arquivo
- **THEN** o aluno fica vinculado a essa escola

#### Scenario: Aluno aponta escola pelo nome
- **WHEN** a coluna Escola contém o nome exato de uma única escola e não há registro na célula
- **THEN** o aluno fica vinculado a essa escola

#### Scenario: Nome ambíguo
- **WHEN** duas escolas persistidas têm o mesmo nome e a célula não traz um registro que desambiguie
- **THEN** a linha é conflito ou referência não resolvida e MUST NOT criar vínculo

### Requirement: Novo, existente, duplicidade e conflito
Com chave de negócio presente, match exatamente um registro existente ou já planejado MUST ser atualização; zero matches MUST ser registro novo; dois ou mais matches MUST ser conflito. Duas linhas do arquivo com a mesma chave de negócio MUST ser duplicidade/conflito e MUST NOT persistir essas linhas. Aluno sem carteirinha/matrícula MUST ser tratado como novo (MUST NOT casar por nome). Escola sem registro MUST casar por nome exato: um match = atualização, zero = novo, vários = conflito.

#### Scenario: Atualizar pela placa
- **WHEN** a placa da linha existe em um único veículo persistido
- **THEN** o preview classifica a linha como atualização daquele veículo

#### Scenario: Nova matrícula
- **WHEN** a carteirinha não existe em nenhum aluno persistido nem em outra linha do arquivo
- **THEN** o preview classifica a linha como novo aluno

#### Scenario: Duas linhas com a mesma placa
- **WHEN** duas linhas em `Veículos` têm a mesma placa normalizada
- **THEN** ambas são duplicidade/conflito e MUST NOT ser persistidas

#### Scenario: Aluno sem matrícula
- **WHEN** a carteirinha está vazia e o nome coincide com um aluno já persistido
- **THEN** o preview classifica a linha como novo (não atualiza o aluno existente por nome)

### Requirement: Célula vazia na atualização
Em linha classificada como atualização, célula vazia MUST deixar o campo persistido inalterado. Célula preenchida MUST aplicar o novo valor, se válido. Em linha nova, campo opcional vazio MUST ser omitido, não gravado como string vazia.

#### Scenario: Atualizar só o telefone da escola
- **WHEN** a escola casa pelo registro, o nome na planilha está vazio e o telefone está preenchido e válido
- **THEN** após confirmar, o telefone muda e o nome persistido permanece

#### Scenario: Novo com opcionais vazios
- **WHEN** uma escola nova tem só o nome
- **THEN** o registro persistido não guarda string vazia nos opcionais

### Requirement: Referências e ponto de embarque
Referência a escola, rota, veículo ou ponto de embarque que não resolver de forma única MUST aparecer no preview como referência não encontrada (ou conflito) e MUST NOT persistir essa linha. O ponto de embarque do aluno MUST coincidir com o nome de um ponto já existente na rota resolvida (persistida ou planejada na aba `Rotas` do mesmo arquivo). O sistema MUST NOT criar ponto novo na rota a partir da aba `Alunos`. Assento MUST estar livre ou já ser o assento daquele aluno em atualização; assento ocupado por outro aluno MUST ser erro. Assento maior que a quantidade de assentos do veículo resolvido MUST ser erro.

#### Scenario: Escola inexistente
- **WHEN** a aba `Alunos` cita uma escola que não existe no estado nem na aba `Escolas` do arquivo
- **THEN** a linha de aluno fica com referência não encontrada e não é persistida

#### Scenario: Ponto só no aluno
- **WHEN** o ponto informado não está em `boardingPoints` da rota resolvida
- **THEN** a linha é inválida por referência de ponto e a rota persistida não ganha ponto novo

#### Scenario: Assento ocupado
- **WHEN** o assento indicado já está ocupado por outro aluno
- **THEN** a linha é inválida e o erro indica o campo Assento

### Requirement: Preview antes de persistir
Antes de qualquer persistência definitiva, o sistema SHALL produzir um plano com: abas encontradas; quantidade de linhas por entidade; válidas; inválidas; novos; atualizações; duplicidades/conflitos; referências não encontradas; erros por linha com entidade/aba e campo quando possível. O sistema MUST NOT gravar o plano no estado persistido até o usuário confirmar. Cancelar MUST deixar os cadastros iguais aos de antes da importação.

#### Scenario: Preview com erros
- **WHEN** 127 linhas de alunos têm 125 válidas e 2 com erro de campo
- **THEN** o preview mostra esses totais; se o usuário confirmar, o sistema persiste somente as 125 válidas e MUST NOT persistir as 2 inválidas

#### Scenario: Cancelar
- **WHEN** o usuário vê o preview e cancela
- **THEN** nenhum cadastro muda

### Requirement: Persistência confirmada
Após confirmação, o sistema SHALL persistir somente linhas válidas do plano, na ordem: veículos, escolas, rotas, alunos. IDs internos MUST ser gerados no cliente para registros novos, como no cadastro manual. O `Student` legado de chamada MUST NOT ser alterado por esta importação.

#### Scenario: Confirmar mistos
- **WHEN** o plano tem veículos novos e alunos válidos e o usuário confirma
- **THEN** os veículos novos existem antes dos alunos serem gravados, e os alunos válidos ficam persistidos com vínculos internos corretos

### Requirement: Exportação compatível com importação
O sistema SHALL permitir exportar todos os quatro cadastros num único xlsx com as quatro abas, somente um tipo numa única aba, ou um subconjunto em várias abas. O arquivo exportado MUST usar os mesmos nomes de aba e colunas do contrato de importação. Foto e IDs internos MUST NOT aparecer como colunas do contrato. Exportar MUST NOT alterar o estado persistido.

#### Scenario: Exportar só alunos
- **WHEN** o usuário exporta somente alunos
- **THEN** o arquivo tem só a aba `Alunos` no contrato e pode ser reimportado como importação parcial de alunos

#### Scenario: Exportar tudo e reimportar
- **WHEN** o usuário exporta todos os cadastros e reimporta o arquivo sem editar
- **THEN** o preview classifica as linhas com chave de negócio como atualizações sem duplicar esses registros; alunos sem matrícula podem aparecer como novos e MUST ser visíveis no preview

### Requirement: Caracteres e zeros à esquerda
O sistema SHALL preservar acentos nos valores de texto (nomes, títulos, pontos) na comparação exata e na exportação. Identificadores de negócio tratados como texto (registro, carteirinha) MUST preservar zeros à esquerda. Cabeçalhos MUST ser reconhecidos com trim e sem diferenciar maiúsculas/minúsculas, após normalização Unicode NFC.

#### Scenario: Nome com acento
- **WHEN** a escola persistida se chama `Escola Municipal Alair Ferreira de Souza` e a célula Escola usa exatamente esse texto
- **THEN** a referência resolve

#### Scenario: Matrícula com zero à esquerda
- **WHEN** a carteirinha no Excel é `0123` e o aluno persistido tem `enrollmentCode` `0123`
- **THEN** o sistema casa os dois e MUST NOT tratar como `123`
