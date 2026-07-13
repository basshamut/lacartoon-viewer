import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import SerieDetail from './pages/SerieDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/serie/:id" element={<SerieDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
