import { apiClient } from './client';

export interface Contractor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  phone?: string | null;
}

export async function getContractors() {
  return apiClient.get<Contractor[]>('/users/contractors');
}

