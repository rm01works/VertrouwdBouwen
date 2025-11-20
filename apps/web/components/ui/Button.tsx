import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed min-w-0';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active focus-visible:ring-primary-ring shadow-elevated',
  secondary:
    'bg-surface text-foreground border border-border hover:bg-surface-muted focus-visible:ring-primary-ring shadow-subtle',
  ghost:
    'bg-transparent text-foreground hover:bg-surface-muted focus-visible:ring-primary-ring border border-transparent',
  danger:
    'bg-danger text-danger-foreground hover:bg-danger/80 focus-visible:ring-danger/50 shadow-elevated',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-[15px]',
  lg: 'h-12 px-5 text-base',
};

function classNames(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const content = (
    <span className="flex items-center justify-center gap-2 min-w-0">
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && startIcon && (
        <span className="inline-flex h-4 w-4 items-center justify-center flex-shrink-0">{startIcon}</span>
      )}
      <span className="whitespace-nowrap truncate">{children}</span>
      {!isLoading && endIcon && (
        <span className="inline-flex h-4 w-4 items-center justify-center flex-shrink-0">{endIcon}</span>
      )}
    </span>
  );

  return (
    <button
      className={classNames(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
}
