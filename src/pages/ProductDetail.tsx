import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, RentalRequest, BookingResponse } from '../types';
import { getProductById, createBooking } from '../services/apiService';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import '../styles/pages/product-detail.css';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rentalData, setRentalData] = useState<RentalRequest>({
    productId: productId || '',
    startRentDate: '',
    endRentDate: '',
    quantity: 1
  });
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dateErrors, setDateErrors] = useState<{
    startDate?: string;
    endDate?: string;
    period?: string;
  }>({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
        setRentalData(prev => ({ ...prev, productId}));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Функция для получения минимальной даты (сегодня)
  const getMinDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Функция для получения максимальной даты (выбранная дата начала + maxRentalPeriod)
  const getMaxDate = (startDate?: string): string => {
    if (!product?.maxRentalPeriod || !startDate) return '';
    const start = new Date(startDate);
    const maxDate = new Date(start);
    maxDate.setDate(start.getDate() + product.maxRentalPeriod);
    return maxDate.toISOString().split('T')[0];
  };

  // Функция для получения минимальной даты окончания (выбранная дата начала + minRentalPeriod)
  const getMinEndDate = (startDate?: string): string => {
    if (!product?.minRentalPeriod || !startDate) return startDate || '';
    const start = new Date(startDate);
    const minEndDate = new Date(start);
    minEndDate.setDate(start.getDate() + product.minRentalPeriod);
    return minEndDate.toISOString().split('T')[0];
  };

  // Валидация дат
  const validateDates = (startDate: string, endDate: string): boolean => {
    const errors: typeof dateErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Проверка даты начала
    if (start < today) {
      errors.startDate = 'Дата начала не может быть в прошлом';
    }

    // Проверка даты окончания
    if (end < start) {
      errors.endDate = 'Дата окончания не может быть раньше даты начала';
    }

    // Проверка минимального периода
    if (product?.minRentalPeriod) {
      const minEndDate = new Date(start);
      minEndDate.setDate(start.getDate() + product.minRentalPeriod);
      
      if (end < minEndDate) {
        const daysDiff = Math.ceil((minEndDate.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
        errors.period = `Минимальный период аренды: ${product.minRentalPeriod} дней. Не хватает ${daysDiff} дней`;
      }
    }

    // Проверка максимального периода
    if (product?.maxRentalPeriod) {
      const maxEndDate = new Date(start);
      maxEndDate.setDate(start.getDate() + product.maxRentalPeriod);
      
      if (end > maxEndDate) {
        const daysOver = Math.ceil((end.getTime() - maxEndDate.getTime()) / (1000 * 60 * 60 * 24));
        errors.period = `Максимальный период аренды: ${product.maxRentalPeriod} дней. Превышение на ${daysOver} дней`;
      }
    }

    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setRentalData(prev => ({
      ...prev,
      startRentDate: newStartDate,
      endRentDate: ''
    }));

    setDateErrors({});
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setRentalData(prev => ({
      ...prev,
      endRentDate: newEndDate
    }));

    // Валидируем, если есть обе даты
    if (rentalData.startRentDate && newEndDate) {
      validateDates(rentalData.startRentDate, newEndDate);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRentalData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value
    }));
  };

  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    // Финальная валидация перед отправкой
    if (!validateDates(rentalData.startRentDate, rentalData.endRentDate)) {
      return;
    }

    try {
      setRentalLoading(true);
      const response = await createBooking(rentalData);
      setBookingResponse(response);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка оформления бронирования');
    } finally {
      setRentalLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/products');
  };

  const handleContinueRenting = () => {
    setShowSuccessModal(false);
    navigate('/products');
  };

  // Расчет общего количества дней и цены
  const totalDays = rentalData.startRentDate && rentalData.endRentDate 
    ? Math.ceil((new Date(rentalData.endRentDate).getTime() - new Date(rentalData.startRentDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = totalDays * (product?.rentalPrice || 0) * rentalData.quantity;

  const isFormValid = rentalData.startRentDate && 
                     rentalData.endRentDate && 
                     rentalData.quantity > 0 && 
                     Object.keys(dateErrors).length === 0;

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Товар не найден</div>;

  const isAvailable = product.quantity > 0;

  return (
    <>
      <div className="product-detail-container">
        <div className="product-detail">
          <div className="product-image-section">
            <img src={product.image} alt={product.name} className="product-detail-image" />
            {!isAvailable && (
              <div className="out-of-stock-badge">Нет в наличии</div>
            )}
          </div>

          <div className="product-info-section">
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-category">{product.equipmentType.name}</p>
            <p className="product-detail-description">{product.description}</p>
            
            <div className="product-specs">
              <div className="spec-item">
                <span className="spec-label">Цена аренды:</span>
                <span className="spec-value">{product.rentalPrice} ₽/сутки</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">В наличии:</span>
                <span className={`spec-value ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                  {product.quantity} шт.
                </span>
              </div>
              {product.minRentalPeriod && (
                <div className="spec-item">
                  <span className="spec-label">Мин. период аренды:</span>
                  <span className="spec-value">{product.minRentalPeriod} дней</span>
                </div>
              )}
              {product.maxRentalPeriod && (
                <div className="spec-item">
                  <span className="spec-label">Макс. период аренды:</span>
                  <span className="spec-value">{product.maxRentalPeriod} дней</span>
                </div>
              )}
            </div>

            {isAvailable && (
              <form onSubmit={handleRentalSubmit} className="rental-form">
                <h3>Оформить бронирование</h3>
                
                <div className="form-group">
                  <label>Количество:</label>
                  <input
                    type="number"
                    name="quantity"
                    value={rentalData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max={product.quantity}
                    required
                  />
                  <div className="input-hint">
                    Доступно: {product.quantity} шт.
                  </div>
                </div>

                <div className="form-group">
                  <label>Дата начала:</label>
                  <input
                    type="date"
                    name="startRentDate"
                    value={rentalData.startRentDate}
                    onChange={handleStartDateChange}
                    min={getMinDate()}
                    required
                  />
                  {dateErrors.startDate && (
                    <div className="input-error">{dateErrors.startDate}</div>
                  )}
                  <div className="input-hint">
                    Не ранее сегодняшней даты
                  </div>
                </div>

                <div className="form-group">
                  <label>Дата окончания:</label>
                  <input
                    type="date"
                    name="endRentDate"
                    value={rentalData.endRentDate}
                    onChange={handleEndDateChange}
                    min={getMinEndDate(rentalData.startRentDate)}
                    max={getMaxDate(rentalData.startRentDate)}
                    required
                    disabled={!rentalData.startRentDate}
                  />
                  {dateErrors.endDate && (
                    <div className="input-error">{dateErrors.endDate}</div>
                  )}
                  <div className="input-hint">
                    {rentalData.startRentDate ? (
                      <>
                        Диапазон: от {getMinEndDate(rentalData.startRentDate)} до {getMaxDate(rentalData.startRentDate)}
                        {product.minRentalPeriod && product.maxRentalPeriod && (
                          <span> ({product.minRentalPeriod}-{product.maxRentalPeriod} дней)</span>
                        )}
                      </>
                    ) : (
                      'Сначала выберите дату начала'
                    )}
                  </div>
                </div>

                {dateErrors.period && (
                  <div className="period-error">
                    {dateErrors.period}
                  </div>
                )}

                {totalDays > 0 && (
                  <div className="rental-summary">
                    <div className="rental-period-info">
                      <div className="rental-days">
                        Период аренды: <strong>{totalDays} дней</strong>
                      </div>
                      {product.minRentalPeriod && product.maxRentalPeriod && (
                        <div className="rental-limits">
                          Допустимый период: {product.minRentalPeriod}-{product.maxRentalPeriod} дней
                        </div>
                      )}
                    </div>
                    <h4>Итого: {totalPrice} ₽</h4>
                    <p>{product.rentalPrice} ₽/день × {totalDays} дней × {rentalData.quantity} шт.</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary rent-btn"
                  disabled={rentalLoading || !isFormValid}
                >
                  {rentalLoading ? 'Оформление...' : 'Забронировать'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessClose}
        title="Бронирование оформлено!"
      >
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h3 className="success-title">Бронирование оформлено!</h3>
          <p className="success-message">
            Вы успешно забронировали <strong>{product.name}</strong><br />
            на период с {rentalData.startRentDate} по {rentalData.endRentDate}<br />
            Количество: {rentalData.quantity} шт.
          </p>
          <div className="success-details">
            <div className="success-detail-item">
              <span>Сумма:</span>
              <strong>{bookingResponse?.rentalPrice || totalPrice} ₽</strong>
            </div>
            <div className="success-detail-item">
              <span>Период:</span>
              <strong>{totalDays} дней</strong>
            </div>
            <div className="success-detail-item">
              <span>Дата бронирования:</span>
              <strong>{bookingResponse?.bookingDate || new Date().toLocaleDateString()}</strong>
            </div>
            {bookingResponse?.id && (
              <div className="success-detail-item">
                <span>Номер брони:</span>
                <strong>{bookingResponse.id}</strong>
              </div>
            )}
          </div>
          <div className="success-actions">
            <button 
              className="btn btn-primary"
              onClick={handleContinueRenting}
            >
              Закрыть
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductDetail;