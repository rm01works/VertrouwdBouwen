'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Home, Building2, LogIn, UserPlus, FileText, Calculator, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Full-screen nav panel */}
      <nav
        className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Hoofdnavigatie"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground-muted">
              Vertrouwd
            </p>
            <p className="text-lg font-semibold text-foreground">Bouwen</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Sluit menu"
          >
            <X className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-4 py-6 space-y-1">
          {/* Main actions */}
          <div className="space-y-2 mb-6">
            <Link
              href="/register?role=CUSTOMER"
              onClick={onClose}
              className="block"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full min-h-[48px] justify-start text-left"
                startIcon={<Home className="h-5 w-5" />}
              >
                Start als consument
              </Button>
            </Link>
            <Link
              href="/register?role=CONTRACTOR"
              onClick={onClose}
              className="block"
            >
              <Button
                variant="secondary"
                size="lg"
                className="w-full min-h-[48px] justify-start text-left"
                startIcon={<Building2 className="h-5 w-5" />}
              >
                Start als aannemer
              </Button>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Navigation links */}
          <div className="space-y-1">
            <Link
              href="/hoe-het-werkt"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-surface transition-colors min-h-[44px]"
            >
              <FileText className="h-5 w-5 text-foreground-muted flex-shrink-0" />
              <span>Hoe escrow werkt</span>
            </Link>
            <Link
              href="/calculator"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-surface transition-colors min-h-[44px]"
            >
              <Calculator className="h-5 w-5 text-foreground-muted flex-shrink-0" />
              <span>Escrow calculator</span>
            </Link>
            <Link
              href="/over-ons"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-surface transition-colors min-h-[44px]"
            >
              <HelpCircle className="h-5 w-5 text-foreground-muted flex-shrink-0" />
              <span>Over ons</span>
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-surface transition-colors min-h-[44px]"
            >
              <HelpCircle className="h-5 w-5 text-foreground-muted flex-shrink-0" />
              <span>Contact</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Account actions */}
          <div className="space-y-1">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground-muted hover:text-foreground hover:bg-surface transition-colors min-h-[44px]"
            >
              <LogIn className="h-5 w-5 flex-shrink-0" />
              <span>Inloggen</span>
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground-muted hover:text-foreground hover:bg-surface transition-colors min-h-[44px]"
            >
              <UserPlus className="h-5 w-5 flex-shrink-0" />
              <span>Registreren</span>
            </Link>
          </div>
        </div>

        {/* Footer with theme toggle */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
}

