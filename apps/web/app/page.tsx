'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Building2, CheckCircle, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-strong bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-foreground-muted">
                  Vertrouwd
                </p>
                <p className="text-xl font-semibold text-foreground">Bouwen</p>
              </div>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors px-2 sm:px-3 py-2 flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Inloggen
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="sm:size-md" startIcon={<UserPlus className="h-4 w-4" />}>
                  Registreren
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-12 sm:mb-16 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-subtle/20 via-transparent to-transparent blur-3xl opacity-50" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-4 sm:mb-6 tracking-tight">
            VertrouwdBouwen
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-foreground-muted mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
            Het veilige escrow platform voor bouwprojecten
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Verbind klanten met aannemers met gegarandeerde betalingen
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16">
          {/* Klant Card */}
          <Card className="group hover:shadow-md hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-neutral-700">
            <CardBody className="p-6 sm:p-8 text-center">
              <div className="mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary-subtle/80 transition-transform duration-300">
                  <Home className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Ik ben een Particulier
                </h2>
                <p className="text-sm sm:text-base text-foreground-muted mb-6">
                  Zoek een betrouwbare aannemer voor uw bouwproject. Betaal veilig via escrow en
                  alleen wanneer u tevreden bent.
                </p>
              </div>
              <div className="space-y-3">
                <ul className="text-left text-sm text-foreground-muted space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Veilige escrow betalingen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Betaal alleen bij goedkeuring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Projecten met milestones</span>
                  </li>
                </ul>
                <Link href="/register?role=CUSTOMER" className="block">
                  <Button variant="primary" size="lg" className="w-full" endIcon={<ArrowRight className="h-5 w-5" />}>
                    Registreer als Particulier
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Aannemer Card */}
          <Card className="group hover:shadow-md hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-neutral-700">
            <CardBody className="p-6 sm:p-8 text-center">
              <div className="mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary-subtle/80 transition-transform duration-300">
                  <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Ik ben een Aannemer
                </h2>
                <p className="text-sm sm:text-base text-foreground-muted mb-6">
                  Vind nieuwe projecten en ontvang gegarandeerde betalingen. Werk met vertrouwen
                  dankzij escrow beveiliging.
                </p>
              </div>
              <div className="space-y-3">
                <ul className="text-left text-sm text-foreground-muted space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Gegarandeerde betalingen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Toegang tot beschikbare projecten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Milestone-gebaseerd werken</span>
                  </li>
                </ul>
                <Link href="/register?role=CONTRACTOR" className="block">
                  <Button variant="primary" size="lg" className="w-full" endIcon={<ArrowRight className="h-5 w-5" />}>
                    Registreer als Aannemer
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-8 sm:mb-12 tracking-tight">
            Hoe werkt het?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative">
            {/* Verbindingslijnen voor desktop */}
            <div className="hidden md:block absolute top-6 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            <div className="hidden md:block absolute top-6 left-1/2 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            <div className="hidden md:block absolute top-6 left-3/4 right-0 h-0.5 bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            
            <div className="text-center relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 font-semibold text-base sm:text-lg shadow-elevated hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">Project Aanmaken</h3>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                Klant maakt project aan met milestones en budget
              </p>
            </div>
            <div className="text-center relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 font-semibold text-base sm:text-lg shadow-elevated hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">Geld in Escrow</h3>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                Klant stort geld veilig in escrow
              </p>
            </div>
            <div className="text-center relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 font-semibold text-base sm:text-lg shadow-elevated hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">Werk Uitvoeren</h3>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                Aannemer voert werk uit en dient milestones in
              </p>
            </div>
            <div className="text-center relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 font-semibold text-base sm:text-lg shadow-elevated hover:scale-110 transition-transform duration-300">
                4
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">Goedkeuren & Betalen</h3>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                Klant keurt goed, aannemer ontvangt betaling
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="inline-block">
            <Link href="/register">
              <Button variant="primary" size="lg" className="shadow-sm hover:shadow-md transition-shadow" startIcon={<UserPlus className="h-5 w-5" />}>
                Begin Nu - Gratis Registreren
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border-strong mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-sm text-foreground-muted">
              © 2024 VertrouwdBouwen. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
