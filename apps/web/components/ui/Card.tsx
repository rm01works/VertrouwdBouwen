import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function classNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={classNames(
        'rounded-xl border border-gray-200 dark:border-neutral-700 bg-surface text-foreground shadow-sm transition-all duration-300',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: SectionProps) {
  return (
    <div className={classNames('px-5 py-5 border-b border-gray-200 dark:border-neutral-700 flex flex-col gap-1', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: SectionProps) {
  return <div className={classNames('px-5 py-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: SectionProps) {
  return (
    <div className={classNames('px-5 py-5 border-t border-gray-200 dark:border-neutral-700 bg-surface-muted/30', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: SectionProps) {
  return (
    <h3 className={classNames('text-lg font-bold tracking-tight text-foreground', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: SectionProps) {
  return (
    <p className={classNames('text-sm text-foreground-muted', className)}>
      {children}
    </p>
  );
}

