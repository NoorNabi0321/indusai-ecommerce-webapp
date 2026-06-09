import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { APP_NAME } from '@/lib/constants';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import { FormInput } from '@/components/auth/FormInput';
import { OTPInput } from '@/components/auth/OTPInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/ui/button';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Add a letter')
      .regex(/\d/, 'Add a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  useEffect(() => {
    document.title = `Reset password · ${APP_NAME}`;
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail },
  });

  const password = watch('password', '');

  const onSubmit = async (values: FormValues) => {
    if (otp.length !== 6) {
      setOtpError(true);
      toast.error('Enter the 6-digit reset code.');
      return;
    }
    try {
      await resetPassword(values.email, otp, values.password);
      toast.success('Password updated! Please sign in.');
      navigate('/auth/login', { replace: true });
    } catch (error) {
      setOtpError(true);
      toast.error(getApiError(error).message);
    }
  };

  return (
    <AuthFormWrapper
      title="Set a new password"
      subtitle="Enter the code from your email and choose a new password."
      footer={
        <Link to="/auth/login" className="text-muted-foreground hover:text-gold-base">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-2">
          <span className="block text-sm font-medium text-secondary-foreground">Reset Code</span>
          <OTPInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setOtpError(false);
            }}
            error={otpError}
          />
        </div>

        <div>
          <FormInput
            label="New Password"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-2">
            <PasswordStrength password={password} />
          </div>
        </div>
        <FormInput
          label="Confirm New Password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Reset Password'}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
