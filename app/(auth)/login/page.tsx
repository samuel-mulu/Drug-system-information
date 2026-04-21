'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authApi } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { APP_NAME } from '@/lib/constants';
import { ShieldCheck, Pill, Activity } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SEED_CREDENTIALS = [
  { role: 'System Admin', email: 'admin@example.com', password: 'Admin123!', active: true },
  { role: 'Medication Manager (Store)', email: 'john.manager@example.com', password: 'Manager123!', active: true },
  { role: 'Viewer', email: 'sarah.viewer@example.com', password: 'Viewer123!', active: true },
  {
    role: 'Medication Manager (Inactive Sample)',
    email: 'jane.medication@example.com',
    password: 'Medication123!',
    active: false,
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState('');
  
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
      setError(getApiErrorMessage(err, 'Invalid email or password'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:grid lg:grid-cols-2">
        <section className="flex flex-col justify-between bg-slate-900 p-6 text-white sm:p-8 lg:p-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
              Secure Access
            </p>
            <h1 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
              {APP_NAME}
            </h1>
           
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Pill className="h-4 w-4 text-primary" />
                Medication Tracking
              </div>
              <p className="mt-1 text-xs text-slate-400">Department-scoped CRUD and status control.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-primary" />
                Live Dashboard
              </div>
              <p className="mt-1 text-xs text-slate-400">Quick operational insight by role and location.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center p-5 sm:p-8 lg:p-10">
          <Card className="w-full border-0 shadow-none">
            <CardHeader className="px-0">
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
              <p className="text-sm text-slate-500">Use your account credentials to continue.</p>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email</label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="you@company.com"
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-xs text-danger">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Password</label>
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="Enter your password"
                    error={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-xs text-danger">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full"
                  loading={isSubmitting}
                >
                  Login
                </Button>
              </form>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-800">Seed test credentials</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Use these demo accounts from `seed.ts`.
                </p>
                <div className="mt-3 space-y-2">
                  {SEED_CREDENTIALS.map((item) => (
                    <div key={item.email} className="rounded-md border border-slate-200 bg-white p-2.5 text-xs">
                      <p className="font-semibold text-slate-700">
                        {item.role}
                        {!item.active && <span className="ml-2 text-danger">(inactive)</span>}
                      </p>
                      <p className="mt-1 text-slate-600">Email: {item.email}</p>
                      <p className="text-slate-600">Password: {item.password}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
