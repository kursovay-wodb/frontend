import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EquipmentType, ProductInput, RentalContract, BookingContract, PaymentContract, RentalContractUser, RefundRequest } from '../types';
import { 
  getEquipmentTypes, 
  createProduct, 
  getRentalContractsAsOwnerByUser,
  getBookingContracts,
  cancelBooking,
  createPayment,
  getRentalContractsAsCustomerByUser,
  createRefund
} from '../services/apiService';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import '../styles/pages/profile.css';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'bookings' | 'customer' | 'owner'>('add');
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEquipmentTypes = async () => {
      try {
        setLoading(true);
        const types = await getEquipmentTypes();
        setEquipmentTypes(types);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки типов оборудования');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentTypes();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Личный кабинет</h1>
        <p>Управление вашими товарами и арендами</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          🛠️ Добавить товар
        </button>
        <button 
          className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📋 Мои брони
        </button>
        <button 
          className={`tab-button ${activeTab === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveTab('customer')}
        >
          📥 Мои аренды (как арендатор)
        </button>
        <button 
          className={`tab-button ${activeTab === 'owner' ? 'active' : ''}`}
          onClick={() => setActiveTab('owner')}
        >
          📤 Мои аренды (как владелец)
        </button>
      </div>

      <div className="tab-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'add' && (
          <AddProductForm 
            equipmentTypes={equipmentTypes}
            loading={loading}
            onSuccess={(message) => {
              setSuccess(message);
              setError('');
            }}
            onError={(message) => {
              setError(message);
              setSuccess('');
            }}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsList />
        )}

        {activeTab === 'customer' && (
          <RentalContractsList type="customer" />
        )}

        {activeTab === 'owner' && (
          <RentalContractsList type="owner" />
        )}
      </div>
    </div>
  );
};

// Компонент формы добавления товара
interface AddProductFormProps {
  equipmentTypes: EquipmentType[];
  loading: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ 
  equipmentTypes, 
  loading, 
  onSuccess, 
  onError 
}) => {
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    description: '',
    rentalPrice: 0,
    quantity: 1,
    minRentalPeriod: 1,
    maxRentalPeriod: 30,
    image: '',
    equipmentTypeId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rentalPrice' || name === 'quantity' || name === 'minRentalPeriod' || name === 'maxRentalPeriod' 
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rentalPrice || !formData.equipmentTypeId) {
      onError('Пожалуйста, заполните обязательные поля');
      return;
    }

    if (formData.rentalPrice <= 0) {
      onError('Цена аренды должна быть больше 0');
      return;
    }

    if (formData.quantity <= 0) {
      onError('Количество должно быть больше 0');
      return;
    }

    try {
      setSubmitting(true);
      
      const productData: ProductInput = {
        name: formData.name,
        description: formData.description || 'Нет описания к товару',
        rentalPrice: formData.rentalPrice,
        quantity: formData.quantity,
        minRentalPeriod: formData.minRentalPeriod || 1,
        maxRentalPeriod: formData.maxRentalPeriod || 30,
        image: formData.image || 'https://cdn1.ozone.ru/s3/multimedia-1-x/c600/7369103769.jpg',
        equipmentTypeId: formData.equipmentTypeId
      };

      await createProduct(productData);
      
      onSuccess('Товар успешно добавлен в аренду!');
      
      setFormData({
        name: '',
        description: '',
        rentalPrice: 0,
        quantity: 1,
        minRentalPeriod: 1,
        maxRentalPeriod: 30,
        image: '',
        equipmentTypeId: ''
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Ошибка при добавлении товара');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-form">
      <h2>Добавить товар в аренду</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Название товара *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Введите название товара"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Тип оборудования *</label>
            <select
              name="equipmentTypeId"
              value={formData.equipmentTypeId}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={loading}
            >
              <option value="">Выберите тип</option>
              {equipmentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {loading && <div className="input-hint">Загрузка типов...</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Описание товара</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Опишите ваш товар (необязательно)"
            rows={3}
          />
          <div className="input-hint">Если не заполните, будет установлено "Нет описания к товару"</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Цена аренды (в сутки) *</label>
            <input
              type="number"
              name="rentalPrice"
              value={formData.rentalPrice}
              onChange={handleInputChange}
              className="form-input"
              placeholder="0"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Количество *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="form-input"
              placeholder="1"
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Минимальный период аренды (дней)</label>
            <input
              type="number"
              name="minRentalPeriod"
              value={formData.minRentalPeriod}
              onChange={handleInputChange}
              className="form-input"
              placeholder="1"
              min="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Максимальный период аренды (дней)</label>
            <input
              type="number"
              name="maxRentalPeriod"
              value={formData.maxRentalPeriod}
              onChange={handleInputChange}
              className="form-input"
              placeholder="30"
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ссылка на изображение</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
          <div className="input-hint">Если не заполните, будет установлено стандартное изображение</div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary submit-btn"
          disabled={submitting || loading}
        >
          {submitting ? 'Добавление...' : 'Добавить товар'}
        </button>
      </form>
    </div>
  );
};

// Список бронирований
const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<BookingContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookingContracts();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки бронирований');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setProcessing(bookingId);
      await cancelBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отмены бронирования');
    } finally {
      setProcessing(null);
    }
  };

  const handlePayment = async (bookingId: string) => {
    try {
      setProcessing(bookingId);
      await createPayment(bookingId);
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка оплаты бронирования');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="contracts-list">
      <h2>Мои брони</h2>
      
      {bookings.length === 0 ? (
        <div className="no-contracts">
          <p>Бронирований не найдено</p>
          <Link to="/products" className="btn btn-primary">
            Найти оборудование
          </Link>
        </div>
      ) : (
        <div className="contracts-grid">
          {bookings.map(booking => (
            <div key={booking.id} className="contract-card">
              <div className="contract-header">
                <h3 className="contract-product">{booking.productName}</h3>
                <div className="contract-price">{booking.rentalPrice} ₽/день</div>
              </div>
              
              <div className="contract-details">
                <div className="contract-detail">
                  <span className="detail-label">Период:</span>
                  <span className="detail-value">
                    {booking.startRentDate} - {booking.endRentDate}
                  </span>
                </div>
                <div className="contract-detail">
                  <span className="detail-label">Количество:</span>
                  <span className="detail-value">{booking.quantity} шт.</span>
                </div>
                <div className="contract-detail">
                  <span className="detail-label">Дата брони:</span>
                  <span className="detail-value">{booking.bookingDate}</span>
                </div>
                <div className="contract-detail">
                  <span className="detail-label">Статус оплаты:</span>
                  <span className={`detail-value ${booking.paid ? 'status-paid' : 'status-unpaid'}`}>
                    {booking.paid ? 'Оплачено' : 'Ожидает оплаты'}
                  </span>
                </div>
                <div className="contract-detail">
                  <span className="detail-label">ID брони:</span>
                  <span className="detail-value contract-id">{booking.id}</span>
                </div>
              </div>

              {!booking.paid ? (
                <div className="contract-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handlePayment(booking.id)}
                    disabled={processing === booking.id}
                  >
                    {processing === booking.id ? 'Оплата...' : 'Оплатить'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={processing === booking.id}
                  >
                    {processing === booking.id ? 'Отмена...' : 'Отменить'}
                  </button>
                </div>
              ) : (
                <div className="paid-badge">
                  <span>✅ Оплачено</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Список аренд
interface RentalContractsListProps {
  type: 'customer' | 'owner';
}

const RentalContractsList: React.FC<RentalContractsListProps> = ({ type }) => {
  const [contracts, setContracts] = useState<RentalContractUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<RentalContractUser | null>(null);
  const [refundDescription, setRefundDescription] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      let data: RentalContractUser[];
      
      if (type === 'customer') {
        data = await getRentalContractsAsCustomerByUser();
      } else {
        data = await getRentalContractsAsOwnerByUser();
      }
      
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки аренд');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [type]);

  const handleRefundClick = (contract: RentalContractUser) => {
    setSelectedContract(contract);
    setRefundDescription('');
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async () => {
    if (!selectedContract || !refundDescription.trim()) {
      setError('Пожалуйста, укажите причину возврата');
      return;
    }

    try {
      setProcessing(selectedContract.id);
      const refundData: RefundRequest = {
        rentalId: selectedContract.id,
        description: refundDescription.trim()
      };
      
      await createRefund(refundData);
      
      await fetchContracts();
      
      setShowRefundModal(false);
      setSelectedContract(null);
      setRefundDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка оформления возврата');
    } finally {
      setProcessing(null);
    }
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setSelectedContract(null);
    setRefundDescription('');
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="contracts-list">
        <h2>{type === 'customer' ? 'Мои аренды (как арендатор)' : 'Мои аренды (как владелец)'}</h2>
        
        {contracts.length === 0 ? (
          <div className="no-contracts">
            <p>Аренд не найдено</p>
            {type === 'customer' && (
              <Link to="/products" className="btn btn-primary">
                Найти оборудование
              </Link>
            )}
          </div>
        ) : (
          <div className="contracts-grid">
            {contracts.map(contract => (
              <div 
                key={contract.id} 
                className={`contract-card ${contract.idRefund ? 'refunded' : ''}`}
              >
                {contract.idRefund && (
                  <div className="refund-overlay">
                    <div className="refund-badge">Аренда отменена</div>
                  </div>
                )}
                
                <div className="contract-header">
                  <h3 className="contract-product">Договор аренды</h3>
                  <div className="contract-price">#{contract.id.substring(0, 8)}...</div>
                </div>
                
                <div className="contract-details">
                  <div className="contract-detail">
                    <span className="detail-label">ID договора:</span>
                    <span className="detail-value contract-id">{contract.id}</span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">ID брони:</span>
                    <span className="detail-value contract-id">{contract.idBooking}</span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">ID платежа:</span>
                    <span className="detail-value contract-id">{contract.idPayment}</span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">ID возврата:</span>
                    <span className="detail-value contract-id">
                      {contract.idRefund || 'Не оформлен'}
                    </span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">ID владельца:</span>
                    <span className="detail-value">{contract.ownerId}</span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">ID клиента:</span>
                    <span className="detail-value">{contract.customerId}</span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">Роль:</span>
                    <span className={`detail-value ${type === 'customer' ? 'role-customer' : 'role-owner'}`}>
                      {type === 'customer' ? 'Арендатор' : 'Владелец'}
                    </span>
                  </div>
                </div>

                {/* Кнопка возврата показывается только для арендатора и если возврат еще не оформлен */}
                {type === 'customer' && !contract.idRefund && (
                  <div className="contract-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleRefundClick(contract)}
                      disabled={processing === contract.id}
                    >
                      {processing === contract.id ? 'Оформление...' : 'Вернуть'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно возврата (только для арендатора) */}
      {type === 'customer' && (
        <Modal 
          isOpen={showRefundModal} 
          onClose={closeRefundModal}
          title="Оформление возврата"
        >
          <div className="refund-modal-content">
            <p>Вы уверены, что хотите оформить возврат для договора аренды?</p>
            <div className="contract-info">
              <strong>ID договора:</strong> {selectedContract?.id}
            </div>
            
            <div className="form-group">
              <label className="form-label">Причина возврата *</label>
              <textarea
                value={refundDescription}
                onChange={(e) => setRefundDescription(e.target.value)}
                className="form-input"
                placeholder="Опишите причину возврата..."
                rows={4}
                required
              />
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={closeRefundModal}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRefundSubmit}
                disabled={!refundDescription.trim() || processing === selectedContract?.id}
              >
                {processing === selectedContract?.id ? 'Оформление...' : 'Оформить возврат'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
export default Profile;