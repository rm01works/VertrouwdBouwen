'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { FadeIn } from '@/components/ui/FadeIn';

export default function ContactPage() {
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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Contact
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Heb je vragen? We helpen je graag verder
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <FadeIn direction="right" delay={100}>
            <Card className="border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
              <CardBody className="p-8 text-center">
                <div className="w-14 h-14 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">E-mail</h3>
                <p className="text-foreground-muted mb-4">Stuur ons een e-mail</p>
                <a href="mailto:info@vertrouwdbouwen.com">
                  <Button variant="outline" size="sm">info@vertrouwdbouwen.com</Button>
                </a>
              </CardBody>
            </Card>
          </FadeIn>

          <FadeIn direction="left" delay={200}>
            <Card className="border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
              <CardBody className="p-8 text-center">
                <div className="w-14 h-14 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Chat Support</h3>
                <p className="text-foreground-muted mb-4">Beschikbaar in je dashboard</p>
                <Link href="/dashboard/messages">
                  <Button variant="outline" size="sm">Open chat</Button>
                </Link>
              </CardBody>
            </Card>
          </FadeIn>
        </div>

        <FadeIn direction="up" delay={300}>
          <Card className="border-2 border-primary max-w-2xl mx-auto">
            <CardBody className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Veelgestelde Vragen</h2>
              <p className="text-foreground-muted mb-6">
                Bekijk onze veelgestelde vragen of neem direct contact met ons op.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/consument/hulp">
                  <Button variant="outline" size="lg">Bekijk FAQ</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="lg">Start je project</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </FadeIn>
      </SectionContainer>
    </div>
  );
}

