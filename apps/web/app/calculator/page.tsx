'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { Input } from '@/components/ui/Input';
import { FadeIn } from '@/components/ui/FadeIn';

export default function CalculatorPage() {
  const [projectBudget, setProjectBudget] = useState<string>('');
  const [escrowFee] = useState<number>(2.5); // 2.5% escrow fee

  const budget = parseFloat(projectBudget) || 0;
  const fee = (budget * escrowFee) / 100;
  const total = budget + fee;

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
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Escrow Calculator
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Bereken hoeveel je betaalt voor escrow-bescherming op jouw bouwproject
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <Card className="border-2 border-primary/20">
            <CardBody className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Project Budget (€)
                  </label>
                  <Input
                    type="number"
                    placeholder="Bijv. 15000"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    className="mb-6"
                  />
                  
                  <div className="bg-info-subtle/30 border border-info/20 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground-muted">
                      <p className="font-semibold text-foreground mb-1">Escrow fee: {escrowFee}%</p>
                      <p>De escrow fee wordt toegevoegd aan je project budget voor volledige bescherming.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Berekening</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Project budget</span>
                      <span className="font-medium text-foreground">€{budget.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Escrow fee ({escrowFee}%)</span>
                      <span className="font-medium text-foreground">€{fee.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Totaal te betalen</span>
                        <span className="text-xl font-bold text-primary">€{total.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={300}>
          <div className="mt-8 text-center">
            <Link href="/register?role=CUSTOMER">
              <Button variant="primary" size="lg">
                Start je project
              </Button>
            </Link>
          </div>
        </FadeIn>
      </SectionContainer>
    </div>
  );
}

