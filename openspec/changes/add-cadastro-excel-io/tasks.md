## 1. Dependências e contrato

- [x] 1.1 Instalar `xlsx` e, via `npx expo install` (SDK 57), `expo-document-picker`, `expo-file-system` e `expo-sharing`; verificar que `package.json` lista as versões Expo 57 e que o app ainda inicia
- [x] 1.2 Criar `lib/excel/contract.ts` com nomes canônicos das abas, colunas obrigatórias/opcionais e aliases de cabeçalho (trim, case-insensitive, NFC); verificar com teste que `Alunos`/`alunos` casam e que aba `Notas` é ignorada
- [x] 1.3 Ligar normalização aos helpers existentes (`formatPlate`, `isValidPlate`, `formatPhoneBr`, `isValidHhMm`, `parsePositiveInt`, `optionalText`); verificar que matrícula `0123` permanece texto `0123`

## 2. Reader, writer e planner

- [x] 2.1 Implementar leitura/escrita de `ArrayBuffer` xlsx (SheetJS) gerando as quatro abas no contrato; verificar teste de exportar buffer e reimportar cabeçalhos/valores
- [x] 2.2 Implementar `buildImportPlan(snapshot, workbook)` puro: detectar abas presentes, validar linhas, classificar novo/update/duplicata/conflito/ref/erro; verificar uma aba, várias, todas, ordem invertida e aba ausente sem erro
- [x] 2.3 Matching: placa; registro ou nome exato de escola; título+escola da rota; `enrollmentCode`; aluno sem matrícula sempre novo; zeros à esquerda e acentos em comparação exata; verificar cada caso com fixture
- [x] 2.4 Referências e assento: ponto de aluno só se já existir na rota (store ou aba Rotas); não appendar ponto a partir de Alunos; assento ocupado/fora do mapa = erro; verificar que plano só-alunos não inclui updates de campos de escola/rota/veículo
- [x] 2.5 Update com célula vazia não altera o campo no payload de update; verificar fixture escola com registro, nome vazio e telefone novo

## 3. Persistência confirmada

- [x] 3.1 Helper de apply que despacha na ordem veículos → escolas → rotas → alunos usando actions/`assignSeat` existentes, gerando `id` só em registros novos; verificar que `types/attendance.ts` não é tocado e que cancelar (não chamar apply) deixa o store igual
- [x] 3.2 Confirmar persistência: linhas inválidas ficam de fora; `studentIds` e `seatsMap` atualizam só pelos alunos persistidos; verificar import parcial de alunos não muda `name`/`plate`/`title` já persistidos

## 4. UI Cadastros

- [x] 4.1 Em `app/(tabs)/cadastros.tsx` (ou tela filha), fluxo importar: picker xlsx, preview (abas, totais, novo/update/erro/duplicata/ref, linha+campo), confirmar/cancelar; verificar que persistência só ocorre no confirmar
- [x] 4.2 Exportar todos, um tipo ou combinação com os mesmos nomes de aba/coluna; verificar arquivo compartilhado e que reimportar com chaves preenche preview de atualização (alunos sem matrícula aparecem como novos)

## 5. Testes e conferência

- [x] 5.1 Incluir no script `test` os arquivos `lib/excel/*.test.ts` cobrindo: cabeçalho inválido, campos vazios, novo, existente, duplicidade, referência inexistente, acentos, zeros à esquerda, round-trip, importação parcial; verificar `npm test`
- [x] 5.2 Rodar `npx tsc --noEmit` e conferir que parsing não está nas telas além de chamar o módulo `lib/excel`
