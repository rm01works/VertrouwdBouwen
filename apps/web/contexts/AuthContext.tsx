'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout, User as ApiUser } from '@/lib/api/auth';

export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginAsDemo: () => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  kvkNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await getMe();
      if (response.success && response.data) {
        console.log('✅ Gebruiker geauthenticeerd:', response.data.email);
        setUser(response.data);
      } else {
        console.log('ℹ️ Geen gebruiker gevonden');
        setUser(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('fetch failed') && !errorMessage.includes('ECONNREFUSED')) {
        console.error('❌ Auth check error:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Login poging vanuit frontend:', { email });
      
      const response = await apiLogin(email, password);

      if (!response.success) {
        const errorMessage = response.error?.message || 'Inloggen mislukt. Controleer uw gegevens en probeer het opnieuw.';
        throw new Error(errorMessage);
      }

      console.log('✅ Login succesvol vanuit frontend');

      let loggedInUser: User | null = null;
      if (response.data?.user) {
        loggedInUser = response.data.user;
        setUser(loggedInUser);
      } else {
        await refreshUser();
        loggedInUser = user;
      }
      
      return loggedInUser;
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Onbekende fout bij inloggen');
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      console.log('📝 Registratie poging:', { email: registerData.email, role: registerData.role });
      
      const response = await apiRegister(registerData);

      if (!response.success) {
        const errorMessage = response.error?.message || 'Registratie mislukt. Probeer het opnieuw.';
        throw new Error(errorMessage);
      }

      console.log('✅ Registratie succesvol');

      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        await refreshUser();
      }
    } catch (error) {
      console.error('❌ Registratie error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Continue even if logout request fails
    } finally {
      setUser(null);
      document.cookie = 'token=; path=/; max-age=0';
      router.push('/');
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const loginAsDemo = () => {
    // Allows viewing the dashboard without database connection
    const demoUser: User = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      role: 'CUSTOMER',
      firstName: 'Demo',
      lastName: 'Gebruiker',
      companyName: 'Demo Bedrijf',
    };
    setUser(demoUser);
    
    // Cookie value doesn't matter, just needs to exist for middleware check
    document.cookie = 'token=demo-token; path=/; max-age=86400';
    
    console.log('✅ Demo gebruiker ingelogd');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

