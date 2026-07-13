import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://www.lacartoons.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
MAX_WORKERS = 16

session = requests.Session()
session.headers.update(HEADERS)


def get_page(url):
    """Fetch a page with retry logic."""
    for attempt in range(3):
        try:
            response = session.get(url, timeout=15)
            response.raise_for_status()
            return response.text
        except requests.RequestException:
            time.sleep(0.5 * (attempt + 1))
    return None


def scrape_series_list():
    """Scrape all series from paginated list."""
    series = []
    page = 1

    while True:
        url = f"{BASE_URL}/?page={page}" if page > 1 else BASE_URL
        print(f"Obteniendo pagina {page}...", end=" ", flush=True)

        html = get_page(url)
        if not html:
            print("ERROR")
            break

        soup = BeautifulSoup(html, "lxml")
        series_cards = soup.select("a[href^='/serie/']")

        if not series_cards:
            print("VACIA")
            break

        for card in series_cards:
            href = card.get("href", "")
            series_id_match = re.search(r"/serie/(\d+)", href)
            if not series_id_match:
                continue

            series_id = int(series_id_match.group(1))

            name_elem = card.select_one(".nombre-serie")
            name = name_elem.get_text(strip=True) if name_elem else "Desconocido"

            img_elem = card.select_one("img")
            image = ""
            if img_elem:
                src = img_elem.get("src", "")
                image = f"{BASE_URL}{src}" if src.startswith("/") else src

            category_elem = card.select_one(".marcador")
            category = category_elem.get_text(strip=True) if category_elem else "Otros"

            year_elem = card.select_one(".marcador-ano")
            year = int(year_elem.get_text(strip=True)) if year_elem else 0

            rating_elem = card.select_one(".valoracion")
            rating = 0
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                rating_match = re.search(r"(\d+)", rating_text)
                if rating_match:
                    rating = int(rating_match.group(1))

            series.append({
                "id": series_id,
                "name": name,
                "image": image,
                "category": category,
                "year": year,
                "rating": rating,
                "episodes": []
            })

        print(f"{len(series_cards)} series")
        page += 1
        time.sleep(0.3)

    return series


def scrape_serie_episodes(serie):
    """Scrape episodes for a single series."""
    url = f"{BASE_URL}/serie/{serie['id']}"

    html = get_page(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    episodes = []

    season_headers = soup.select("h4.accordion")
    for season_header in season_headers:
        season_text = season_header.get_text(strip=True)
        season_match = re.search(r"(\d+)", season_text)
        season = int(season_match.group(1)) if season_match else 1

        episode_panel = season_header.find_next_sibling("div", class_="episodio-panel")
        if not episode_panel:
            continue

        episode_links = episode_panel.select("a[href*='/serie/capitulo/']")
        for i, link in enumerate(episode_links, 1):
            href = link.get("href", "")
            episode_id_match = re.search(r"/serie/capitulo/(\d+)", href)
            if not episode_id_match:
                continue

            episode_id = int(episode_id_match.group(1))

            title_text = link.get_text(strip=True)
            title_text = re.sub(r"^Capitulo\s*\d+\s*-\s*", "", title_text)

            episodes.append({
                "id": episode_id,
                "title": title_text,
                "season": season,
                "episode": i
            })

    return episodes


def scrape_episode_video(episode_id):
    """Scrape video URL for a single episode."""
    url = f"{BASE_URL}/serie/capitulo/{episode_id}?t=1"

    html = get_page(url)
    if not html:
        return ""

    soup = BeautifulSoup(html, "lxml")
    iframe = soup.select_one("iframe[src]")

    if iframe:
        return iframe.get("src", "")

    return ""


def fetch_video_batch(episodes_to_fetch):
    """Fetch video URLs concurrently for a batch of episodes."""
    results = {}
    done_count = 0
    total = len(episodes_to_fetch)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_ep = {
            executor.submit(scrape_episode_video, ep["id"]): ep
            for ep in episodes_to_fetch
        }

        for future in as_completed(future_to_ep):
            ep = future_to_ep[future]
            try:
                video_url = future.result()
                results[ep["id"]] = video_url
            except Exception:
                results[ep["id"]] = ""

            done_count += 1
            if done_count % 100 == 0 or done_count == total:
                print(f"    {done_count}/{total} videos obtenidos", flush=True)

    return results


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"

    print("=" * 60)
    print("SCRAPER DE LACARTOONS.COM")
    print(f"Modo: {mode}")
    print("=" * 60)

    output_dir = os.path.join(os.path.dirname(__file__), "..", "public", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "lacartoons.json")

    existing_data = {}
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as f:
            existing_data = json.load(f)

    if mode in ("all", "series"):
        print("\n[1] Obteniendo lista de series...")
        series_list = scrape_series_list()
        print(f"\nTotal de series encontradas: {len(series_list)}")
    else:
        series_list = existing_data.get("series", [])
        print(f"\nUsando {len(series_list)} series existentes")

    if mode in ("all", "episodes"):
        print("\n[2] Obteniendo episodios...")
        total = len(series_list)
        for i, serie in enumerate(series_list, 1):
            if not serie.get("episodes"):
                print(f"  [{i}/{total}] {serie['name']}...", end=" ", flush=True)
                episodes = scrape_serie_episodes(serie)
                serie["episodes"] = episodes
                print(f"{len(episodes)} episodios")
                time.sleep(0.3)

    if mode in ("all", "videos"):
        print("\n[3] Obteniendo URLs de videos (concurrent)...")
        all_episodes = []
        for serie in series_list:
            for ep in serie.get("episodes", []):
                if not ep.get("videoUrl"):
                    all_episodes.append(ep)

        print(f"  Total a fetchear: {len(all_episodes)} episodios con {MAX_WORKERS} workers")

        video_map = fetch_video_batch(all_episodes)

        for serie in series_list:
            for ep in serie.get("episodes", []):
                if ep["id"] in video_map:
                    ep["videoUrl"] = video_map[ep["id"]]

    categories = list(set(s["category"] for s in series_list))
    categories.sort()

    result = {
        "categories": categories,
        "series": series_list
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)

    total_episodes = sum(len(s["episodes"]) for s in series_list)
    total_videos = sum(
        1 for s in series_list
        for e in s["episodes"]
        if e.get("videoUrl")
    )

    print("\n" + "=" * 60)
    print(f"SCRAPER COMPLETADO")
    print(f"Series: {len(series_list)}")
    print(f"Categorias: {len(categories)}")
    print(f"Total episodios: {total_episodes}")
    print(f"Total videos: {total_videos}")
    print(f"Archivo: {output_file}")
    print("=" * 60)


if __name__ == "__main__":
    main()
