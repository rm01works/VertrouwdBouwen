'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Hammer, 
  FolderKanban, 
  CreditCard, 
  Wallet 
} from 'lucide-react';
import { getPendingEscrowPayments } from '@/lib/api/admin-payments';

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const adminNavItems: AdminNavItem[] = [
  {
    label: 'Overzicht',
    href: '/dashboard/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: 'KPI\'s en algemene statistieken',
  },
  {
    label: 'Klanten',
    href: '/dashboard/admin/customers',
    icon: <Users className="h-5 w-5" />,
    description: 'Beheer alle klanten',
  },
  {
    label: 'Aannemers',
    href: '/dashboard/admin/contractors',
    icon: <Hammer className="h-5 w-5" />,
    description: 'Beheer alle aannemers',
  },
  {
    label: 'Projecten',
    href: '/dashboard/admin/projects',
    icon: <FolderKanban className="h-5 w-5" />,
    description: 'Alle projecten beheren',
  },
  {
    label: 'Betalingen & Escrow',
    href: '/dashboard/admin/payments',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Escrow-betalingen beheren',
  },
  {
    label: 'Payouts',
    href: '/dashboard/admin/payouts',
    icon: <Wallet className="h-5 w-5" />,
    description: 'Uitbetalingen aan aannemers',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0);

  // Poll for pending payments count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await getPendingEscrowPayments();
        if (response.success && response.data) {
          setPendingPaymentsCount(response.data.length);
        }
      } catch (err) {
        console.error('Error loading pending payments count:', err);
      }
    };

    loadPendingCount();
    // Poll every 30 seconds
    const interval = setInterval(loadPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard/admin') {
      return pathname === href || pathname === '/dashboard/admin/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-neutral-700 bg-surface/50 p-5">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground">Admin Portal</h2>
        <p className="text-xs text-foreground-muted mt-1">
          Platformbeheer & controle
        </p>
      </div>

      <nav className="space-y-1">
        {adminNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  active
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.label}</span>
                  {item.href === '/dashboard/admin/payments' && pendingPaymentsCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-xs font-bold">
                      {pendingPaymentsCount}
                    </span>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-foreground-muted mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

