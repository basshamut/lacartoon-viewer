# Scraper de LaCartoons

Script de Python para extraer series y episodios de [lacartoons.com](https://www.lacartoons.com/).

## Instalación

```bash
cd scraper
pip install -r requirements.txt
```

## Uso

```bash
python scrape.py
```

El scraper generará el archivo `public/data/lacartoons.json` con todos los datos.

## Estructura del JSON

```json
{
  "categories": ["Cartoon Network", "Nickelodeon", ...],
  "series": [
    {
      "id": 1,
      "name": "2 Perros Tontos",
      "image": "https://...",
      "category": "Cartoon Network",
      "year": 1993,
      "rating": 7,
      "episodes": [
        {
          "id": 1,
          "title": "El problema de la puerta",
          "season": 1,
          "episode": 1,
          "videoUrl": "https://ok.ru/videoembed/..."
        }
      ]
    }
  ]
}
```
