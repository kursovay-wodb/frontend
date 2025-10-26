import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import './styles/variable.css';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import { getToken, removeToken } from './services/authService';
import './styles/app.css';
import PrivateRoute from './components/PrivateRoute';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';

// Компонент для обработки OAuth2 редиректа
const OAuth2RedirectHandler = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      onLogin(token);
      navigate('/');
    } else if (error) {
      console.error('OAuth2 Error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
    } else {
      navigate('/');
    }
  }, [searchParams, onLogin, navigate]);

  return <div className="loading">Обработка входа...</div>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = (token: string): void => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = (): void => {
    removeToken();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? 
                <Login onLogin={handleLogin} /> : 
                <Navigate to="/" replace />
              } 
            />

            <Route 
              path="/registration" 
              element={
                !isAuthenticated ? 
                <Registration onLogin={handleLogin} /> : 
                <Navigate to="/" replace />
              } 
            />

            <Route 
              path="/oauth2/redirect" 
              element={<OAuth2RedirectHandler onLogin={handleLogin} />} 
            />

             <Route 
              path="/products" 
              element={
                <PrivateRoute>
                  <Products />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/product/:productId" 
              element={
                <PrivateRoute>
                  <ProductDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;