import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepperProps {
  steps: string[];
  current: number; // 1-based
}

export function CheckoutStepper({ steps, current }: CheckoutStepperProps) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors',
                  done && 'bg-gold-base text-bg-base',
                  active && 'border-2 border-gold-base text-gold-base',
                  !done && !active && 'border border-border text-muted-foreground',
                )}
              >
                {done ? <Check className="size-4" /> : stepNum}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:block',
                  active || done ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {stepNum < steps.length && (
              <span className={cn('mx-3 h-px flex-1', done ? 'bg-gold-base' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
