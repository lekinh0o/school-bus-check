## Why

No Android com navegação clássica de três botões, a Tab Bar e outros controles de rodapé ficam atrás da barra do sistema. O app desenha edge-to-edge, mas a altura da Tab Bar é fixa (`64`) e não soma `insets.bottom`. A correção precisa usar os insets reais, não um valor mágico por aparelho.

## What Changes

- A Tab Bar passa a reservar o inset inferior do sistema na altura e no `paddingBottom`, mantendo o chrome visual atual (cores, ícones, labels, `paddingTop`).
- Rodapés de telas fora das tabs (barra da execução, FABs de cadastro, sheets/modais colados embaixo) passam a somar o mesmo inset, sem mudar fluxos nem tokens.
- Confirma-se `SafeAreaProvider` na árvore (já usado via `useSafeAreaInsets` no topo das tabs); não se adiciona dependência nova se `react-native-safe-area-context` bastar.
- **Não** se altera identidade visual, regras de negócio, destinos de navegação nem altura fixa “maior no Android” como workaround.

## Capabilities

### New Capabilities

- `safe-area-layout`: o chrome inferior (Tab Bar, barras de ação, botões absolutos e sheets de rodapé) MUST respeitar `insets.bottom` dinâmicos no Android (três botões e gestos) e MUST NOT piorar o layout no iOS.

### Modified Capabilities

- (nenhuma) — `mobile-design-system` já permite “ajuste pontual de safe area”; esta change não muda tokens, tipografia nem composição visual.

## Impact

- `app/(tabs)/_layout.tsx` (Tab Bar).
- `app/_layout.tsx` só se faltar provider de safe area.
- `components/ExecutionBottomBar.tsx` e a tela de execução.
- FABs `absolute bottom-*` em `app/schools/index.tsx`, `app/routes/index.tsx`, `app/students/index.tsx`.
- Sheets/modais com `paddingBottom` fixo no rodapé (`RoutePickerSheet`, `VehicleListModal` e equivalentes).
- Nenhuma API de domínio, persistência ou fatia RTK.
- Dependência existente: `react-native-safe-area-context`. Sem pacote novo salvo evidência na implementação de que o inset não chega sem plugin nativo.
