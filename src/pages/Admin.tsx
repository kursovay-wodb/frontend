import React, { useState, useEffect } from 'react';
import { AdminRentalContract, UserInfo } from '../types';
import { getAllRentalContracts, getUserById } from '../services/apiService';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import '../styles/pages/admin.css';

const Admin: React.FC = () => {
  const [contracts, setContracts] = useState<AdminRentalContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userSearchId, setUserSearchId] = useState('');
  const [searchedUser, setSearchedUser] = useState<UserInfo | null>(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchAllContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllRentalContracts();
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки договоров');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSearchId.trim()) return;

    try {
      setUserSearchLoading(true);
      setError('');
      const user = await getUserById(userSearchId.trim());
      setSearchedUser(user);
      setShowUserModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Пользователь не найден');
      setSearchedUser(null);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Панель администратора</h1>
        <p>Управление всеми договорами аренды</p>
      </div>

      <div className="admin-actions">
        <button 
          className="btn btn-primary"
          onClick={fetchAllContracts}
          disabled={loading}
        >
          {loading ? 'Загрузка...' : '📋 Загрузить все договоры'}
        </button>

        <form onSubmit={handleUserSearch} className="user-search-form">
          <input
            type="text"
            value={userSearchId}
            onChange={(e) => setUserSearchId(e.target.value)}
            placeholder="Введите ID пользователя"
            className="user-search-input"
          />
          <button 
            type="submit" 
            className="btn btn-secondary"
            disabled={userSearchLoading || !userSearchId.trim()}
          >
            {userSearchLoading ? 'Поиск...' : '🔍 Найти пользователя'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {contracts.length > 0 && (
        <div className="contracts-table-container">
          <h2>Все договоры аренды ({contracts.length})</h2>
          
          <div className="table-wrapper">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>ID договора</th>
                  <th>Товар</th>
                  <th>ID арендатора</th>
                  <th>ID владельца</th>
                  <th>Период</th>
                  <th>Кол-во</th>
                  <th>Стоимость</th>
                  <th>Дней</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td className="contract-id">
                      <span title={contract.id}>
                        {contract.id}
                      </span>
                    </td>
                    <td className="product-name">{contract.productName}</td>
                    <td className="user-id">
                      <span 
                        title={contract.customerId}
                        onClick={() => {
                          setUserSearchId(contract.customerId);
                          handleUserSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                      >
                        {contract.customerId}
                      </span>
                    </td>
                    <td className="user-id">
                      <span 
                        title={contract.ownerId}
                        onClick={() => {
                          setUserSearchId(contract.ownerId);
                          handleUserSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                      >
                        {contract.ownerId}
                      </span>
                    </td>
                    <td className="rent-period">
                      {formatDate(contract.startRentDate)} - {formatDate(contract.endRentDate)}
                    </td>
                    <td className="quantity">{contract.quantity} шт.</td>
                    <td className="price">{contract.fullPrice} ₽</td>
                    <td className="days">
                      {calculateDays(contract.startRentDate, contract.endRentDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contracts.length === 0 && !loading && (
        <div className="no-data">
          <p>Нажмите "Загрузить все договоры" для отображения данных</p>
        </div>
      )}

   <Modal 
  isOpen={showUserModal} 
  onClose={() => setShowUserModal(false)}
  title="Информация о пользователе"
>
  {searchedUser ? (
    <div className="user-info">
      <div className="user-info-grid">
        <div className="user-info-item">
          <strong>ID:</strong>
          <span className="user-id-value">{searchedUser.id}</span>
        </div>
        <div className="user-info-item">
          <strong>Имя:</strong>
          <span>{searchedUser.name}</span>
        </div>
        <div className="user-info-item">
          <strong>Email:</strong>
          <span>{searchedUser.email}</span>
        </div>
        <div className="user-info-item">
          <strong>Роль:</strong>
          <span className={`role-badge ${searchedUser.role?.toLowerCase()}`}>
            {searchedUser.role}
          </span>
        </div>
        <div className="user-info-item">
          <strong>Сделок как владелец:</strong>
          <span className="deals-count">{searchedUser.dealsAsOwner}</span>
        </div>
        <div className="user-info-item">
          <strong>Сделок как арендатор:</strong>
          <span className="deals-count">{searchedUser.dealsAsCustomer}</span>
        </div>
        <div className="user-info-item">
          <strong>Провайдер:</strong>
          <span className="provider-badge">{searchedUser.provider}</span>
        </div>
      </div>

      <div className="user-actions">
     
        <button 
          className="btn btn-primary"
          onClick={() => setShowUserModal(false)}
        >
            Закрыть
        </button>
      </div>
    </div>
  ) : (
    <div className="user-not-found">
      <div className="not-found-icon">❌</div>
      <p>Пользователь не найден</p>
    </div>
  )}
</Modal>
    </div>
  );
};

export default Admin;