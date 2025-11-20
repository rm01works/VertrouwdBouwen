import React, { useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

const baseFieldClasses =
  'w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground shadow-subtle focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:outline-none transition-shadow duration-200';

export function Select({
  label,
  error,
  helperText,
  className = '',
  id,
  options,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || props.name || generatedId;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={[
          baseFieldClasses,
          error && 'border-danger text-danger focus-visible:ring-danger',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {props.placeholder && (
          <option value="" disabled>
            {props.placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="flex items-center gap-2 text-sm text-danger">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-foreground-muted">{helperText}</p>
      )}
    </div>
  );
}

