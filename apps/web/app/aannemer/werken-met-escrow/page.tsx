'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { FadeIn } from '@/components/ui/FadeIn';

export default function WerkenMetEscrowPage() {
  const steps = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Project accepteren',
      description: 'Bekijk beschikbare projecten en accepteer projecten die bij je passen. Het budget staat al klaar in escrow.',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Werk uitvoeren',
      description: 'Voer het werk uit volgens de afspraken en dien milestones in met bewijs van werk (foto\'s, documenten).',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Wachten op goedkeuring',
      description: 'De consument beoordeelt het werk. Bij goedkeuring wordt het geld automatisch vrijgegeven.',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Automatisch betaald',
      description: 'Binnen 24 uur na goedkeuring ontvang je de betaling op je rekening. Geen facturen, geen gedoe.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SectionContainer maxWidth="2xl" className="py-16 sm:py-20">
        <FadeIn>
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Terug naar homepage
          </Link>
        </FadeIn>

        <FadeIn direction="up">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Werken met Escrow
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Alles wat je moet weten over werken met VertrouwdBouwen als aannemer
            </p>
          </div>
        </FadeIn>

        <div className="space-y-6 mb-12">
          {steps.map((step, index) => (
            <FadeIn key={index} direction="right" delay={index * 100}>
              <Card className="border-2 border-success/20 hover:shadow-elevated transition-all duration-300">
                <CardBody className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-success-subtle rounded-full flex items-center justify-center text-success">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-foreground-muted">{step.description}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn direction="up" delay={400}>
          <Card className="border-2 border-success max-w-2xl mx-auto">
            <CardBody className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Klaar om te beginnen?</h2>
              <p className="text-foreground-muted mb-6">
                Registreer je als aannemer en begin met projecten waarvan je zeker weet dat je betaald wordt.
              </p>
              <Link href="/register?role=CONTRACTOR">
                <Button variant="secondary" size="lg" className="bg-success hover:bg-success/90 text-success-foreground" startIcon={<Building2 className="h-5 w-5" />}>
                  Registreer als aannemer
                </Button>
              </Link>
            </CardBody>
          </Card>
        </FadeIn>
      </SectionContainer>
    </div>
  );
}

