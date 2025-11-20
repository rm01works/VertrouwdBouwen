export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CONTRACTOR = 'CONTRACTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
  kvkNumber?: string;
  phone: string;
  address?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
  kvkNumber?: string;
  phone: string;
  address?: Record<string, any>;
}

export interface LoginDto {
  email: string;
  password: string;
}

