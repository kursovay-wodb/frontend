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

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  dealsAsOwner: string;
  dealsAsCustomer: string;
  provider: string;
  role: string;
}

export interface BookingResponse {
  id: string;
  startRentDate: string;
  endRentDate: string;
  quantity: number;
  productName: string;
  productId: number;
  rentalPrice: number;
  bookingDate: string;
}

export interface BookingContract {
  id: string;
  startRentDate: string;
  endRentDate: string;
  quantity: number;
  productName: string;
  productId: number;
  rentalPrice: number;
  bookingDate: string;
  paid: boolean;
}

export interface PaymentContract {
  id: string;
  idBooking: string;
  idPayment: string;
  idRefund: string | null;
  ownerId: number;
  customerId: number;
}

export interface RentalContractUser {
  id: string;
  idBooking: string;
  idPayment: string;
  idRefund: string | null;
  ownerId: number;
  customerId: number;
}

export interface RefundRequest {
  rentalId: string;
  description: string;
}

export interface RefundResponse {
  id: string;
  rentalId: string;
  description: string;
  userId: number;
}

export interface AdminRentalContract {
  id: string;
  idBooking: string;
  idPayment: string;
  idRefund: string | null;
  ownerId: number;
  customerId: number;
}

export interface BookingContractDetail {
  id: string;
  startRentDate: string;
  endRentDate: string;
  quantity: number;
  productName: string;
  productId: number;
  rentalPrice: number;
  bookingDate: string;
}

export interface PaymentContractDetail {
  id: string;
  bookingId: string;
  fullPrice: number;
  customerId: number;
  ownerId: number;
}

export interface RefundContractDetail {
  id: string;
  rentalId: string;
  description: string;
  userId: number;
}

export interface UserRentalContracts {
  id: string;
  idBooking: string;
  idPayment: string;
  idRefund: string | null;
  ownerId: number;
  customerId: number;
}