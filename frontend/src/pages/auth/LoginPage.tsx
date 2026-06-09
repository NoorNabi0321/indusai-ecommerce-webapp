import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { APP_NAME } from '@/lib/constants';
import { dashboardPathForRole } from '@/lib/nav';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `Sign in · ${APP_NAME}`;
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? dashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      const err = getApiError(error);
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        toast.info('Please verify your email to continue.');
        navigate('/auth/verify-otp', {
          state: { userId: err.details?.userId, email: getValues('email') },
        });
        return;
      }
      toast.error(err.message);
    }
  };

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
