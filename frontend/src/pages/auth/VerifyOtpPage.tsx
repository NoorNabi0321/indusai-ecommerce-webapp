import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { APP_NAME } from '@/lib/constants';
import { AuthFormWrapper } from '@/components/auth/AuthFormWrapper';
import { OTPInput } from '@/components/auth/OTPInput';
import { Button } from '@/components/ui/button';

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

export default function VerifyOtpPage() {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { userId?: string; email?: string } | null;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    document.title = `Verify email · ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  if (!state?.userId) {
    return <Navigate to="/auth/register" replace />;
  }

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setSubmitting(true);
    setError(false);
    try {
      await verifyEmail(state.userId!, otp);
      toast.success('Email verified! Please sign in.');
      navigate('/auth/login', { replace: true });
    } catch (err) {
      setError(true);
      toast.error(getApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(state.userId!);
      toast.success('A new code has been sent.');
      setSeconds(45);
      setOtp('');
    } catch (err) {
      toast.error(getApiError(err).message);
    }
  };

  return (
    <AuthFormWrapper
      title="Verify your email"
      subtitle={
        state.email ? (
          <>We sent a 6-digit code to {maskEmail(state.email)}</>
        ) : (
          'Enter the 6-digit code we emailed you.'
        )
      }
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

      <OTPInput value={otp} onChange={setOtp} error={error} disabled={submitting} />

      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={handleVerify}
        disabled={otp.length !== 6 || submitting}
      >
        {submitting ? 'Verifying…' : 'Verify'}
      </Button>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {seconds > 0 ? (
          <span>
            Resend code in 0:{seconds.toString().padStart(2, '0')}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-gold-base hover:underline"
          >
            Resend code
          </button>
        )}
      </div>
    </AuthFormWrapper>
  );
}
