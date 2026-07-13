import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap">
          LaCartoons Next
        </Link>
        <SearchBar />
        <nav className="flex gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-purple-200 transition-colors hidden sm:block">
            Inicio
          </Link>
        </nav>
      </div>
    </header>
  );
}
