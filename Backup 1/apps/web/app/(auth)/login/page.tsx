'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      success('Succesvol ingelogd!');
      router.push('/dashboard');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Inloggen mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            VertrouwdBouwen
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Welkom terug</h1>
          <p className="mt-3 text-base text-foreground-muted">
            Log in om je projecten en escrow-activiteiten op één plek te beheren.
          </p>
        </div>

        <Card className="w-full max-w-md border border-border bg-surface shadow-elevated">
          <CardBody className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Inloggen
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-foreground-muted">
                Nog geen account?{' '}
                <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
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

