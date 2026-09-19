# Gerar APK com Gradle (Docker)

Este é o fluxo usado neste projeto no Windows, **sem Android SDK nem Gradle instalados na máquina**. O `android/` é gerado na hora e **não entra no git**.

Tempo típico: 15–30 minutos (a primeira vez puxa a imagem Docker e baixa o Gradle).

## O que você precisa

1. Node.js e `npm install` já feitos na raiz do repositório.
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) **aberto e rodando**.
3. Git Bash (o terminal padrão deste repo).

Não precisa de conta Expo, EAS nem Android Studio.

## 1. Conferir a versão

Em `app.json`:

- `expo.version` — versão visível (ex.: `1.0.0`)
- `expo.android.versionCode` — inteiro do Android. **Suba +1** a cada APK novo se for instalar por cima do anterior.

Pacote: `com.lekinh0o.schoolbuscheck`.

## 2. Gerar o projeto nativo

Na raiz do repositório:

```bash
npx expo prebuild --platform android --clean --non-interactive
```

Isso apaga e recria `android/` a partir do `app.json` e dos plugins. O prebuild costuma trocar os scripts `android`/`ios` do `package.json` para `expo run:*`. Volte-os:

```json
"android": "expo start --android",
"ios": "expo start --ios",
```

## 3. Compilar o APK no Docker

Ainda na raiz, no Git Bash:

```bash
MSYS_NO_PATHCONV=1 docker run --rm --dns 8.8.8.8 \
  -e GRADLE_OPTS="-Djava.net.preferIPv4Stack=true" \
  -v "C:/Users/Alexv/Desenvolvimento/school-bus-check:/app" \
  -v schoolbus-gradle-cache:/root/.gradle \
  -w /app \
  reactnativecommunity/react-native-android \
  bash -lc "cp -f node_modules/react-native-css-interop/node_modules/lightningcss/node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node node_modules/react-native-css-interop/node_modules/lightningcss/ 2>/dev/null || (npm install --no-save --prefix node_modules/react-native-css-interop/node_modules/lightningcss lightningcss-linux-x64-gnu && cp -f node_modules/react-native-css-interop/node_modules/lightningcss/node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node node_modules/react-native-css-interop/node_modules/lightningcss/); sed -i 's/\r$//' android/gradlew && chmod +x android/gradlew && cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a"
```

Ajuste o caminho depois de `-v` se o clone não estiver em `C:/Users/Alexv/Desenvolvimento/school-bus-check`.

O `MSYS_NO_PATHCONV=1` é obrigatório no Git Bash: sem isso o Docker recebe o volume errado.

Espere `BUILD SUCCESSFUL`. O APK sai em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Arquitetura: **arm64-v8a** (celulares Android atuais). Assinatura: keystore de debug (sideload, não Play Store).

## 4. Copiar para `dist/`

```bash
mkdir -p dist
cp -f android/app/build/outputs/apk/release/app-release.apk dist/school-bus-check-1.0.0.apk
cp -f android/app/build/outputs/apk/release/app-release.apk dist/school-bus-check-main.apk
```

Troque `1.0.0` pela versão de `app.json` se for outra.

`dist/` e `android/` ficam fora do git.

## 5. Restaurar o NativeWind no Windows

O container troca o binário nativo do `lightningcss` pelo de Linux. Sem o passo abaixo, `npx expo start` quebra no Windows.

```bash
npm install --no-save --prefix node_modules/react-native-css-interop/node_modules/lightningcss lightningcss-win32-x64-msvc
cp -f node_modules/react-native-css-interop/node_modules/lightningcss/node_modules/lightningcss-win32-x64-msvc/lightningcss.win32-x64-msvc.node node_modules/react-native-css-interop/node_modules/lightningcss/
```

Confira se existe `lightningcss.win32-x64-msvc.node` nessa pasta.

## 6. Instalar no celular

1. Copie o APK para o aparelho (USB, Drive, WhatsApp, etc.).
2. Permita instalar de fontes desconhecidas.
3. Abra o arquivo e instale.

Se o sistema recusar por “versão mais antiga”, aumente `android.versionCode` no `app.json` e gere de novo — ou desinstale o app antigo antes.

## Se o build falhar

| Sintoma | O que fazer |
| --- | --- |
| `docker: error` / daemon | Abra o Docker Desktop e espere ficar verde. |
| Volume vazio / `gradlew: not found` | Rode de novo com `MSYS_NO_PATHCONV=1` e o caminho `C:/...` (barras normais). |
| `lightningcss` / NativeWind no Gradle | O comando do passo 3 já instala o binário Linux; não pule o `cp`. |
| `expo start` quebra depois do APK | Refaça o passo 5. |
| APK não instala em cima do anterior | Suba `versionCode` e rebuild. |

## Gradle na máquina (opcional)

Se você tiver Android Studio + SDK (`ANDROID_HOME`) e JDK, depois do prebuild:

```bash
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

No Windows, use `gradlew.bat`. Esse caminho **não** foi o usado neste repo: aqui o Gradle roda só no Docker.
