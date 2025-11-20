'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1a1a1a] shadow-lg border-b border-[#333333] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent">
              VertrouwdBouwen
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/login"
                className="text-[#e0e0e0] hover:text-[#00d4ff] font-medium transition-colors"
              >
                Inloggen
              </Link>
              <Link
                href="/register"
                className="bg-[#00d4ff] text-[#0a0a0a] px-4 py-2 rounded-lg hover:bg-[#00b8e6] font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Registreren
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent mb-6">
            VertrouwdBouwen
          </h1>
          <p className="text-xl sm:text-2xl text-[#b3b3b3] mb-8 max-w-3xl mx-auto">
            Het veilige escrow platform voor bouwprojecten
            <br />
            Verbind klanten met aannemers met gegarandeerde betalingen
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Klant Card */}
          <Card className="hover:shadow-xl hover:border-[#00d4ff]/50 transition-all duration-300 border-2 border-[#333333] hover:scale-[1.01]">
            <CardBody className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#00d4ff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[#00d4ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#ffffff] mb-3">
                  Ik ben een Particulier
                </h2>
                <p className="text-[#b3b3b3] mb-6">
                  Zoek een betrouwbare aannemer voor uw bouwproject. Betaal veilig via escrow en
                  alleen wanneer u tevreden bent.
                </p>
              </div>
              <div className="space-y-3">
                <ul className="text-left text-sm text-[#b3b3b3] space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Veilige escrow betalingen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Betaal alleen bij goedkeuring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Projecten met milestones</span>
                  </li>
                </ul>
                <Link href="/register?role=CUSTOMER" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Registreer als Particulier
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Aannemer Card */}
          <Card className="hover:shadow-xl hover:border-[#00d4ff]/50 transition-all duration-300 border-2 border-[#333333] hover:scale-[1.01]">
            <CardBody className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#00d4ff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[#00d4ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#ffffff] mb-3">
                  Ik ben een Aannemer
                </h2>
                <p className="text-[#b3b3b3] mb-6">
                  Vind nieuwe projecten en ontvang gegarandeerde betalingen. Werk met vertrouwen
                  dankzij escrow beveiliging.
                </p>
              </div>
              <div className="space-y-3">
                <ul className="text-left text-sm text-[#b3b3b3] space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Gegarandeerde betalingen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Toegang tot beschikbare projecten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Milestone-gebaseerd werken</span>
                  </li>
                </ul>
                <Link href="/register?role=CONTRACTOR" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Registreer als Aannemer
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#ffffff] mb-12">
            Hoe werkt het?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00d4ff] text-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-[#ffffff] mb-2">Project Aanmaken</h3>
              <p className="text-sm text-[#b3b3b3]">
                Klant maakt project aan met milestones en budget
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00d4ff] text-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-[#ffffff] mb-2">Geld in Escrow</h3>
              <p className="text-sm text-[#b3b3b3]">
                Klant stort geld veilig in escrow
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00d4ff] text-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-[#ffffff] mb-2">Werk Uitvoeren</h3>
              <p className="text-sm text-[#b3b3b3]">
                Aannemer voert werk uit en dient milestones in
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00d4ff] text-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="font-semibold text-[#ffffff] mb-2">Goedkeuren & Betalen</h3>
              <p className="text-sm text-[#b3b3b3]">
                Klant keurt goed, aannemer ontvangt betaling
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Link href="/register">
            <Button variant="primary" size="lg">
              Begin Nu - Gratis Registreren
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-[#b3b3b3] mt-16 border-t border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">
              © 2024 VertrouwdBouwen. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
