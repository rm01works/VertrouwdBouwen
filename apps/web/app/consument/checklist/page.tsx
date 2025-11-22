'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { FadeIn } from '@/components/ui/FadeIn';

export default function ChecklistPage() {
  const checklistItems = [
    { title: 'Projectplan opstellen', description: 'Bepaal wat je precies wilt laten doen en maak een duidelijk plan.' },
    { title: 'Budget bepalen', description: 'Bereken hoeveel je wilt uitgeven en houd rekening met onvoorziene kosten.' },
    { title: 'Aannemer kiezen', description: 'Zoek een betrouwbare aannemer met goede referenties en reviews.' },
    { title: 'Offerte vergelijken', description: 'Vraag meerdere offertes op en vergelijk prijzen en voorwaarden.' },
    { title: 'Escrow opzetten', description: 'Maak je project aan op VertrouwdBouwen en stort het budget veilig.' },
    { title: 'Contract afsluiten', description: 'Zorg voor een duidelijk contract met alle afspraken op papier.' },
    { title: 'Milestones afspreken', description: 'Deel het project op in duidelijke stappen met tussentijdse controle.' },
    { title: 'Communicatie open houden', description: 'Houd regelmatig contact met je aannemer over de voortgang.' },
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
              <Home className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Checklist Verbouwing
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Een handige checklist om je verbouwing goed voor te bereiden
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {checklistItems.map((item, index) => (
            <FadeIn key={index} direction="up" delay={index * 50}>
              <Card className="border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
                <CardBody className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-subtle rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-foreground-muted">{item.description}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn direction="up" delay={400}>
          <Card className="border-2 border-primary max-w-2xl mx-auto">
            <CardBody className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Klaar om te beginnen?</h2>
              <p className="text-foreground-muted mb-6">
                Start je project veilig met VertrouwdBouwen en bescherm je investering met escrow.
              </p>
              <Link href="/register?role=CUSTOMER">
                <Button variant="primary" size="lg" startIcon={<Home className="h-5 w-5" />}>
                  Start als consument
                </Button>
              </Link>
            </CardBody>
          </Card>
        </FadeIn>
      </SectionContainer>
    </div>
  );
}

