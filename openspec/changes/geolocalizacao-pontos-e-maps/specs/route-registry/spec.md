## ADDED Requirements

### Requirement: Coordenadas opcionais no ponto de embarque
O sistema SHALL persistir cada ponto de embarque da rota com identificador estável, nome e, se informadas, latitude e longitude. Coordenadas MUST NOT ser obrigatórias para salvar a rota. Rotas já persistidas só com nomes MUST continuar utilizáveis após a atualização, sem GPS. Listagens e timelines MUST exibir o nome do ponto, não as coordenadas.

#### Scenario: Nova rota sem GPS nos pontos
- **WHEN** o usuário adiciona pontos só com nome e salva
- **THEN** a rota persiste os pontos com nome e sem exigir latitude/longitude

#### Scenario: Ponto antigo vira objeto
- **WHEN** o app reabre dados em que o ponto era só um texto
- **THEN** o ponto aparece com o mesmo nome e a rota permanece editável

### Requirement: Capturar localização ao cadastrar o ponto
No formulário da rota, ao adicionar ou editar um ponto, o sistema SHALL permitir marcar o local num mapa (buscar endereço e/ou tocar/arrastar o pino), sem exigir que a pessoa esteja na rua. Localização atual do aparelho MUST permanecer como opção secundária. Coordenadas numéricas manuais MUST NOT ser o caminho principal. Se a busca ou o mapa falhar, MUST NOT apagar o nome do ponto; MUST informar o erro.

#### Scenario: Marcar no mapa
- **WHEN** o usuário busca um endereço ou toca o mapa e confirma
- **THEN** aquele ponto fica com as coordenadas do pino

#### Scenario: Estou neste local
- **WHEN** o usuário escolhe gravar a posição atual do aparelho e o GPS responde
- **THEN** aquele ponto fica com as coordenadas recebidas

#### Scenario: Permissão recusada no GPS atual
- **WHEN** o usuário recusa a permissão de localização ao usar “estou neste local”
- **THEN** o ponto permanece na lista sem coordenadas novas e o usuário vê um aviso compreensível

## MODIFIED Requirements

### Requirement: Lista dinâmica de ruas no formulário
O sistema SHALL permitir adicionar pontos de embarque pelo nome, removê-los individualmente e reordenar (subir/descer) antes de salvar. Um ponto em branco MUST NOT ser adicionado. A ordem da lista MUST ser a ordem persistida em `boardingPoints`. Os rótulos da interface MUST usar “Ponto de embarque”, não “rua”. Cada item persistido MUST ser um ponto estruturado (identificador e nome; coordenadas opcionais). Dois pontos MUST NOT ter o mesmo nome na mesma rota.

#### Scenario: Adicionar rua
- **WHEN** o usuário informa um nome de ponto não vazio e confirma a adição
- **THEN** o ponto aparece na lista do formulário e o campo de nome é limpo

#### Scenario: Remover rua
- **WHEN** o usuário remove um ponto da lista do formulário
- **THEN** aquele ponto deixa de aparecer na lista; os demais permanecem na ordem relativa

#### Scenario: Nome vazio
- **WHEN** o usuário tenta adicionar um ponto sem nome
- **THEN** a lista de pontos não muda

#### Scenario: Subir rua
- **WHEN** o usuário sobe um ponto que não é o primeiro
- **THEN** ele troca de posição com o anterior na lista

#### Scenario: Descer rua
- **WHEN** o usuário desce um ponto que não é o último
- **THEN** ele troca de posição com o seguinte na lista
