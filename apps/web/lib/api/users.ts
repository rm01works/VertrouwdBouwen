import { apiClient } from './client';

export interface Contractor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  phone?: string | null;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    customerProjects: number;
  };
}

export async function getContractors() {
  return apiClient.get<Contractor[]>('/users/contractors');
}

export async function getCustomers() {
  return apiClient.get<Customer[]>('/users/customers');
}

