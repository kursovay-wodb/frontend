export interface TokenData {
  token: string;
  type: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

export interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export interface HomeProps {
  isAuthenticated: boolean;
}

export interface LoginProps {
  onLogin: (token: string) => void;
}

export interface RegistrationProps {
  onLogin: (token: string) => void;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  quantity: number;
  image: string;
  minRentalPeriod?: number;
  maxRentalPeriod?: number;
  owner: {
    id: string;
  };
  equipmentType: EquipmentType;
}

export interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export interface RentalRequest {
  productId: string;
  startRentDate: string;
  endRentDate: string;
  quantity: number;
}

export interface DateErrors {
  startDate?: string;
  endDate?: string;
  period?: string;
}

export interface RentalContract {
  id: string;
  productName: string;
  fullPrice: number;
  startRentDate: string;
  endRentDate: string;
  quantity: number;
}

export interface EquipmentType {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  rentalPrice: number;
  quantity: number;
  minRentalPeriod?: number;
  maxRentalPeriod?: number;
  image?: string;
  equipmentTypeId: string;
}

export interface AdminRentalContract {
  id: string;
  productName: string;
  customerId: string;
  ownerId: string;
  fullPrice: number;
  startRentDate: string;
  endRentDate: string;
  quantity: number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  dealsAsOwner: string;
  dealsAsCustomer: string;
  provider: string;
  role: string;
}