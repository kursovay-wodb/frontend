import { TokenData, LoginCredentials, RegistrationData } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1/auth';

export const login = async (credentials: LoginCredentials): Promise<TokenData> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка входа');
  }

  return await response.json();
};

export const register = async (userData: RegistrationData): Promise<TokenData> => {
  const response = await fetch(`${API_BASE_URL}/registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка регистрации');
  }

  return await response.json();
};

export const validateToken = async (token: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.ok;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};