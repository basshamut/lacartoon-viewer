let cachedData = null;

export async function loadData() {
  if (cachedData) return cachedData;

  const response = await fetch('/data/lacartoons.json');
  cachedData = await response.json();
  return cachedData;
}

export async function getCategories() {
  const data = await loadData();
  return data.categories;
}

export async function getSeries() {
  const data = await loadData();
  return data.series;
}

export async function getSerieById(id) {
  const data = await loadData();
  return data.series.find((s) => s.id === Number(id));
}

export async function getSeriesByCategory(category) {
  const data = await loadData();
  return data.series.filter(
    (s) => s.category.toLowerCase() === category.toLowerCase()
  );
}

export async function searchSeries(query) {
  const data = await loadData();
  const q = query.toLowerCase();
  return data.series.filter((s) => s.name.toLowerCase().includes(q));
}
