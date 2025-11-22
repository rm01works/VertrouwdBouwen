'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { FadeIn } from '@/components/ui/FadeIn';

export default function HoeHetWerktPage() {
  return (
    <div className="min-h-screen bg-background">
      <SectionContainer maxWidth="7xl" className="py-16 sm:py-20">
        <FadeIn>
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Terug naar homepage
          </Link>
        </FadeIn>

        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Hoe werkt escrow?
            </h1>
            <p className="text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto">
              Een eenvoudige uitleg van hoe VertrouwdBouwen jouw bouwproject beschermt
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <FadeIn direction="right" delay={100}>
            <Card className="border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  Voor Consumenten
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Project aanmaken</h3>
                      <p className="text-sm text-foreground-muted">
                        Maak je project aan en beschrijf wat je nodig hebt. Kies een aannemer of laat ons er een voor je vinden.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Budget in escrow</h3>
                      <p className="text-sm text-foreground-muted">
                        Stort het afgesproken budget veilig in escrow. Het geld blijft beschermd tot je tevreden bent met het werk.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Werk wordt gedaan</h3>
                      <p className="text-sm text-foreground-muted">
                        De aannemer kan aan de slag. Jij volgt de voortgang via milestones en kunt vragen stellen.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Goedkeuren en betalen</h3>
                      <p className="text-sm text-foreground-muted">
                        Keur elke milestone goed. Pas dan wordt het geld vrijgegeven aan de aannemer. Volledige controle.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </FadeIn>

          <FadeIn direction="left" delay={200}>
            <Card className="border-2 border-success/20 hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-success" />
                  </div>
                  Voor Aannemers
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Project accepteren</h3>
                      <p className="text-sm text-foreground-muted">
                        Bekijk beschikbare projecten en accepteer projecten die bij je passen. Het budget staat al klaar.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Zekerheid vóór start</h3>
                      <p className="text-sm text-foreground-muted">
                        Het geld staat al in escrow voordat je begint. Geen zorgen over betaling achteraf.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Werk uitvoeren</h3>
                      <p className="text-sm text-foreground-muted">
                        Voer het werk uit en dien milestones in met bewijs. Houd de klant op de hoogte.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Automatisch betaald</h3>
                      <p className="text-sm text-foreground-muted">
                        Na goedkeuring wordt je automatisch betaald. Binnen 24 uur op je rekening. Geen gedoe.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </FadeIn>
        </div>

        <FadeIn direction="up" delay={300}>
          <Card className="border-2 border-primary max-w-3xl mx-auto">
            <CardBody className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Veiligheid voor beide partijen</h2>
              <p className="text-foreground-muted mb-6">
                Escrow zorgt ervoor dat consumenten beschermd zijn tegen onafgemaakt werk, en aannemers gegarandeerd betaald krijgen.
                Het geld wordt alleen vrijgegeven wanneer beide partijen akkoord zijn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=CUSTOMER">
                  <Button variant="primary" size="lg" startIcon={<Home className="h-5 w-5" />}>
                    Start als consument
                  </Button>
                </Link>
                <Link href="/register?role=CONTRACTOR">
                  <Button variant="secondary" size="lg" startIcon={<Building2 className="h-5 w-5" />}>
                    Start als aannemer
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </FadeIn>
      </SectionContainer>
    </div>
  );
}

