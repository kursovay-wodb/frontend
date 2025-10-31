import { AdminRentalContract, BookingContract, BookingContractDetail, BookingResponse, EquipmentType, PaymentContract, PaymentContractDetail, Product, ProductInput, RefundContractDetail, RefundRequest, RefundResponse, RentalContract, RentalContractUser, RentalRequest, UserInfo, UserRentalContracts } from '../types';

const GRAPHQL_URL = 'http://localhost:8080/graphql';
const API_BASE_URL = 'http://localhost:8080/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const graphqlRequest = async (query: string, variables?: any) => {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      query,
      variables
    }),
  });

  if (!response.ok) {
    throw new Error('GraphQL request failed');
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
};

export const getAllProducts = async (): Promise<Product[]> => {
  const query = `
    query {
      products {
        id
        name
        description
        rentalPrice
        quantity
        image
        equipmentType {
          id
          name
          description
          category
        }
      }
    }
  `;
  
  const data = await graphqlRequest(query);
  return data.products;
};

export const getAvailableProducts = async (): Promise<Product[]> => {
  const query = `
    query {
      availableProducts {
        id
        name
        description
        rentalPrice
        quantity
        image
        equipmentType {
          id
          name
          description
          category
        }
      }
    }
  `;
  
  const data = await graphqlRequest(query);
  return data.availableProducts;
};

export const getProductById = async (productId: string): Promise<Product> => {
  const query = `
    query ($productId: ID!) {
      productById(productId: $productId) {
        id
        name
        description
        quantity
        image
        rentalPrice
        minRentalPeriod
        maxRentalPeriod
        owner {
          id
        }
        equipmentType {
          id
          name
          description
          category
        }
      }
    }
  `;
  
  const data = await graphqlRequest(query, { productId });
  return data.productById;
};





export const createBooking = async (bookingData: RentalRequest): Promise<BookingResponse> => {
  return apiRequest('/booking-contracts/', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};





export const getEquipmentTypes = async (): Promise<EquipmentType[]> => {
  const query = `
    query {
      equipmentTypes {
        id
        name
        description
        category
      }
    }
  `;
  
  const data = await graphqlRequest(query);
  return data.equipmentTypes;
};

export const createProduct = async (productInput: ProductInput): Promise<any> => {
  const mutation = `
    mutation CreateProduct($input: ProductInput!) {
      createProduct(input: $input) {
        id
        name
        rentalPrice
        quantity
      }
    }
  `;
  
  const data = await graphqlRequest(mutation, { input: productInput });
  return data.createProduct;
};

export const getRentalContractsByCustomer = async (): Promise<RentalContract[]> => {
  const query = `
    query {
      rentalContractsByCustomer {
        id
        productName
        fullPrice
        startRentDate
        endRentDate
        quantity
      }
    }
  `;
  
  const data = await graphqlRequest(query);
  return data.rentalContractsByCustomer;
};

export const getRentalContractsByOwner = async (): Promise<RentalContract[]> => {
  const query = `
    query {
      rentalContractsByOwner {
        id
        productName
        fullPrice
        startRentDate
        endRentDate
        quantity
      }
    }
  `;
  
  const data = await graphqlRequest(query);
  return data.rentalContractsByOwner;
};


export const getUserById = async (userId: string): Promise<UserInfo> => {
  const response = await fetch(`${API_BASE_URL}/admin/find-user?id=${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка поиска пользователя');
  }

  return response.json();
};


export const checkAdminAccess = async (): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/admin/check`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result === true;
};


export const getBookingContracts = async (): Promise<BookingContract[]> => {
  return apiRequest('/booking-contracts/');
};

export const cancelBooking = async (bookingId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/booking-contracts/${bookingId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка отмены бронирования');
    } catch {
      const errorText = await response.text();
      throw new Error(errorText || 'Ошибка отмены бронирования');
    }
  }

  return { message: 'Бронирование отменено' };
};

export const createPayment = async (bookingId: string): Promise<PaymentContract> => {
  return apiRequest(`/payment-contracts/${bookingId}`, {
    method: 'POST',
  });
};

export const getRentalContractsAsCustomerByUser = async (): Promise<RentalContractUser[]> => {
  return apiRequest('/rental-contracts/user/customer');
};

export const getRentalContractsAsOwnerByUser = async (): Promise<RentalContractUser[]> => {
  return apiRequest('/rental-contracts/user/owner');
};

export const createRefund = async (refundData: RefundRequest): Promise<RefundResponse> => {
  return apiRequest('/refund-contracts/', {
    method: 'POST',
    body: JSON.stringify(refundData),
  });
};

export const getAllRentalContracts = async (): Promise<AdminRentalContract[]> => {
  return apiRequest('/rental-contracts/');
};

export const getBookingContractById = async (bookingId: string): Promise<BookingContractDetail[]> => {
  return apiRequest(`/booking-contracts/?bookingId=${bookingId}`);
};

export const getPaymentContractById = async (paymentId: string): Promise<PaymentContractDetail> => {
  return apiRequest(`/payment-contracts/${paymentId}`);
};

export const getRefundContractById = async (refundId: string): Promise<RefundContractDetail> => {
  return apiRequest(`/refund-contracts/${refundId}`);
};

export const getRentalContractsByUserId = async (userId: string): Promise<UserRentalContracts[]> => {
  return apiRequest(`/rental-contracts${userId}`);
};