'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Target, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { FadeIn } from '@/components/ui/FadeIn';

export default function OverOnsPage() {
  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Veiligheid',
      description: 'We zetten veiligheid voorop. Ons escrow-systeem beschermt beide partijen.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Transparantie',
      description: 'Duidelijke processen en open communicatie. Geen verrassingen.',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Vertrouwen',
      description: 'We bouwen aan vertrouwen tussen consumenten en aannemers.',
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
            <div className="w-16 h-16 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Over VertrouwdBouwen
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Wij maken bouwprojecten veiliger voor iedereen
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <Card className="border-2 border-primary/20 mb-12">
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Onze Missie</h2>
              <p className="text-foreground-muted mb-4">
                VertrouwdBouwen is opgericht om bouwprojecten veiliger en betrouwbaarder te maken voor zowel consumenten als aannemers.
                We geloven dat escrow de beste manier is om beide partijen te beschermen.
              </p>
              <p className="text-foreground-muted">
                Door gebruik te maken van een onafhankelijk escrow-systeem zorgen we ervoor dat consumenten beschermd zijn tegen
                onafgemaakt werk, en aannemers gegarandeerd betaald krijgen voor hun werk.
              </p>
            </CardBody>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={300}>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Onze Waarden</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {values.map((value, index) => (
              <FadeIn key={index} direction="up" delay={400 + index * 100}>
                <Card className="border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
                  <CardBody className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      {value.icon}
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-foreground-muted">{value.description}</p>
                  </CardBody>
                </Card>
              </FadeIn>
            ))}
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={600}>
          <Card className="border-2 border-primary max-w-2xl mx-auto">
            <CardBody className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Wil je meer weten?</h2>
              <p className="text-foreground-muted mb-6">
                Neem contact met ons op of start direct met je eerste project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="outline" size="lg">Contact</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="lg">Start nu</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </FadeIn>
      </SectionContainer>
    </div>
  );
}

