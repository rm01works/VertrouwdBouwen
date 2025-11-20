'use client';

import React from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const handleReset = () => {
    try {
      reset();
    } catch (e) {
      // Fallback if reset fails
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const handleHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-xl shadow-lg border-2 border-[#ff4444]/50 border-[#333333]">
        <div className="p-8 text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-[#ff4444] mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-[#ffffff] mb-2">
              Er is iets misgegaan
            </h1>
            <p className="text-[#b3b3b3] mb-4">
              {error?.message || 'Er is een onverwachte fout opgetreden'}
            </p>
            {error?.digest && (
              <p className="text-xs text-[#737373] font-mono mb-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-[#00d4ff] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#00b8e6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
            >
              Probeer Opnieuw
            </button>
            <button
              onClick={handleHome}
              className="px-6 py-3 border-2 border-[#00d4ff] text-[#00d4ff] font-semibold rounded-lg hover:bg-[#00d4ff]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
            >
              Naar Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

