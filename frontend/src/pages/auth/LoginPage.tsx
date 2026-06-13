import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { APP_NAME } from '@/lib/constants';
import { dashboardPathForRole } from '@/lib/nav';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/user.types';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [twoFactor, setTwoFactor] = useState<{ userId: string } | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    document.title = `Sign in · ${APP_NAME}`;
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onAuthenticated(user: User) {
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    navigate(from ?? dashboardPathForRole(user.role), { replace: true });
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login(values.email, values.password);
      onAuthenticated(user);
    } catch (error) {
      const err = getApiError(error);
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        toast.info('Please verify your email to continue.');
        navigate('/auth/verify-otp', {
          state: { userId: err.details?.userId, email: getValues('email') },
        });
        return;
      }
      if (err.code === 'TWO_FACTOR_REQUIRED') {
        setTwoFactor({ userId: String(err.details?.userId) });
        return;
      }
      toast.error(err.message);
    }
  };

  async function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!twoFactor || code.length !== 6) return;
    setVerifying(true);
    try {
      const user = await verifyTwoFactor(twoFactor.userId, code);
      onAuthenticated(user);
    } catch (error) {
      toast.error(getApiError(error).message);
      setCode('');
    } finally {
      setVerifying(false);
    }
  }

  if (twoFactor) {
    return (
      <AuthFormWrapper
        title="Two-factor authentication"
        subtitle="Enter the 6-digit code from your authenticator app."
      >
        <form onSubmit={onVerifyCode} className="space-y-4">
          <FormInput
            label="Authentication Code"
            icon={KeyRound}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            autoFocus
          />
          <Button type="submit" className="w-full" size="lg" disabled={verifying || code.length !== 6}>
            {verifying ? 'Verifying…' : 'Verify & Sign In'}
          </Button>
          <button type="button" onClick={() => { setTwoFactor(null); setCode(''); }} className="w-full text-center text-xs text-muted-foreground hover:text-gold-base">
            Back to sign in
          </button>
        </form>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Welcome back"
      subtitle={
        <>
          New here?{' '}
          <Link to="/auth/register" className="font-medium text-gold-base hover:underline">
            Create an account
          </Link>
        </>
      }
      footer={
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
          <ShieldCheck className="size-3.5" /> Secured with JWT authentication
        </p>
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
        <div>
          <FormInput
            label="Password"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-gold-base"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => toast.info('Google sign-in is coming soon.')}
      >
        Continue with Google
      </Button>
    </AuthFormWrapper>
  );
}
