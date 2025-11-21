
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getVisibleNavItemsForRole } from '@/lib/navigation/dashboard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [isLoading, router, user]);

  // Protect admin routes
  useEffect(() => {
    if (!isLoading && user && pathname?.startsWith('/dashboard/admin')) {
      if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, pathname, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || pathname === '/dashboard/';
    }
    return pathname?.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Alleen consumenten (CUSTOMER) kunnen nieuwe projecten aanmaken
  const canCreateProject = user.role === 'CUSTOMER';
  
  // Haal zichtbare navigatie-items op basis van rol
  const visibleNavItems = getVisibleNavItemsForRole(user.role);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-foreground-muted">
                Vertrouwd
              </p>
              <p className="text-xl font-semibold text-foreground">Bouwen</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={link.status === 'stub' ? false : undefined}
                className={[
                  'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-surface text-foreground shadow-subtle'
                    : 'text-foreground-muted hover:text-foreground',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-foreground-muted">{user.email}</p>
            </div>
            <div className="hidden h-10 w-px bg-border md:block" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {canCreateProject && (
                <Link
                  href="/dashboard/projects/new"
                  className="hidden rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted lg:inline-flex"
                >
                  Nieuw project
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
        <nav className="border-t border-border bg-background/80 md:hidden">
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 text-sm">
            {visibleNavItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={link.status === 'stub' ? false : undefined}
                className={[
                  'flex-1 rounded-full px-3 py-2 text-center font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-surface text-foreground shadow-subtle'
                    : 'text-foreground-muted hover:text-foreground',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {link.label}
              </Link>
            ))}
            {canCreateProject && (
              <Link
                href="/dashboard/projects/new"
                className="rounded-full border border-border bg-surface px-3 py-2 text-center font-medium text-primary transition-colors hover:border-border-strong"
              >
                Nieuw
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
