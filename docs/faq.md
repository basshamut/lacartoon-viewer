# FAQ y Troubleshooting

## Preguntas frecuentes

### ¿Por qué un solo archivo JSON en vez de uno por serie?

Un solo archivo (`lacartoons.json`) de ~4MB permite:
- Carga instantánea de datos (un solo request)
- Filtrado y búsqueda en memoria (más rápido que requests al servidor)
- Sin necesidad de backend
- Facilidad de actualización (solo re-ejecutar el scraper)

### ¿Por qué los videos no se pueden descargar?

Los videos están embebidos desde ok.ru y cubeembed.rpmvid.com. El reproductor es un iframe que reproduce el video desde esos servidores. No hay forma directa de extraer la URL del archivo de video sin romper los TOS del servicio.

### ¿Cómo se actualizan los datos?

Ejecuta el scraper:

```bash
python3 scraper/scrape.py
```

Esto re-scrapea series, episodios y URLs de video. El scraper es incremental: solo fetcha lo que falta.

### ¿Por qué algunos episodios no tienen video?

~145 episodios (0.5%) no tienen URL de video porque:
- El video fue removido de ok.ru/cubeembed
- La página del episodio no tiene iframe de video
- Error temporal de red durante el scraping

### ¿La app funciona sin conexión?

No. Los videos se reproducen desde servidores externos (ok.ru, cubeembed). La app necesita conexión a internet para:
- Cargar la lista de series (si los datos no están en cache)
- Reproducir videos

### ¿Por qué React en vez de Angular o Vue?

React fue elegido por:
- Ecosistema más grande
- Mejor soporte para Capacitor
- Curva de aprendizaje más suave
- Comunidad activa

## Problemas comunes

### "No hay episodios" al abrir una serie

**Causa**: Los datos no se han scrapeado correctamente.

**Solución**:
```bash
python3 scraper/scrape.py all
```

### El reproductor no carga el video

**Causa**: ok.ru puede estar bloqueando la región o el dominio.

**Soluciones**:
1. Verificar que la URL del video sea válida
2. Probar con un VPN
3. Los anuncios pueden estar bloqueando el player (usar Brave en web)

### Build de Android falla con "SDK not found"

```bash
export ANDROID_HOME=/home/usuario/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Build de iOS falla con "Signing requires a development team"

Agrega flags de build:

```bash
CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
```

### `cap sync` no actualiza la app en el dispositivo

1. Reconstruir: `pnpm build`
2. Re-sincronizar: `pnpm cap:sync`
3. Re-ejecutar: `pnpm cap:run`

### El scraper se queda colgado

**Causa**: Timeout de red o rate limiting.

**Solución**: El scraper tiene retry logic (3 intentos). Si se cuelga, Ctrl+C y re-ejecutar. Los datos parciales se guardan incrementalmente.

### Error "Module not found" en Android Studio

```bash
# Limpiar y re-sincronizar
cd android
./gradlew clean
cd ..
pnpm cap:sync
pnpm cap:open
```

## Rendimiento

### Tamaño del JSON

- **~4MB** uncompressed
- **~1.2MB** gzipped (Vite comprime automáticamente)
- Carga en ~200ms en conexión rápida

### Búsqueda de series

La búsqueda usa un debounce de 300ms y filtra en memoria. Con 510 series, el filtrado es instantáneo (<1ms).

### Memoria

La app carga todos los datos en memoria al iniciar. Con 510 series y 30k+ episodios, el uso de memoria es ~10-15MB en el WebView.
