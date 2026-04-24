'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authApi } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { APP_NAME } from '@/lib/constants';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState('');
  const [showSessionExpiredMessage, setShowSessionExpiredMessage] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setShowSessionExpiredMessage(searchParams.get('reason') === 'session-expired');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    try {
      const response = await authApi.login(data);
      setUser(response.user);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Unable to reach server right now. If Render is waking up, wait a few seconds and try again.'
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,107,168,0.16),_transparent_35%),linear-gradient(180deg,_#f8fbfd_0%,_#edf4f8_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-xl items-center justify-center">
        <Card className="w-full rounded-[24px] border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <CardHeader className="space-y-4 border-b border-slate-100 px-6 pb-6 pt-7 sm:px-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Secure Sign In
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{APP_NAME}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in with your hospital account.
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6 sm:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {showSessionExpiredMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Your session ended or is no longer valid. Please sign in again.
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Work Email</label>
                <Input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="name@hospital.org"
                  error={!!errors.email}
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Password</label>
                <Input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  error={!!errors.password}
                  className="h-11"
                />
                {errors.password && (
                  <p className="text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-2 h-11 w-full"
                loading={isSubmitting}
              >
                Access System
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
