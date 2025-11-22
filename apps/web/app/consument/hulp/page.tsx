'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { FadeIn } from '@/components/ui/FadeIn';

export default function HulpPage() {
  const faqItems = [
    {
      question: 'Wat als ik niet tevreden ben met het werk?',
      answer: 'Met escrow blijft je geld beschermd tot je tevreden bent. Je keurt milestones alleen goed als het werk naar wens is. Bij problemen kun je contact opnemen met onze support.',
    },
    {
      question: 'Hoe lang duurt het voordat een aannemer betaald wordt?',
      answer: 'Na jouw goedkeuring van een milestone wordt de aannemer binnen 24 uur betaald. Dit gebeurt automatisch via ons escrow-systeem.',
    },
    {
      question: 'Wat als de aannemer niet komt opdagen?',
      answer: 'Als een aannemer niet komt opdagen of het project niet afmaakt, blijft je geld veilig in escrow. Je kunt dan een andere aannemer zoeken zonder geld te verliezen.',
    },
    {
      question: 'Kan ik een project annuleren?',
      answer: 'Ja, je kunt een project annuleren. Als er nog geen werk is verricht, krijg je je volledige budget terug. Neem contact met ons op voor specifieke situaties.',
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
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Problemen Oplossen
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Veelgestelde vragen en hulp bij problemen
            </p>
          </div>
        </FadeIn>

        <div className="space-y-4 mb-12">
          {faqItems.map((item, index) => (
            <FadeIn key={index} direction="up" delay={index * 100}>
              <Card className="border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
                <CardBody className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                  <p className="text-sm text-foreground-muted">{item.answer}</p>
                </CardBody>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn direction="up" delay={400}>
          <Card className="border-2 border-primary">
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Nog meer hulp nodig?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-6 bg-surface rounded-lg">
                  <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Chat Support</h3>
                  <p className="text-sm text-foreground-muted mb-4">Beschikbaar in je dashboard</p>
                  <Link href="/dashboard/messages">
                    <Button variant="outline" size="sm">Open chat</Button>
                  </Link>
                </div>
                <div className="text-center p-6 bg-surface rounded-lg">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">E-mail</h3>
                  <p className="text-sm text-foreground-muted mb-4">support@vertrouwdbouwen.nl</p>
                  <a href="mailto:support@vertrouwdbouwen.nl">
                    <Button variant="outline" size="sm">Stuur e-mail</Button>
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>
        </FadeIn>
      </SectionContainer>
    </div>
  );
}

