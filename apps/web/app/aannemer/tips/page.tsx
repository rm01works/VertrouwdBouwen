'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, MessageSquare, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { FadeIn } from '@/components/ui/FadeIn';

export default function TipsPage() {
  const tips = [
    {
      title: 'Wees transparant over voortgang',
      description: 'Houd je klant regelmatig op de hoogte van de voortgang. Stuur foto\'s en updates via het platform.',
    },
    {
      title: 'Duidelijke milestones',
      description: 'Deel grote projecten op in duidelijke, controleerbare stappen. Dit maakt goedkeuring sneller.',
    },
    {
      title: 'Reageer snel op vragen',
      description: 'Beantwoord vragen van klanten snel en professioneel. Goede communicatie voorkomt problemen.',
    },
    {
      title: 'Lever kwaliteitsbewijs',
      description: 'Upload duidelijke foto\'s en documenten bij elke milestone. Dit versnelt de goedkeuring.',
    },
    {
      title: 'Wees proactief',
      description: 'Informeer je klant over mogelijke vertragingen of problemen voordat ze er zelf achter komen.',
    },
    {
      title: 'Professionale presentatie',
      description: 'Zorg voor een compleet en professioneel profiel met referenties en portfolio.',
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
              <Lightbulb className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Klantcommunicatie Tips
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Tips voor effectieve communicatie met je klanten
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {tips.map((tip, index) => (
            <FadeIn key={index} direction="up" delay={index * 50}>
              <Card className="border-2 border-success/20 hover:shadow-elevated transition-all duration-300">
                <CardBody className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-success-subtle rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                      <p className="text-sm text-foreground-muted">{tip.description}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn direction="up" delay={300}>
          <Card className="border-2 border-success max-w-2xl mx-auto">
            <CardBody className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Meer leren?</h2>
              <p className="text-foreground-muted mb-6">
                Bekijk onze uitgebreide gids over werken met escrow of start direct met je eerste project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/aannemer/werken-met-escrow">
                  <Button variant="outline" size="lg">Lees de gids</Button>
                </Link>
                <Link href="/register?role=CONTRACTOR">
                  <Button variant="secondary" size="lg" className="bg-success hover:bg-success/90 text-success-foreground" startIcon={<Building2 className="h-5 w-5" />}>
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

