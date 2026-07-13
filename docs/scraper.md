# Scraper de lacartoons.com

El scraper extrae información de series, episodios y URLs de video de [lacartoons.com](https://www.lacartoons.com) y la guarda en un archivo JSON que la app consume.

## Datos extraídos

| Campo | Descripción |
|-------|-------------|
| `id` | ID numérico de la serie |
| `name` | Nombre de la serie |
| `image` | URL de la imagen de portada |
| `category` | Categoría (Acción, Aventura, Comedia, etc.) |
| `year` | Año de publicación |
| `rating` | Valoración numérica |
| `episodes[]` | Lista de episodios por temporada |
| `episodes[].videoUrl` | URL del video embebido (ok.ru, cubeembed) |

### Estadísticas actuales

- **510 series** scrapeadas
- **30,334 episodios** totales
- **30,189 URLs de video** (99.5% de cobertura)
- **~145 episodios** sin video (0.5%)

## Cómo funciona

El scraper tiene 3 fases:

### Fase 1: Lista de series

Recorre las páginas paginadas de lacartoons.com (`/?page=1`, `/?page=2`, etc.) y extrae:
- Nombre, imagen, categoría, año, valoración
- ID de cada serie (usado para la fase 2)

### Fase 2: Episodios

Para cada serie, visita `/serie/{id}` y extrae:
- Episodios agrupados por temporada (usando los headers `h4.accordion`)
- Título y número de cada episodio

### Fase 3: URLs de video (concurrente)

Para cada episodio, visita `/serie/capitulo/{id}?t=1` y extrae la URL del iframe de video. Esta fase usa **concurrency** con `ThreadPoolExecutor` (16 workers) para acelerar el proceso.

## Uso

### Ejecutar todo el scraper

```bash
python3 scraper/scrape.py
# o
python3 scraper/scrape.py all
```

### Ejecutar solo una fase

```bash
# Solo lista de series
python3 scraper/scrape.py series

# Solo episodios (usa series existentes en el JSON)
python3 scraper/scrape.py episodes

# Solo URLs de video (usa episodios existentes)
python3 scraper/scrape.py videos
```

### Actualizar datos

El scraper es **incremental**: si ya existe un archivo `lacartoons.json`, reutiliza los datos existentes y solo fetcha lo que falta. Por ejemplo, si ejecutas `python3 scraper/scrape.py videos`, solo fetcha URLs de video para episodios que no tengan `videoUrl`.

## Configuración

Las constantes en `scraper/scrape.py`:

```python
BASE_URL = "https://www.lacartoons.com"
MAX_WORKERS = 16  # Workers concurrentes para URLs de video
```

## Output

El archivo de salida es `public/data/lacartoons.json` con esta estructura:

```json
{
  "categories": ["Acción", "Aventura", "Comedia", ...],
  "series": [
    {
      "id": 12345,
      "name": "Nombre de la Serie",
      "image": "https://www.lacartoons.com/...",
      "category": "Acción",
      "year": 1990,
      "rating": 85,
      "episodes": [
        {
          "id": 123456,
          "title": "Nombre del Episodio",
          "season": 1,
          "episode": 1,
          "videoUrl": "https://ok.ru/videoembed/123456789"
        }
      ]
    }
  ]
}
```

## Dependencias de Python

```bash
pip install requests beautifulsoup4 lxml
```
