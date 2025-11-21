import React from 'react';

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8', className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-col gap-6 border-b border-gray-200 dark:border-neutral-700 pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex-1">
        {meta && (
          <div className="text-xs font-bold uppercase tracking-wide text-foreground-muted mb-2">
            {meta}
          </div>
        )}
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base text-foreground-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: PageSectionProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={cn('rounded-xl border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm', className)}>
      {hasHeader && (
        <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-neutral-700 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-foreground-muted mt-1">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('px-5 py-5', contentClassName)}>{children}</div>
    </section>
  );
}

