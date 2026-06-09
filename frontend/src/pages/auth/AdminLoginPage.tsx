import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { APP_NAME } from '@/lib/constants';
import { dashboardPathForRole } from '@/lib/nav';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Admin Portal · ${APP_NAME}`;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login(values.email, values.password);
      if (user.role === 'CUSTOMER') {
        toast.error('This portal is for administrators and owners only.');
        navigate('/', { replace: true });
        return;
      }
      toast.success(`Signed in as ${user.role === 'OWNER' ? 'Owner' : 'Administrator'}.`);
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      toast.error(getApiError(error).message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="overflow-hidden rounded-2xl border-t-2 border-t-gold-base bg-bg-surface p-8 shadow-elev-4"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-md bg-gold-base/10 text-gold-base">
          <Shield className="size-6" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">IndusAI Admin Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Staff access only.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="admin@indusai.pk"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormInput
          label="Password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In to Dashboard'}
        </Button>
      </form>
    </motion.div>
  );
}
