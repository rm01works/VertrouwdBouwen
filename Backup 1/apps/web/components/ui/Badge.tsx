import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | 'default';
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success:
    'bg-success-subtle text-success border border-success/30',
  warning:
    'bg-warning-subtle text-warning border border-warning/30',
  danger:
    'bg-danger-subtle text-danger border border-danger/35',
  info:
    'bg-info-subtle text-info border border-info/30',
  neutral:
    'bg-surface-muted/40 text-foreground-muted border border-border',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const resolvedVariant = variant === 'default' ? 'neutral' : variant;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        variantClasses[resolvedVariant as BadgeVariant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

// Helper functie om status naar badge variant te mappen
export function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  const statusMap: Record<string, BadgeProps['variant']> = {
    DRAFT: 'neutral',
    PENDING_CONTRACTOR: 'warning',
    ACTIVE: 'info',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    DISPUTED: 'danger',
    PENDING: 'neutral',
    SUBMITTED: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PAID: 'success',
  };

  return statusMap[status] || 'neutral';
}

// Helper functie om status naar Nederlandse tekst te vertalen
export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: 'Concept',
    PENDING_CONTRACTOR: 'Wachtend op aannemer',
    ACTIVE: 'Actief',
    IN_PROGRESS: 'In uitvoering',
    COMPLETED: 'Voltooid',
    CANCELLED: 'Geannuleerd',
    DISPUTED: 'Geschil',
    PENDING: 'In afwachting',
    SUBMITTED: 'Ingediend',
    APPROVED: 'Goedgekeurd',
    REJECTED: 'Afgewezen',
    PAID: 'Betaald',
  };

  return statusMap[status] || status;
}

