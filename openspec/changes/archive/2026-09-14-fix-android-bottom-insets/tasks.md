## 1. Tab Bar

- [x] 1.1 Em `app/(tabs)/_layout.tsx`, ler `useSafeAreaInsets()` e aplicar `height: 64 + insets.bottom` e `paddingBottom: 8 + insets.bottom`, mantendo `paddingTop: 6` e as cores atuais; verificar no código que não há constante tipo 48/80 para Android
- [x] 1.2 Confirmar que as telas de tab (`index`, `cadastros`, `historico`, `configuracoes`) continuam usando só `insets.top` no conteúdo e **não** somam `insets.bottom` de novo; verificar ausência de `paddingBottom: insets.bottom` nesses arquivos

## 2. Rodapés de stack

- [x] 2.1 Em `ExecutionBottomBar`, somar `insets.bottom` ao `pb-3` (fundo da barra até a borda, botões acima); verificar que labels Anterior/Concluir/Pular e cores não mudam
- [x] 2.2 Nos FABs de `app/schools/index.tsx`, `app/routes/index.tsx` e `app/students/index.tsx`, trocar `bottom-6` por `24 + insets.bottom`; verificar que o botão permanece `absolute` e com as mesmas classes de cor
- [x] 2.3 Nos sheets/modais de rodapé (`RoutePickerSheet`, `VehicleListModal`, `StartRouteSheet`, `LeaveConfirmSheet`, `GuardianContactSheet`, `DevFeaturesSheet`, `DatePickerField`, `TimePickerField`), somar `insets.bottom` ao `paddingBottom`/`pb-*` existente; verificar que o recuo extra é só o inset

## 3. Validação

- [x] 3.1 Rodar `npx tsc --noEmit` e `npm run test:geo` e verificar que passam
- [x] 3.2 Checklist visual (dispositivo ou emulador): Android três botões — Tab Bar, execução e um FAB acima da ◀ ● ■; Android gestos — sem poço extra além do inset; iOS — home indicator ok. Anotar no PR/relatório se algum cenário não pôde ser testado fisicamente

Validação física 3.2: não executada nesta sessão (sem emulador/dispositivo Android/iOS no ambiente do apply). Conferir no APK com três botões, gestos e iOS após instalar o build.
