import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export async function getMe() {
  return apiClient.get<User>('/auth/me');
}

export async function login(email: string, password: string) {
  return apiClient.post<{ user: User }>('/auth/login', { email, password });
}

export async function register(data: {
  email: string;
  password: string;
  role: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  kvkNumber?: string;
}) {
  return apiClient.post<{ user: User }>('/auth/register', data);
}

export async function logout() {
  return apiClient.post('/auth/logout');
}

