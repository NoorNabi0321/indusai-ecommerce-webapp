import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, MailCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { APP_NAME } from '@/lib/constants';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Forgot password · ${APP_NAME}`;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword(values.email);
      setSentTo(values.email);
    } catch (error) {
      toast.error(getApiError(error).message);
    }
  };

  if (sentTo) {
    return (
      <AuthFormWrapper
        title="Check your email"
        subtitle={`If an account exists for ${sentTo}, we've sent a reset code.`}
      >
        <div className="mb-6 flex justify-center">
          <motion.div
            className="grid size-14 place-items-center rounded-full bg-gold-base/10 text-gold-base"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <MailCheck className="size-7" />
          </motion.div>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={() => navigate('/auth/reset-password', { state: { email: sentTo } })}
        >
          Enter reset code
        </Button>
        <div className="mt-4 text-center text-sm">
          <Link to="/auth/login" className="text-muted-foreground hover:text-gold-base">
            Back to sign in
          </Link>
        </div>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset code."
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
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
