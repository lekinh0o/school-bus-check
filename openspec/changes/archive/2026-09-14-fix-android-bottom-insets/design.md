## Context

Ver proposal.md. Expo SDK 57 + RN 0.86 desenham o app edge-to-edge no Android: a janela inclui a região dos três botões. `useSafeAreaInsets()` já funciona no topo das tabs (`insets.top`), então o `SafeAreaProvider` (injetado pelo Expo Router) existe. A Tab Bar em `app/(tabs)/_layout.tsx` fixa `height: 64`, `paddingTop: 6`, `paddingBottom: 8` e **ignora** `insets.bottom`. Telas de stack (execução, listas com FAB, sheets) usam `pb-3` / `bottom-6` / `paddingBottom: 32` sem o inset. Spec: `specs/safe-area-layout/spec.md`.

```
+---------------------------+
| status bar (insets.top)   |  <- tabs já somam
| conteúdo                  |
| Tab Bar 64px (fixo)       |
| [sistema ◀ ● ■]           |  <- app pinta por baixo
+---------------------------+
```

## Goals / Non-Goals

**Goals:**

- Somar `insets.bottom` à Tab Bar sem encolher ícones/labels nem duplicar padding.
- Aplicar o mesmo recuo nos rodapés de stack/sheets no escopo.
- Preservar tokens e chrome visual (`palette.surface`, 64px de conteúdo da tab).

**Non-Goals:**

- Plugin `expo-navigation-bar` / `react-native-edge-to-edge` só para esconder a barra ou pintar contraste.
- Helper global obrigatório se um `useSafeAreaInsets` local bastar; extrair helper só se 3+ call sites repetirem a mesma fórmula.
- Alterar `insets.top` das tabs (já correto).
- Persistência, presença, Maps/Waze.

## Decisions

1. **Fórmula da Tab Bar.** Manter o chrome de 64px (já inclui `paddingTop: 6` e o `paddingBottom: 8` de respiro dos labels). Passar a:
   - `height: 64 + insets.bottom`
   - `paddingBottom: 8 + insets.bottom`
   - `paddingTop: 6` inalterado
   - cores/labels iguais

   Alternativa A: omitir `height` e deixar o React Navigation calcular. Rejeitada: o visual atual depende dos 64px + `paddingTop`.

   Alternativa B: `height: 80` / `90` no Android. Rejeitada: viola o spec (constante de aparelho) e falha com barras de tamanhos diferentes.

   Alternativa C: `SafeAreaView` em volta das tabs. Rejeitada para a Tab Bar: o inset precisa estar **dentro** do estilo da barra (fundo `surface` até a borda da tela, conteúdo acima dos botões), não empurrar a barra inteira para cima deixando uma faixa do fundo da tela atrás dos três botões.

2. **Provider.** Não reempacotar a árvore com outro `SafeAreaProvider` a menos que, na implementação, `insets.bottom` venha `0` com edge-to-edge ativo. Se isso ocorrer, o primeiro passo é confirmar o provider na raiz; só então avaliar plugin nativo. Telas já leem `insets.top` ≠ 0, então o caso esperado é inset inferior > 0 no APK com três botões.

3. **Rodapés de stack.** `ExecutionBottomBar`: `paddingBottom = 12 (pb-3) + insets.bottom` (fundo da barra cobre a região do sistema, botões acima). FABs `bottom-6`: `bottom = 24 + insets.bottom`. Sheets (`RoutePickerSheet`, `VehicleListModal` e pares com `paddingBottom: 32`): `32 + insets.bottom`. Não somar inset de Tab Bar nessas rotas (são Stack, sem tabs visíveis).

4. **Telas de tab com `insets.top` só.** Não adicionar `paddingBottom` de sistema no `ScrollView` das tabs: o inset já entra na Tab Bar. Somar de novo no conteúdo geraria poço duplo.

5. **Sem dependência nova.** `react-native-safe-area-context` já está no `package.json`.

## Risks / Trade-offs

- [height + paddingBottom ambos incluem inset → conteúdo esmagado] → Mitigation: 64 já inclui o 8 de padding; só o **mesmo** `insets.bottom` entra nos dois, como o padrão do React Navigation.
- [FAB + lista com safe area do header] → Mitigation: só alterar `bottom`, não o padding do scroll.
- [Sheet com 32 + inset fica alto em gesto] → Mitigation: inset de gesto é pequeno; 32 continua o recuo de design.
- [Validação física de três botões] → Mitigation: tarefas incluem checklist; Expo Go vs APK podem diferir — validar no APK se o edge-to-edge só aparece no binário nativo.

## Migration Plan

1. Ajuste JS apenas; sem migration de persistência.
2. Rebuild APK para validar três botões (o overlay costuma aparecer no build nativo, não necessariamente no Expo Go).
3. Rollback: reverter os arquivos de layout listados nas tasks.

## Open Questions

Nenhuma que altere spec: se `insets.bottom` for 0 no APK com overlay visível, isso vira spike na implementação (provider / edge-to-edge), não mudança de requisito.
