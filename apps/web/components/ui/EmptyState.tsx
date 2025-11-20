import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  align?: 'center' | 'start';
}

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  align = 'center',
}: EmptyStateProps) {
  const isCentered = align === 'center';

  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-border bg-surface px-8 py-12 shadow-subtle',
        isCentered ? 'text-center' : 'text-left',
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-4',
          isCentered ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        {icon && (
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-primary shadow-subtle',
              !isCentered && 'self-start',
            )}
          >
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-foreground-muted">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

