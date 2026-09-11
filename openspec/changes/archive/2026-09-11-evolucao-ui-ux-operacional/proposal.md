## Why

No Início, rotas e histórico competem pela mesma tela; na execução, a timeline reta corta paradas, o ponto atual some no meio dos ícones, fotos pequenas geram dúvida e o contato usa só o primeiro telefone. O motorista precisa de um dashboard mais calmo, um caminho de paradas visível, alertas que chamem atenção e validação visual/contato confiáveis.

## What Changes

- Início (`app/(tabs)/index.tsx`): seção de rotas para executar e histórico recente separado (com “Ver todos” para listagem dedicada). Listas longas via `FlatList`.
- Timeline de percurso em “S” (linhas em zigue-zague com conectores), reutilizada na execução e no detalhe do histórico. Cadastros pode manter a faixa compacta atual.
- Card “hero” da parada atual na tab Execução (ícones ≥ 48px / `h-12 w-12` onde for interativo).
- Alertas padronizados INFO / ALERTA / ERRO (modal ou toast tipado), usados em bloqueios e avisos operacionais (ex.: concluir ponto com pendente; falta na ida).
- Long press na foto do aluno (execução e, no histórico, se a foto estiver visível) abre modal com foto ampliada e nome.
- Contato: um telefone abre WhatsApp direto; vários abrem seletor; depois da escolha, WhatsApp e Ligar. Números vêm de `contactPhones` (sem rótulos Mãe/Pai no cadastro).
- Git no apply: `feat/evolucao-ui-ux-operacional` a partir de `main`.

## Capabilities

### New Capabilities

- `operator-alerts`: apresentação padronizada de mensagens INFO, ALERTA e ERRO para o operador.

### Modified Capabilities

- `route-execution`: timeline em S, hero da parada atual, zoom de foto, seletor de telefone, alertas em ações bloqueadas.
- `execution-history`: Início com histórico recente + tela de lista; timeline em S no detalhe; contato com o mesmo seletor.

## Impact

- UI: `app/(tabs)/index.tsx`, `app/history/` (lista nova), `app/routes/execute/[id].tsx`, `app/history/[id].tsx`, `components/RouteTimeline.tsx` (ou componente S irmão), novo `AppAlert` / seletor de contato.
- `lib/contactGuardian.ts` (WhatsApp + `tel:`).
- NativeWind; sem backend. Persistência e regras de presença/execução não mudam.
