import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { getAllProducts, getAvailableProducts } from '../services/apiService';
import Loader from '../components/Loader';
import '../styles/pages/products.css';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = showAvailableOnly 
        ? await getAvailableProducts()
        : await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [showAvailableOnly]);

  const toggleAvailabilityFilter = () => {
    setShowAvailableOnly(!showAvailableOnly);
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Каталог оборудования</h1>
        <button 
          className={`filter-toggle ${showAvailableOnly ? 'active' : ''}`}
          onClick={toggleAvailabilityFilter}
        >
          {showAvailableOnly ? 'Все' : 'В наличии'}
        </button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>Товары не найдены</p>
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const isAvailable = product.quantity > 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card-link">
      <div className={`product-card ${!isAvailable ? 'out-of-stock' : ''}`}>
        {!isAvailable && (
          <div className="out-of-stock-overlay">
            <span>Нет в наличии</span>
          </div>
        )}
        
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.equipmentType.name}</p>
          <p className="product-price">{product.rentalPrice} ₽/сутки</p>
          <div className="product-stock">
            <span className={`stock-status ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
              {isAvailable ? `В наличии: ${product.quantity}` : 'Нет в наличии'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Products;