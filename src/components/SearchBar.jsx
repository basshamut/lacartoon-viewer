import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSeries } from '../data/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const found = await searchSeries(query);
      setResults(found.slice(0, 8));
      setOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(id) {
    setQuery('');
    setResults([]);
    setOpen(false);
    navigate(`/serie/${id}`);
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar serie..."
        className="w-full px-4 py-2 rounded-lg bg-white/15 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
      />
      {open && results.length > 0 && (
        <ul className="absolute top-full mt-1 w-full bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
          {results.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => handleSelect(s.id)}
                className="w-full text-left px-4 py-2 hover:bg-purple-100 transition-colors flex items-center gap-3"
              >
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-8 h-12 object-cover rounded"
                  loading="lazy"
                />
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.category} &middot; {s.year}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
