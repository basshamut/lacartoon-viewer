# Build y despliegue

Guía para construir archivos de instalación para Android (APK) e iOS (archive/IPA).

## Prerrequisitos

### Android

- **Java 21** (JDK Zulu o OpenJDK)
- **Android SDK** (instalado con Android Studio)
- **ANDROID_HOME** configurado en el PATH

### iOS (solo macOS)

- **Xcode 16+**
- **Apple Developer Account** (opcional, para builds firmados)

## Build de Android

### Build de producción (web)

```bash
pnpm build
```

Genera archivos estáticos en `dist/`.

### Sincronizar con Capacitor

```bash
npx cap sync android
```

Copia los archivos de `dist/` a `android/app/src/main/assets/public/`.

### Generar APK debug (sin firma)

```bash
cd android
./gradlew assembleDebug
```

El APK se genera en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Generar APK release (firmado)

```bash
cd android
KEYSTORE_FILE=debug.jks \
KEYSTORE_PASSWORD=tu-password \
KEY_ALIAS=tu-alias \
KEY_PASSWORD=tu-password \
./gradlew assembleRelease
```

El APK se genera en:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Generar AAB (para Google Play)

```bash
cd android
./gradlew bundleRelease
```

El AAB se genera en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Configuración de firma (build.gradle)

El archivo `android/app/build.gradle` lee las credenciales de firma desde variables de entorno:

```groovy
signingConfigs {
    release {
        def keystorePath = System.getenv("KEYSTORE_FILE") ?: "release.keystore"
        storeFile file(keystorePath)
        storePassword System.getenv("KEYSTORE_PASSWORD") ?: ""
        keyAlias System.getenv("KEY_ALIAS") ?: ""
        keyPassword System.getenv("KEY_PASSWORD") ?: ""
    }
}
```

### Generar keystore

```bash
keytool -genkey -v -keystore debug.jks \
  -alias debug \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -storepass lacartoon-keypass-2026 \
  -keypass lacartoon-keypass-2026
```

**IMPORTANTE**: Nunca commitees el keystore a git. El `.gitignore` ya lo excluye.

## Build de iOS

### Sincronizar con Capacitor

```bash
npx cap sync ios
```

### Abrir en Xcode

```bash
npx cap open ios
```

O abre directamente `ios/App/App.xcodeproj`.

### Build archive (para distribución)

```bash
cd ios/App
xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -archivePath $PWD/build/App.xcarchive \
  archive \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO
```

### Build archive firmado (requiere Apple Developer)

```bash
cd ios/App
xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -archivePath $PWD/build/App.xcarchive \
  archive
```

### Exportar IPA (requiere Apple Developer)

```bash
# Crear ExportOptions.plist
cat > ExportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>ad-hoc</string>
  <key>compileBitcode</key>
  <false/>
</dict>
</plist>
EOF

# Exportar
xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa
```

### Sin Apple Developer Account

Si no tienes Apple Developer Account, el build genera un **archive (.xcarchive)** que puedes:
- Instalar en un dispositivo jailbroken
- Subir a un servicio de distribución (TestFlight requiere Apple Developer)
- Usar para testing con Xcode

## Instalación en dispositivos

### Android

1. Transfiere el APK al dispositivo (USB, email, etc.)
2. Habilita "Fuentes desconocidas" en Ajustes > Seguridad
3. Abre el APK para instalarlo

### iOS (sin Apple Developer)

1. Abre el `.xcarchive` en Xcode
2. Conecta el dispositivo por USB
3. Selecciona el dispositivo y haz click en "Run"

## Tamaño de los archivos

| Archivo | Tamaño aprox. |
|---------|--------------|
| APK debug | ~3.5 MB |
| APK release | ~3.5 MB |
| AAB release | ~3 MB |
| iOS archive | ~5 MB |

## Troubleshooting de builds

### Android: "SDK not found"

```bash
export ANDROID_HOME=/home/usuario/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Android: "Could not resolve com.android.tools.build:gradle"

Asegúrate de tener Java 21 instalado:

```bash
java -version
# Debe mostrar openjdk version "21.x.x"
```

### iOS: "Signing requires a development team"

Para builds sin firma, agrega:

```bash
CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
```

### iOS: "xcodeproj vs xcworkspace"

Capacitor 8 genera un `.xcodeproj`, no un `.xcworkspace`. Usa:

```bash
xcodebuild -project App.xcodeproj ...
# NO uses -workspace
```
