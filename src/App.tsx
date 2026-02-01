import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DirectoryPage from './pages/DirectoryPage';
import ChangesPage from './pages/ChangesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import RequestPage from './pages/RequestPage';
import './styles/Directory.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DirectoryPage />} />
        <Route path="/changes" element={<ChangesPage />} />
        <Route path="/company/:id" element={<CompanyDetailPage />} />
        <Route path="/request" element={<RequestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
