import { Link } from 'react-router-dom';

export default function SerieCard({ serie }) {
  return (
    <Link
      to={`/serie/${serie.id}`}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[2/3] overflow-hidden bg-gray-200">
        <img
          src={serie.image}
          alt={serie.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
          {serie.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            {serie.category}
          </span>
          <span>{serie.year}</span>
          <span className="text-yellow-500">&#9733; {serie.rating}</span>
        </div>
      </div>
    </Link>
  );
}
