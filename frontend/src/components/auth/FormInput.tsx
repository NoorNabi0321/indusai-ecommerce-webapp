import * as React from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

/** Labelled input with optional leading icon, error text, and password toggle. */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, icon: Icon, error, type = 'text', className, id, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && show ? 'text' : type;
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-secondary-foreground">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              'h-11 w-full rounded-md border bg-bg-base text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground',
              Icon ? 'pl-9' : 'pl-3',
              isPassword ? 'pr-10' : 'pr-3',
              error
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error/30'
                : 'border-input focus:border-gold-dim focus:ring-2 focus:ring-ring/30',
              className,
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={show ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);
FormInput.displayName = 'FormInput';
