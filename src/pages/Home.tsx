import React from 'react';
import { Link } from 'react-router-dom';
import { HomeProps } from '../types';
import '../styles/pages/home.css';

const Home: React.FC<HomeProps> = ({ isAuthenticated }) => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          Платформа аренды оборудования
        </h1>
        <p className="hero-subtitle">
          Находите и арендуйте любое оборудование для ваших нужд
        </p>
        
        {!isAuthenticated ? (
          <div className="hero-actions">
            <Link to="/registration" className="btn btn-primary">
              Начать использовать
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Уже есть аккаунт
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
             {/*
            <Link to="/products" className="btn btn-secondary">
              🔍 Найти оборудование
            </Link>
            */}
            <Link to="/products" className="btn btn-primary">
              🛠️ Все товары
            </Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2 className="features-title">Почему выбирают нас?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h3>Широкий выбор</h3>
            <p>Оборудование для строительства, мероприятий, производства и многое другое</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Экономия</h3>
            <p>Арендуйте вместо покупки - экономьте средства и пространство</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Быстро</h3>
            <p>Находите и бронируйте оборудование за несколько минут</p>
          </div>

          {/*
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Надежно</h3>
            <p>Все арендодатели проходят проверку, безопасные сделки</p>
          </div>
          */}


        </div>
      </div>

      {isAuthenticated && (
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Добро пожаловать!</h2>
            <p>Теперь вы можете начать поиск оборудования для аренды или посмотреть все доступные товары.</p>
            <div className="welcome-actions">
              <Link to="/products" className="btn btn-primary btn-large">
                🚀 Начать поиск оборудования
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;