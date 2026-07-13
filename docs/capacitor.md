# React + Capacitor

Esta documentación explica cómo la app web de React se convierte en una app nativa mobile usando Capacitor.

## ¿Qué es Capacitor?

[Capacitor](https://capacitorjs.com/) es un framework que permite convertir una app web en una app nativa para Android, iOS y web. Funciona como un **puente** entre tu código web y las APIs nativas del dispositivo.

### Cómo funciona

```
┌─────────────────────────────────┐
│         App React (web)         │  ← Tu código React/Vite
├─────────────────────────────────┤
│       Capacitor Bridge          │  ← API para acceder a nativo
├─────────────────────────────────┤
│    Android (WebView) / iOS      │  ← Container nativo
│    (WKWebView)                  │
└─────────────────────────────────┘
```

1. Vite compila tu app React en archivos estáticos (HTML, CSS, JS)
2. Capacitor copia esos archivos al proyecto nativo (Android/iOS)
3. El proyecto nativo usa un **WebView** para renderizar tu app web
4. Capacitor provee plugins para acceder a APIs nativas (cámara, filesystem, etc.)

## Arquitectura de LaCartoons Next

### Flujo de datos

```
lacartoons.com → scraper/scrape.py → public/data/lacartoons.json
                                            ↓
                                    React (data/api.js)
                                            ↓
                                    Pages (Home, SerieDetail)
                                            ↓
                                    Components (SerieCard, VideoPlayer)
                                            ↓
                                    Capacitor → Android/iOS
```

### Componentes principales

| Componente | Función |
|-----------|---------|
| `Header.jsx` | Header sticky con logo "LN" y enlace a GitHub |
| `SearchBar.jsx` | Búsqueda con debounce (300ms), muestra resultados en dropdown |
| `SerieCard.jsx` | Card con imagen, nombre, categoría y año |
| `VideoPlayer.jsx` | Iframe que carga ok.ru o cubeembed |
| `Home.jsx` | Grilla de series + filtros de categoría |
| `SerieDetail.jsx` | Episodios por temporada + reproductor + favoritos |

### Favoritos

Los favoritos se guardan en `localStorage` usando el hook `useLocalStorage`. Persisten entre sesiones sin necesidad de backend.

## Configuración de Capacitor

### capacitor.config.json

```json
{
  "appId": "com.lacartoons.app",
  "appName": "LaCartoons Next",
  "webDir": "dist"
}
```

- **appId**: Identificador único de la app (formato reverso de dominio)
- **appName**: Nombre que aparece en el dispositivo
- **webDir**: Directorio donde Vite genera los archivos estáticos

### Plugins instalados

| Plugin | Versión | Función |
|--------|---------|---------|
| `@capacitor/core` | 8.4.1 | Core de Capacitor |
| `@capacitor/android` | 8.4.1 | Platform Android |
| `@capacitor/ios` | 8.4.1 | Platform iOS |
| `@capacitor/app` | 8.1.0 | Escuchar eventos del ciclo de vida de la app |
| `@capacitor/cli` | 8.4.1 | CLI de Capacitor (devDependency) |

### Plugin: @capacitor/app

Se usa en `src/main.jsx` para interceptar intentos de abrir URLs externas:

```javascript
import { App } from '@capacitor/app'

App.addListener('appUrlOpen', ({ url }) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Bloquear navegación fuera de la app
    return
  }
})
```

Esto evita que los anuncios dentro de los iframes de video abran el navegador del sistema.

## Sincronización web → nativo

Cada vez que modificas código web, necesitas sincronizar con los proyectos nativos:

```bash
# Sincronizar ambos
pnpm cap:sync

# Sincronizar solo Android
npx cap sync android

# Sincronizar solo iOS
npx cap sync ios
```

Esto:
1. Compila la app web (`vite build`)
2. Copia los archivos al directorio `android/app/src/main/assets/public/` o `ios/App/App/public/`
3. Actualiza `capacitor.config.json` en el proyecto nativo
4. Registra los plugins en el proyecto nativo

## Plugins nativos (Capacitor 8)

Capacitor 8 usa **Swift Package Manager (SPM)** para iOS en lugar de CocoaPods. Los archivos relevantes:

- `ios/App/CapApp-SPM/Package.swift` — Define los plugins de Capacitor para iOS
- `android/capacitor.settings.gradle` — Define los plugins de Capacitor para Android
- `android/app/capacitor.build.gradle` — Configuración de build de plugins

## Acceso a APIs nativas

Para acceder a APIs nativas desde React, usa los plugins de Capacitor:

```javascript
import { Camera } from '@capacitor/camera'
import { Filesystem } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'

// Ejemplo: guardar favoritos en almacenamiento nativo
await Preferences.set({ key: 'favorites', value: JSON.stringify(ids) })
```

Ver la [lista de plugins oficiales](https://capacitorjs.com/docs/plugins) para más opciones.

## Limitaciones

1. **Rendimiento**: Una app Capacitor es un WebView, no es nativa pura. Para apps muy pesadas con animaciones complejas puede no ser ideal.
2. **Tamaño del APK**: El WebView agrega ~2-3MB al tamaño base.
3. **APIs no disponibles**: No todas las APIs de Android/iOS están expuestas por Capacitor. Para APIs específicas, se pueden crear plugins nativos personalizados.
4. **Debugging**: Para debuggar el código nativo (Java/Swift), necesitas abrir el proyecto en Android Studio/Xcode.
