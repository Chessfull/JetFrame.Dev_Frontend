import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';

// Import CSS but without TS checking for module
import './App.css';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/documents" element={<div className="container-fluid py-24"><h1>Documents Page - Coming Soon</h1></div>} />
        <Route path="/about" element={<div className="container-fluid py-24"><h1>About Page - Coming Soon</h1></div>} />
      </Routes>
    </Layout>
  );
}

export default App;
