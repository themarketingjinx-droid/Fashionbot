import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Gallery from './pages/Gallery';
import PieceDetail from './pages/PieceDetail';
import TryOn from './pages/TryOn';
import Designer from './pages/Designer';
import Wardrobe from './pages/Wardrobe';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/piece/:id" element={<PieceDetail />} />
        <Route path="/tryon/:id" element={<TryOn />} />
        <Route path="/designer" element={<Designer />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
      </Routes>
    </BrowserRouter>
  );
}
