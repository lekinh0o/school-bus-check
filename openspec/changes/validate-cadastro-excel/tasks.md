## 1. Matriz Node — isolamento e conjunto

- [ ] 1.1 Adicionar helper de snapshot das quatro fatias Redux e testes de isolamento: importar só Alunos, só Escolas, só Rotas e só Veículos sem alterar as fatias ausentes (vínculos de aluno só quando a aba Alunos veio); verificar com `npx --yes tsx --test lib/excel/excel.test.ts`
- [ ] 1.2 Cobrir conjunto Alunos+Escolas, Alunos+Escolas+Rotas e as quatro abas em ordens diferentes; verificar que `sheetsFound` e persistência seguem só as abas presentes
- [ ] 1.3 Cobrir workbook sem abas do contrato (plano vazio, sem erro de aba faltante) e buffer ilegível (parser lança; controlador expõe falha); verificar nos testes do planner e do controller

## 2. Duplicidade, opcionais, erros e reimportação

- [ ] 2.1 Testar duplicidade de placa, registro, matrícula e par título+escola de rota (arquivo e cadastro); verificar conflito e zero persistência dessas linhas
- [ ] 2.2 Testar opcionais vazios, identificador de aluno vazio (novo, não casa por nome), trim, acentos exatos e zeros à esquerda; verificar contra `cadastro-excel` sem exigir campos opcionais
- [ ] 2.3 Testar aba desconhecida, cabeçalho inválido, referência inexistente, linha inválida e exportação de um tipo vs os quatro com `writeWorkbookBuffer` + reimport sem duplicar chaves; verificar round-trip no mesmo arquivo de testes

## 3. Correção só se a spec falhar

- [ ] 3.1 Se algum caso acima falhar por divergência de implementação, corrigir `lib/excel/` para a spec principal (não o texto “código da rota” da issue); verificar o teste que falhava e `npx tsc --noEmit`
- [ ] 3.2 Não alterar UI de revisão nem criar dependência/lote/fuzzy; verificar git diff restrito a excel/testes/relatório (e correção de motor se 3.1)

## 4. Validação técnica e auditoria

- [ ] 4.1 Rodar `npx tsc --noEmit` e `npm test`; registrar resultados no `AUDIT.md` desta change
- [ ] 4.2 Confirmar ausência de script de lint em `package.json` e documentar isso no relatório (não adicionar ESLint)
- [ ] 4.3 Percorrer a matriz manual mínima do design (export individual e completo, uma aba, quatro abas, reimport do export) e anotar o que não deu para validar
- [ ] 4.4 Escrever `AUDIT.md` com OpenSpec usado, contrato (abas e chaves: placa, registro, matrícula, título+escola), arquivos alterados, testes, limitações e cada critério de aceite da issue 04; verificar que o arquivo existe e `openspec validate validate-cadastro-excel --type change --strict` passa
