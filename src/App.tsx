import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import Layout from './components/layout/Layout';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OAuthCallback from './components/auth/OAuthCallback';
import AboutYouPage from './pages/AboutYouPage';
import DocumentationPage from './pages/DocumentationPage';

function App() {
  return (
    <Layout>
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutYouPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/:provider/callback" element={<OAuthCallback />} />
          
          {/* Protected Routes */}
          <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
          <Route path="/documents" element={<DocumentationPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </Layout>
  );
}

export default App;
