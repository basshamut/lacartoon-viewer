import { useState, useEffect } from 'react';
import { getCategories, getSeries } from '../data/api';
import SerieCard from '../components/SerieCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getSeries()]).then(([cats, sers]) => {
      setCategories(cats);
      setSeries(sers);
      setLoading(false);
    });
  }, []);

  const filtered = selectedCategory
    ? series.filter((s) => s.category === selectedCategory)
    : series;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Cargando series...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categorias</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-purple-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedCategory || 'Todas las series'}
          </h2>
          <span className="text-sm text-gray-500">{filtered.length} series</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((serie) => (
            <SerieCard key={serie.id} serie={serie} />
          ))}
        </div>
      </section>
    </div>
  );
}
