import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { APP_NAME } from '@/lib/constants';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import { FormInput } from '@/components/auth/FormInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/ui/button';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(7, 'Enter a valid phone number'),
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

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Create account · ${APP_NAME}`;
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      // TEMPORARY: email OTP verification is disabled (Resend sandbox can't
      // deliver to arbitrary addresses). Accounts are created ready to use, so
      // we send the user straight to the sign-in page.
      toast.success('Account created! Please sign in.');
      navigate('/auth/login', { state: { email: values.email } });
    } catch (error) {
      toast.error(getApiError(error).message);
    }
  };

  return (
    <AuthFormWrapper
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-gold-base hover:underline">
            Sign in
          </Link>
        </>
      }
      footer={
        <p className="text-xs text-muted-foreground/70">
          By creating an account, you agree to our Terms &amp; Privacy Policy.
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput
          label="Full Name"
          icon={User}
          placeholder="Noor Nabi"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormInput
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormInput
          label="Phone Number"
          icon={Phone}
          type="tel"
          placeholder="+92 300 0000000"
          error={errors.phone?.message}
          {...register('phone')}
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
          <div className="mt-2">
            <PasswordStrength password={password} />
          </div>
        </div>
        <FormInput
          label="Confirm Password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
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
