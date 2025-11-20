'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: (roleParam === 'CONTRACTOR' ? 'CONTRACTOR' : 'CUSTOMER') as 'CUSTOMER' | 'CONTRACTOR',
    companyName: '',
    kvkNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { success, error: showError } = useToast();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Voornaam validatie
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Voornaam is verplicht';
    }

    // Achternaam validatie
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Achternaam is verplicht';
    }

    // Email validatie
    if (!formData.email.trim()) {
      newErrors.email = 'Email is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig email adres';
    }

    // Wachtwoord validatie (moet overeenkomen met backend requirements)
    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Wachtwoord moet minimaal 8 tekens lang zijn';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Wachtwoord moet minimaal één kleine letter, één hoofdletter en één cijfer bevatten';
    }

    // Wachtwoord bevestiging
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bevestig uw wachtwoord';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }

    // Aannemer specifieke velden
    if (formData.role === 'CONTRACTOR') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Bedrijfsnaam is verplicht voor aannemers';
      }
      if (!formData.kvkNumber.trim()) {
        newErrors.kvkNumber = 'KVK nummer is verplicht voor aannemers';
      } else if (!/^[0-9]{8}$/.test(formData.kvkNumber.trim())) {
        newErrors.kvkNumber = 'KVK nummer moet exact 8 cijfers zijn';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Controleer de ingevulde gegevens');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      success('Welkom bij VertrouwdBouwen! Account succesvol aangemaakt.');
      // Korte delay voor betere UX
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Registreren mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            VertrouwdBouwen
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Account aanmaken</h1>
          <p className="mt-3 text-base text-foreground-muted">
            Start met een veilig escrow-platform voor klanten en aannemers. Vul je gegevens in om toegang te
            krijgen tot het dashboard.
          </p>
        </div>

        <Card className="border border-border bg-surface shadow-elevated">
          <CardBody className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Voornaam"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                />

                <Input
                  label="Achternaam"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
              />

              <Input
                label="Telefoon (optioneel)"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Ik ben een
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground shadow-subtle focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  required
                >
                  <option value="CUSTOMER">Particulier (Klant)</option>
                  <option value="CONTRACTOR">Aannemer</option>
                </select>
              </div>

              {formData.role === 'CONTRACTOR' && (
                <>
                  <Input
                    label="Bedrijfsnaam"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                    required={formData.role === 'CONTRACTOR'}
                  />

                  <Input
                    label="KVK Nummer"
                    name="kvkNumber"
                    value={formData.kvkNumber}
                    onChange={handleChange}
                    error={errors.kvkNumber}
                    required={formData.role === 'CONTRACTOR'}
                  />
                </>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Wachtwoord"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  helperText="Min. 8 tekens, 1 hoofdletter, 1 cijfer"
                  required
                  autoComplete="new-password"
                />

                <Input
                  label="Bevestig Wachtwoord"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Registreren
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-foreground-muted">
                Heeft u al een account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
                  Log hier in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
