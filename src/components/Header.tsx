import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeaderProps } from '../types';
import { useAdminCheck } from '../hooks/useAdminCheck';

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminCheck();

  const handleLogout = (): void => {
    onLogout();
    navigate('/');
  };

   return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          АрендаОборудования
        </Link>
        
        <nav className="nav">
          {isAuthenticated ? (
            <div className="auth-links">
              <Link to="/products" className="nav-link">
                Товары
              </Link>
              <Link to="/profile" className="nav-link">
                Личный кабинет
              </Link>
              {!loading && isAdmin && (
                <Link to="/admin" className="nav-link">
                  Админка
                </Link>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">
                Вход
              </Link>
              <Link to="/registration" className="nav-link">
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;