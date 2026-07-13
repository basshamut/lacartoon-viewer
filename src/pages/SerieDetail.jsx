import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSerieById } from '../data/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import VideoPlayer from '../components/VideoPlayer';

export default function SerieDetail() {
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [favorites, setFavorites] = useLocalStorage('lacartoons-favorites', []);

  const isFavorite = favorites.includes(Number(id));

  useEffect(() => {
    setLoading(true);
    getSerieById(id).then((data) => {
      setSerie(data);
      if (data?.episodes?.length > 0) {
        setSelectedEpisode(data.episodes[0]);
      }
      setLoading(false);
    });
  }, [id]);

  function toggleFavorite() {
    const numId = Number(id);
    if (favorites.includes(numId)) {
      setFavorites(favorites.filter((f) => f !== numId));
    } else {
      setFavorites([...favorites, numId]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Cargando serie...</div>
      </div>
    );
  }

  if (!serie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-gray-500 text-lg">Serie no encontrada</div>
        <Link to="/" className="text-purple-700 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const seasons = {};
  serie.episodes.forEach((ep) => {
    if (!seasons[ep.season]) seasons[ep.season] = [];
    seasons[ep.season].push(ep);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link to="/" className="text-purple-700 hover:underline text-sm mb-4 inline-block">
        &larr; Volver
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <img
            src={serie.image}
            alt={serie.name}
            className="w-full max-w-xs mx-auto lg:mx-0 rounded-xl shadow-lg"
          />
          <div className="mt-4 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-gray-800">{serie.name}</h1>
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-2 text-sm text-gray-600">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {serie.category}
              </span>
              <span>{serie.year}</span>
              <span className="text-yellow-500">&#9733; {serie.rating}</span>
            </div>
            <button
              onClick={toggleFavorite}
              className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isFavorite
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isFavorite ? '&#10084; En favoritos' : '&#9825; Agregar a favoritos'}
            </button>
          </div>
        </div>

        <div className="lg:w-2/3">
          <VideoPlayer episode={selectedEpisode} />

          <div className="mt-6 space-y-4">
            {Object.entries(seasons).map(([season, episodes]) => (
              <details key={season} open className="bg-gray-50 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors">
                  Temporada {season}
                </summary>
                <ul className="divide-y divide-gray-200">
                  {episodes.map((ep) => (
                    <li key={ep.id}>
                      <button
                        onClick={() => setSelectedEpisode(ep)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedEpisode?.id === ep.id
                            ? 'bg-purple-100 text-purple-800'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">Ep. {ep.episode}</span>
                        <span className="ml-2">{ep.title}</span>
                        {!ep.videoUrl && (
                          <span className="ml-2 text-xs text-gray-400">(cargando...)</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
