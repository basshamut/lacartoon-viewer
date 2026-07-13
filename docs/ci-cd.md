# CI/CD con GitHub Actions

El proyecto usa GitHub Actions para construir automáticamente APKs de Android y archives de iOS en cada push a `main`.

## Workflow: `.github/workflows/build.yml`

### Triggers

| Evento | Acción |
|--------|--------|
| Push a `main` | Build Android + iOS |
| Tag `v*` | Build + crear Release draft |
| Pull Request | Build debug (sin firma) |
| Manual (`workflow_dispatch`) | Elegir plataforma: android, ios, both |

### Jobs

#### 1. Android Build (`ubuntu-latest`)

```
checkout → pnpm setup → Node 22 → Java 21 → pnpm install
→ vite build → cap sync android → keystore decode → assembleRelease
→ upload artifact
```

- **Keystore**: Se decodifica desde `ANDROID_KEYSTORE_BASE64` (GitHub Secret)
- **Release build**: Se genera APK firmado si el keystore está disponible
- **Debug build**: Se genera APK sin firma si no hay keystore o es PR
- **Artifact**: `lacartoons-android-release` (retención 30 días)

#### 2. iOS Build (`macos-15`)

```
checkout → pnpm setup → Node 22 → Xcode 16.4 → pnpm install
→ vite build → cap sync ios → [optional] import certificate
→ xcodebuild archive → [optional] export IPA → upload
```

- **Sin firma**: `CODE_SIGNING_ALLOWED=NO` genera un archive sin firmar
- **Con firma**: Requiere secrets `IOS_P12_BASE64`, `IOS_P12_PASSWORD`, `IOS_KEYCHAIN_PASSWORD`
- **Artifact**: `lacartoons-ios-archive` o `lacartoons-ios-release` (.ipa)

#### 3. Create Release

Se ejecuta solo en tags `v*`. Descarga los artifacts de Android y iOS y crea un GitHub Release draft.

```yaml
if: startsWith(github.ref, 'refs/tags/v')
needs: [android, ios]
```

## Secrets de GitHub

### Android (requeridos para APK firmado)

| Secret | Descripción |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Keystore en base64 (`base64 -w0 debug.jks`) |
| `ANDROID_KEYSTORE_PASSWORD` | Password del keystore |
| `ANDROID_KEY_ALIAS` | Alias de la clave (ej: `debug`) |
| `ANDROID_KEY_PASSWORD` | Password de la clave |

### iOS (requeridos para IPA firmado)

| Secret | Descripción |
|--------|-------------|
| `IOS_P12_BASE64` | Certificado .p12 en base64 |
| `IOS_P12_PASSWORD` | Password del .p12 |
| `IOS_KEYCHAIN_PASSWORD` | Password del keychain temporal |
| `IOS_CODE_SIGN_IDENTITY` | Identidad de firma (ej: `iPhone Distribution: ...`) |
| `IOS_TEAM_ID` | Apple Team ID |

### Setup del keystore

```bash
# Generar keystore
keytool -genkey -v -keystore debug.jks \
  -alias debug -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -storepass lacartoon-keypass-2026

# Codificar en base64
base64 -w0 debug.jks

# Copiar el output y guardarlo como ANDROID_KEYSTORE_BASE64 en GitHub Secrets
```

## Crear un release

```bash
# Taggear un commit
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions automáticamente:
# 1. Build Android APK (firmado)
# 2. Build iOS archive
# 3. Crear GitHub Release draft con los archivos adjuntos
```

## Artefactos generados

| Artifact | Contenido | Retención |
|----------|-----------|-----------|
| `lacartoons-android-release` | APK firmado | 30 días |
| `lacartoons-android-debug` | APK sin firma | 14 días |
| `lacartoons-ios-release` | IPA firmado | 30 días |
| `lacartoons-ios-archive` | Archive sin firmar | 14 días |

## Concurrency

El workflow usa concurrency groups para cancelar builds anteriores del mismo branch:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Esto evita acumular builds si haces push rápido al mismo branch.
