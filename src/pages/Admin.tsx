import React, { useState, useEffect } from 'react';
import { 
  AdminRentalContract, 
  UserInfo, 
  BookingContractDetail, 
  PaymentContractDetail, 
  RefundContractDetail,
  UserRentalContracts 
} from '../types';
import { 
  getAllRentalContracts, 
  getUserById,
  getBookingContractById,
  getPaymentContractById,
  getRefundContractById,
  getRentalContractsByUserId 
} from '../services/apiService';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import '../styles/pages/admin.css';

const Admin: React.FC = () => {
  const [contracts, setContracts] = useState<AdminRentalContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userSearchId, setUserSearchId] = useState('');
  const [searchedUser, setSearchedUser] = useState<UserInfo | null>(null);
  const [userContracts, setUserContracts] = useState<UserRentalContracts[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingContractDetail | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentContractDetail | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundContractDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'user'>('all'); // 'all' | 'user'

  const fetchAllContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllRentalContracts();
      setContracts(data);
      setViewMode('all');
      setSearchedUser(null);
      setUserContracts([]);
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
      const userContractsData = await getRentalContractsByUserId(userSearchId.trim());
      setSearchedUser(user);
      setUserContracts(userContractsData);
      setViewMode('user');
      setContracts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Пользователь не найден');
      setSearchedUser(null);
      setUserContracts([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleBookingClick = async (bookingId: string) => {
    try {
      setDetailLoading(true);
      const bookingData = await getBookingContractById(bookingId);
      setSelectedBooking(bookingData[0]);
      setShowBookingModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки информации о брони');
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePaymentClick = async (paymentId: string) => {
    try {
      setDetailLoading(true);
      const paymentData = await getPaymentContractById(paymentId);
      setSelectedPayment(paymentData);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки информации об оплате');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefundClick = async (refundId: string) => {
    try {
      setDetailLoading(true);
      const refundData = await getRefundContractById(refundId);
      setSelectedRefund(refundData);
      setShowRefundModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки информации о возврате');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const clearSearch = () => {
    setUserSearchId('');
    setSearchedUser(null);
    setUserContracts([]);
    setViewMode('all');
    setContracts([]);
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
          {loading ? 'Загрузка...' : '📋 Все договоры'}
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

        {(searchedUser || viewMode === 'user') && (
          <button 
            className="btn btn-secondary"
            onClick={clearSearch}
          >
            ✕ Очистить поиск
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Блок информации о пользователе */}
      {searchedUser && viewMode === 'user' && (
        <div className="user-info-section">
          <div className="user-info-card">
            <h2>Информация о пользователе</h2>
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
          </div>
        </div>
      )}

      {/* Таблица всех договоров */}
      {contracts.length > 0 && viewMode === 'all' && (
        <div className="contracts-table-container">
          <h2>Все договоры аренды ({contracts.length})</h2>
          
          <div className="table-wrapper">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>ID договора</th>
                  <th>ID брони</th>
                  <th>ID оплаты</th>
                  <th>ID возврата</th>
                  <th>ID арендатора</th>
                  <th>ID владельца</th>
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
                    <td className="clickable-id">
                      <span 
                        title={contract.idBooking}
                        onClick={() => handleBookingClick(contract.idBooking)}
                      >
                        {contract.idBooking}
                      </span>
                    </td>
                    <td className="clickable-id">
                      <span 
                        title={contract.idPayment}
                        onClick={() => handlePaymentClick(contract.idPayment)}
                      >
                        {contract.idPayment}
                      </span>
                    </td>
                    <td className="clickable-id">
                      {contract.idRefund ? (
                        <span 
                          title={contract.idRefund}
                          onClick={() => handleRefundClick(contract.idRefund!)}
                        >
                          {contract.idRefund}
                        </span>
                      ) : (
                        <span className="no-refund">—</span>
                      )}
                    </td>
                    <td className="user-id">
                      <span 
                        title={contract.customerId.toString()}
                        onClick={() => {
                          setUserSearchId(contract.customerId.toString());
                          handleUserSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                      >
                        {contract.customerId}
                      </span>
                    </td>
                    <td className="user-id">
                      <span 
                        title={contract.ownerId.toString()}
                        onClick={() => {
                          setUserSearchId(contract.ownerId.toString());
                          handleUserSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                      >
                        {contract.ownerId}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Таблица договоров пользователя */}
      {userContracts.length > 0 && viewMode === 'user' && (
        <div className="contracts-table-container">
          <h2>Договоры пользователя ({userContracts.length})</h2>
          
          <div className="table-wrapper">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>ID договора</th>
                  <th>ID брони</th>
                  <th>ID оплаты</th>
                  <th>ID возврата</th>
                  <th>ID арендатора</th>
                  <th>ID владельца</th>
                  <th>Роль</th>
                </tr>
              </thead>
              <tbody>
                {userContracts.map((contract) => (
                  <tr key={contract.id}>
                    <td className="contract-id">
                      <span title={contract.id}>
                        {contract.id}
                      </span>
                    </td>
                    <td className="clickable-id">
                      <span 
                        title={contract.idBooking}
                        onClick={() => handleBookingClick(contract.idBooking)}
                      >
                        {contract.idBooking}
                      </span>
                    </td>
                    <td className="clickable-id">
                      <span 
                        title={contract.idPayment}
                        onClick={() => handlePaymentClick(contract.idPayment)}
                      >
                        {contract.idPayment}
                      </span>
                    </td>
                   <td className="clickable-id">
                      {contract.idRefund ? (
                        <span 
                          title={contract.idRefund}
                          onClick={() => handleRefundClick(contract.idRefund!)}
                        >
                          {contract.idRefund}
                        </span>
                      ) : (
                        <span className="no-refund">—</span>
                      )}
                    </td>
                    <td className="user-id">
                      {contract.customerId}
                    </td>
                    <td className="user-id">
                      {contract.ownerId}
                    </td>
                    <td className="user-role">
                      <span className={`role-badge ${contract.customerId.toString() === searchedUser?.id.toString() ? 'customer' : 'owner'}`}>
                        {contract.customerId.toString() === searchedUser?.id.toString() ? 'Арендатор' : 'Владелец'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contracts.length === 0 && userContracts.length === 0 && !loading && viewMode === 'all' && (
        <div className="no-data">
          <p>Нажмите "Все договоры" для отображения данных или найдите пользователя по ID</p>
        </div>
      )}

      {userContracts.length === 0 && searchedUser && !userSearchLoading && (
        <div className="no-data">
          <p>У пользователя нет договоров аренды</p>
        </div>
      )}

      {/* Модальные окна для детальной информации */}
      <Modal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        title="Информация о бронировании"
      >
        {detailLoading ? (
          <Loader />
        ) : selectedBooking ? (
          <div className="booking-info">
            <div className="info-grid">
              <div className="info-item">
                <strong>ID брони:</strong>
                <span>{selectedBooking.id}</span>
              </div>
              <div className="info-item">
                <strong>Товар:</strong>
                <span>{selectedBooking.productName}</span>
              </div>
              <div className="info-item">
                <strong>ID товара:</strong>
                <span>{selectedBooking.productId}</span>
              </div>
              <div className="info-item">
                <strong>Период:</strong>
                <span>{formatDate(selectedBooking.startRentDate)} - {formatDate(selectedBooking.endRentDate)}</span>
              </div>
              <div className="info-item">
                <strong>Количество:</strong>
                <span>{selectedBooking.quantity} шт.</span>
              </div>
              <div className="info-item">
                <strong>Цена за день:</strong>
                <span>{selectedBooking.rentalPrice} ₽</span>
              </div>
              <div className="info-item">
                <strong>Дата брони:</strong>
                <span>{formatDate(selectedBooking.bookingDate)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">Информация не найдена</div>
        )}
      </Modal>

      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        title="Информация об оплате"
      >
        {detailLoading ? (
          <Loader />
        ) : selectedPayment ? (
          <div className="payment-info">
            <div className="info-grid">
              <div className="info-item">
                <strong>ID оплаты:</strong>
                <span>{selectedPayment.id}</span>
              </div>
              <div className="info-item">
                <strong>ID брони:</strong>
                <span>{selectedPayment.bookingId}</span>
              </div>
              <div className="info-item">
                <strong>Полная стоимость:</strong>
                <span className="price">{selectedPayment.fullPrice} ₽</span>
              </div>
              <div className="info-item">
                <strong>ID арендатора:</strong>
                <span>{selectedPayment.customerId}</span>
              </div>
              <div className="info-item">
                <strong>ID владельца:</strong>
                <span>{selectedPayment.ownerId}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">Информация не найдена</div>
        )}
      </Modal>

      <Modal 
        isOpen={showRefundModal} 
        onClose={() => setShowRefundModal(false)}
        title="Информация о возврате"
      >
        {detailLoading ? (
          <Loader />
        ) : selectedRefund ? (
          <div className="refund-info">
            <div className="info-grid">
              <div className="info-item">
                <strong>ID возврата:</strong>
                <span>{selectedRefund.id}</span>
              </div>
              <div className="info-item">
                <strong>ID договора аренды:</strong>
                <span>{selectedRefund.rentalId}</span>
              </div>
              <div className="info-item full-width">
                <strong>Причина возврата:</strong>
                <div className="refund-description">{selectedRefund.description}</div>
              </div>
              <div className="info-item">
                <strong>ID пользователя:</strong>
                <span>{selectedRefund.userId}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">Информация не найдена</div>
        )}
      </Modal>
    </div>
  );
};

export default Admin;