'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('✅ Gebruiker geauthenticeerd:', data.data.email);
          setUser(data.data);
        } else {
          console.log('ℹ️ Geen gebruiker gevonden');
          setUser(null);
        }
      } else {
        // Don't log 503 errors during auth check - expected when backend isn't running
        if (response.status !== 503) {
          console.log('ℹ️ Auth check mislukt, gebruiker niet ingelogd');
        } else {
          console.log('ℹ️ Backend server niet beschikbaar tijdens auth check');
        }
        setUser(null);
      }
    } catch (error) {
      // Don't log network errors during auth check - expected when server is down
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
      
      let response: Response;
      try {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
      } catch (fetchError) {
        console.error('❌ Network error bij login:', fetchError);
        throw new Error('Kan niet verbinden met de server. Controleer of de API server beschikbaar is.');
      }

      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          console.error('❌ Empty response from server');
          throw new Error(`Server fout: ${response.status} ${response.statusText}. Lege response ontvangen. Controleer of de API server draait.`);
        }
        data = JSON.parse(responseText);
        console.log('📥 Login response data:', data);
      } catch (jsonError) {
        console.error('❌ Failed to parse login response as JSON:', jsonError);
        if (jsonError instanceof Error && 'responseText' in jsonError) {
          console.error('❌ Response text:', (jsonError as { responseText?: string }).responseText);
        }
        throw new Error(`Server fout: ${response.status} ${response.statusText}. Ongeldige response van server. Controleer of de API server draait.`);
      }

      if (!response.ok || !data.success) {
        const rawErrorMessage = data.error?.message || `Inloggen mislukt (${response.status}). Controleer uw gegevens en probeer het opnieuw.`;
        
        let userFriendlyMessage = rawErrorMessage;
        
        if (response.status === 503 && rawErrorMessage.includes('Backend API server')) {
          userFriendlyMessage = 'De server is momenteel niet bereikbaar. Controleer of de API server draait.';
        } else if (response.status === 503) {
          userFriendlyMessage = 'De server is momenteel niet beschikbaar. Probeer het later opnieuw.';
        }
        
        console.error('❌ Login fout:', {
          status: response.status,
          message: rawErrorMessage,
          userFriendlyMessage,
          fullError: data.error,
        });
        
        throw new Error(userFriendlyMessage);
      }

      console.log('✅ Login succesvol vanuit frontend');

      let loggedInUser: User | null = null;
      if (data.data?.user) {
        loggedInUser = data.data.user;
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
      console.log('═══════════════════════════════════════════════════════');
      console.log('📝 FRONTEND - REGISTRATIE - Start');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📤 Data die wordt verzonden:', JSON.stringify(registerData, null, 2));
      console.log('📋 Data keys:', Object.keys(registerData));
      console.log('🌐 Fetch naar: /api/auth/register');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          console.error('❌ Empty response from server');
          throw new Error(`Server fout: ${response.status} ${response.statusText}. Lege response ontvangen. Controleer of de API server draait.`);
        }
        data = JSON.parse(responseText);
        console.log('📥 Response data:', JSON.stringify(data, null, 2));
      } catch (jsonError) {
        console.error('❌ Failed to parse registration response as JSON:', jsonError);
        try {
          const text = await response.text();
          console.error('❌ Response text:', text);
        } catch (textError) {
          console.error('❌ Could not read response text:', textError);
        }
        throw new Error(`Server fout: ${response.status} ${response.statusText}. Ongeldige response van server. Controleer of de API server draait.`);
      }

      if (!response.ok || !data.success) {
        const rawErrorMessage = data.error?.message || 'Registratie mislukt. Probeer het opnieuw.';
        
        let userFriendlyMessage = rawErrorMessage;
        
        if (response.status === 503 && rawErrorMessage.includes('Backend API server')) {
          userFriendlyMessage = 'De server is momenteel niet bereikbaar. Controleer of de API server draait.';
        } else if (response.status === 503) {
          userFriendlyMessage = 'De server is momenteel niet beschikbaar. Probeer het later opnieuw.';
        }
        
        console.error('❌ FRONTEND - Registratie fout:', rawErrorMessage);
        console.error('   User-friendly message:', userFriendlyMessage);
        console.error('   Response status:', response.status);
        console.error('   Response data:', data);
        console.log('═══════════════════════════════════════════════════════');
        throw new Error(userFriendlyMessage);
      }

      console.log('✅ FRONTEND - Registratie succesvol');
      console.log('   User data:', data.data?.user);
      console.log('═══════════════════════════════════════════════════════');

      if (data.data?.user) {
        setUser(data.data.user);
      } else {
        await refreshUser();
      }
    } catch (error) {
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ FRONTEND - Registratie error');
      console.error('═══════════════════════════════════════════════════════');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Full error:', error);
      console.error('═══════════════════════════════════════════════════════');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
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

