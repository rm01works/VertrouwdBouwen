'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/providers/ToastProvider';

/**
 * Centralized client-side providers wrapper.
 * 
 * This component bundles all client providers to avoid server/client boundary violations.
 * Use this in server components (like root layout) instead of importing providers directly.
 * 
 * Provider order matters:
 * 1. ThemeProvider - provides theme context (needed by all components)
 * 2. AuthProvider - provides authentication context
 * 3. ToastProvider - provides toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

