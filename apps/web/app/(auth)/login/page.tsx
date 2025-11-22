'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const { success, error: showError } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use AuthContext login which handles the fetch properly
      const loggedInUser = await login(email, password);
      success('Succesvol ingelogd!');

      if (loggedInUser?.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Inloggen mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    success('Demo account geladen!');
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-subtle/10 via-transparent to-transparent" />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="mb-8 sm:mb-10 text-center w-full max-w-md">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-foreground-muted">
              Vertrouwd
            </p>
            <p className="text-xl font-semibold text-foreground">Bouwen</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">Welkom terug</h1>
          <p className="text-sm sm:text-base text-foreground-muted">
            Log in om je projecten en escrow-activiteiten op één plek te beheren.
          </p>
        </div>

        <Card className="w-full max-w-md shadow-sm border border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welkom terug</CardTitle>
          </CardHeader>
          <CardBody className="space-y-6 sm:space-y-8 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <Input
                label="Emailadres"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                label="Wachtwoord"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading} startIcon={<LogIn className="h-5 w-5" />}>
                Inloggen
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-foreground-muted">Of</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleDemoLogin}
                startIcon={<Eye className="h-5 w-5" />}
              >
                Bekijk demo dashboard
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-foreground-muted">
                Nog geen account?{' '}
                <Link href="/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                  Registreer hier
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

