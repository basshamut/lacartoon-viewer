# LaCartoons Next

Aplicación web y móvil para ver videos de [lacartoons.com](https://www.lacartoons.com). Construida con React + Vite, desplegada en Android e iOS con Capacitor.

## Datos del proyecto

- **510 series** de cartoons
- **30,334 episodios** totales
- **30,189 URLs de video** (99.5% de cobertura)
- **14 categorías** (Acción, Aventura, Comedia, etc.)

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 |
| Estilos | Tailwind CSS v4 |
| Rutas | React Router v7 |
| Mobile | Capacitor 8 (Android + iOS) |
| Datos | JSON estático (scrapeados) |
| CI/CD | GitHub Actions |
| Linting | OxLint |

## Estructura del proyecto

```
lacartoon-viewer/
├── public/data/lacartoons.json   # Datos scrapeados (510 series, 30k+ episodios)
├── scraper/scrape.py             # Scraper Python con scraping concurrente
├── src/
│   ├── components/
│   │   ├── Header.jsx            # Header sticky con logo
│   │   ├── SearchBar.jsx         # Búsqueda con debounce
│   │   ├── SerieCard.jsx         # Card de serie para la grilla
│   │   └── VideoPlayer.jsx       # Reproductor iframe (ok.ru, cubeembed)
│   ├── pages/
│   │   ├── Home.jsx              # Página principal (grilla + filtros + búsqueda)
│   │   └── SerieDetail.jsx       # Detalle de serie (episodios + reproductor + favoritos)
│   ├── hooks/useLocalStorage.js  # Hook para favoritos persistentes
│   ├── data/api.js               # Carga y filtrado de datos
│   ├── main.jsx                  # Entry point + listener de Capacitor App
│   ├── App.jsx                   # Router principal
│   └── index.css                 # Tailwind CSS
├── android/                      # Proyecto nativo Android (Capacitor)
├── ios/                          # Proyecto nativo iOS (Capacitor)
├── .github/workflows/build.yml   # CI/CD: build Android + iOS
├── capacitor.config.json         # Configuración Capacitor
└── package.json                  # Dependencias y scripts
```

## Inicio rápido

### Prerrequisitos

- Node.js 22+
- pnpm 11+
- Python 3.10+ (solo para el scraper)
- Android Studio (solo para Android)
- Xcode 16+ (solo para iOS, solo macOS)

### Instalación

```bash
# Clonar el repositorio
git clone git@github.com:basshamut/lacartoon-viewer.git
cd lacartoon-viewer

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | Build de producción |
| `pnpm lint` | Linting con OxLint |
| `pnpm cap:sync` | Sincronizar web → proyectos nativos |
| `pnpm cap:open` | Abrir proyecto en Android Studio |
| `pnpm cap:run` | Ejecutar en dispositivo/emulador |

## Funcionalidades

- **Grilla de series** con imágenes, categorías y año
- **Filtro por categorías** (scroll horizontal)
- **Búsqueda en tiempo real** con debounce
- **Detalle de serie** con episodios organizados por temporada
- **Reproductor de video** embebido (ok.ru / cubeembed)
- **Favoritos** persistentes en localStorage
- **Responsive** — funciona en mobile y desktop
- **App nativa** — Android APK + iOS archive via Capacitor

## Datos

Los datos se generan con el scraper y se guardan en `public/data/lacartoons.json`. Ver [docs/scraper.md](docs/scraper.md) para más detalles.

## Build y despliegue

Ver [docs/build-deploy.md](docs/build-deploy.md) para instrucciones detalladas de build para Android e iOS.

Ver [docs/ci-cd.md](docs/ci-cd.md) para la configuración de GitHub Actions.

## Documentación

- [Scraper](docs/scraper.md) — Cómo funciona el scraper y cómo ejecutarlo
- [React + Capacitor](docs/capacitor.md) — Arquitectura de la app mobile
- [Build y despliegue](docs/build-deploy.md) — Build de APK (Android) y archive (iOS)
- [CI/CD con GitHub Actions](docs/ci-cd.md) — Pipeline automatizado
- [FAQ y troubleshooting](docs/faq.md) — Problemas comunes y soluciones

## Licencia

Proyecto personal. No para distribución.
