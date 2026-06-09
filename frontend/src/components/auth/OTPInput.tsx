import { useRef, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
}

/** 6-box OTP field with auto-advance, backspace, and paste support. */
export function OTPInput({
  value,
  onChange,
  length = 6,
  error = false,
  disabled = false,
}: OTPInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusBox = (index: number) => {
    refs.current[index]?.focus();
    refs.current[index]?.select();
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(0, length);
    onChange(next);
    if (index < length - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focusBox(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      focusBox(Math.min(pasted.length, length - 1));
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            'h-14 w-12 rounded-md border bg-bg-base text-center text-xl font-semibold text-foreground outline-none transition-all',
            error
              ? 'border-error focus:ring-2 focus:ring-error/30'
              : digit
                ? 'border-gold-dim'
                : 'border-input focus:border-gold-base focus:ring-2 focus:ring-ring/40',
            disabled && 'opacity-50',
          )}
        />
      ))}
    </div>
  );
}
