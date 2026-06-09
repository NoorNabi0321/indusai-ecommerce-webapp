import { cn } from '@/lib/utils';

/** Score a password 0–4 based on length and character variety. */
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

const LEVELS = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-error' },
  { label: 'Fair', color: 'bg-warning' },
  { label: 'Good', color: 'bg-info' },
  { label: 'Strong', color: 'bg-success' },
] as const;

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  const level = LEVELS[score];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              segment <= score ? level.color : 'bg-bg-overlay',
            )}
          />
        ))}
      </div>
      {password && level.label && (
        <p className="text-xs text-muted-foreground">
          Password strength: <span className="font-medium text-foreground">{level.label}</span>
        </p>
      )}
    </div>
  );
}
