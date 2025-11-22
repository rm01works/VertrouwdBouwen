'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  Building2,
  CheckCircle,
  LogIn,
  UserPlus,
  ArrowRight,
  Shield,
  Lock,
  FileCheck,
  Handshake,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  FileText,
  Users,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Slider } from '@/components/ui/Slider';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { Badge } from '@/components/ui/Badge';
import { FadeIn } from '@/components/ui/FadeIn';
import { Counter } from '@/components/ui/Counter';

export default function HomePage() {
  const [, setActiveTab] = useState<'consumer' | 'contractor'>('consumer');

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile-first: compact spacing, clear touch targets */}
      <header className="sticky top-0 z-50 border-b border-border-strong bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-subtle">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-foreground-muted">
                  Vertrouwd
                </p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">Bouwen</p>
              </div>
            </Link>
            <nav className="flex items-center gap-1.5 sm:gap-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors px-2 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-0"
              >
                <LogIn className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Inloggen</span>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="min-h-[44px] sm:min-h-0 sm:h-11 sm:px-4 sm:text-[15px]" startIcon={<UserPlus className="h-4 w-4" />}>
                  <span className="hidden sm:inline">Registreren</span>
                  <span className="sm:hidden">Reg</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        {/* 1️⃣ HERO SECTION - Mobile-first: compact stats, readable headlines, prominent CTAs */}
        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-subtle/30 via-transparent to-transparent blur-3xl" />
          
          <SectionContainer maxWidth="7xl">
            <div className="text-center">
              {/* Headline First - Better Visual Hierarchy */}
              <FadeIn direction="up" delay={100}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-5 tracking-tight px-2">
                  Veilig bouwen begint met vertrouwen
                  <br />
                  <span className="text-primary">— voor iedereen.</span>
                </h1>
              </FadeIn>
              
              {/* Description */}
              <FadeIn direction="up" delay={200}>
                <p className="text-base md:text-lg lg:text-xl text-foreground-muted mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                  VertrouwdBouwen beschermt consumenten én aannemers met een onafhankelijk escrow-systeem
                  dat betalingen veilig stelt tot de klus is afgerond.
                </p>
              </FadeIn>

              {/* Primary CTAs - More Prominent */}
              <FadeIn direction="up" delay={300}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-6 sm:mb-8 px-4">
                  <Link href="/register?role=CUSTOMER" className="w-full sm:w-auto flex-1 sm:flex-initial">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] text-base sm:text-lg shadow-elevated hover:shadow-popover" startIcon={<Home className="h-5 w-5" />}>
                      Start als consument
                    </Button>
                  </Link>
                  <Link href="/register?role=CONTRACTOR" className="w-full sm:w-auto flex-1 sm:flex-initial">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] text-base sm:text-lg" startIcon={<Building2 className="h-5 w-5" />}>
                      Start als aannemer
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              {/* Secondary Link */}
              <FadeIn direction="up" delay={400}>
                <Link href="/hoe-het-werkt" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors inline-flex items-center gap-1.5 min-h-[44px] justify-center mb-8 sm:mb-10">
                  Bekijk hoe escrow werkt
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </FadeIn>

              {/* KPI/Stats Section - More Subtle, Below CTAs */}
              <FadeIn direction="fade" delay={500}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto mb-6 sm:mb-8 px-4">
                  <Card className="border-0 border border-border/50 hover:border-primary/30 bg-surface/50 hover:bg-surface rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-subtle hover:-translate-y-0.5">
                    <CardBody className="p-3 sm:p-4 text-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-subtle/50 rounded-full flex items-center justify-center mx-auto mb-2 opacity-70">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-0.5">
                        €<Counter value="2.5M+" duration={2000} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-foreground-muted leading-tight">Escrow Volume</p>
                    </CardBody>
                  </Card>
                  
                  <Card className="border-0 border border-border/50 hover:border-success/30 bg-surface/50 hover:bg-surface rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-subtle hover:-translate-y-0.5">
                    <CardBody className="p-3 sm:p-4 text-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-success-subtle/50 rounded-full flex items-center justify-center mx-auto mb-2 opacity-70">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-0.5">
                        <Counter value={500} suffix="+" duration={2000} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-foreground-muted leading-tight">Projecten</p>
                    </CardBody>
                  </Card>
                  
                  <Card className="border-0 border border-border/50 hover:border-info/30 bg-surface/50 hover:bg-surface rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-subtle hover:-translate-y-0.5">
                    <CardBody className="p-3 sm:p-4 text-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-info-subtle/50 rounded-full flex items-center justify-center mx-auto mb-2 opacity-70">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-info" />
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-0.5">
                        <Counter value={1200} suffix="+" duration={2000} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-foreground-muted leading-tight">Gebruikers</p>
                    </CardBody>
                  </Card>
                  
                  <Card className="border-0 border border-border/50 hover:border-warning/30 bg-surface/50 hover:bg-surface rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-subtle hover:-translate-y-0.5">
                    <CardBody className="p-3 sm:p-4 text-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-warning-subtle/50 rounded-full flex items-center justify-center mx-auto mb-2 opacity-70">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning fill-warning" />
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-0.5">
                        <Counter value={4.9} suffix="/5" duration={2000} decimals={1} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-foreground-muted leading-tight">Beoordeling</p>
                    </CardBody>
                  </Card>
                </div>
              </FadeIn>

              {/* Trust Badges - Mobile: wrap better, smaller text */}
              <FadeIn direction="up" delay={600}>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-border/50 px-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground-muted">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                    <span>100% Veilig</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground-muted">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>Bank-level Security</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground-muted">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                    <span>Onafhankelijk Escrow</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 2️⃣ "HOE HET WERKT VOOR JOU" — TAB SWITCH - Mobile: better touch targets, stacked layout */}
        <section id="hoe-het-werkt" className="py-12 sm:py-16 lg:py-20 bg-surface">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight px-4">
                  Hoe het werkt voor jou
                </h2>
                <p className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4 leading-relaxed">
                  Kies jouw rol en ontdek hoe VertrouwdBouwen specifiek voor jou werkt
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={200}>
              <Tabs defaultValue="consumer" onValueChange={(v) => setActiveTab(v as 'consumer' | 'contractor')} className="max-w-4xl mx-auto px-4">
                <TabsList className="w-full sm:w-auto mx-auto mb-4 sm:mb-6 h-auto">
                  <TabsTrigger value="consumer" className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[40px] text-sm sm:text-base">
                    <Home className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Consument</span>
                  </TabsTrigger>
                  <TabsTrigger value="contractor" className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[40px] text-sm sm:text-base">
                    <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Aannemer</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="consumer">
                  <Card className="border-0 border-2 border-primary/20 rounded-lg sm:rounded-xl hover:shadow-elevated transition-all duration-300">
                    <CardBody className="p-4 sm:p-6 md:p-8">
                      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            <span>Voor Consumenten</span>
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex gap-2 sm:gap-3">
                              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                                1
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground mb-1 text-base md:text-lg">Start escrow</h4>
                                <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                                  Maak je project aan en stort het budget veilig in escrow. Het geld blijft beschermd tot je tevreden bent.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                                2
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground mb-1 text-base md:text-lg">Betaal veilig vooruit</h4>
                                <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                                  Je geld wordt veilig bewaard door een onafhankelijke partij. Geen risico op verlies.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                                3
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground mb-1 text-base md:text-lg">Pas betalen bij goedkeuring</h4>
                                <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                                  Keur elke milestone goed voordat betaling wordt vrijgegeven. Volledige controle over je project.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-primary-subtle/30 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mt-4 md:mt-0">
                          <h4 className="font-semibold text-foreground mb-2 text-base md:text-lg">Mini-case</h4>
                          <p className="text-base md:text-lg text-foreground-muted mb-3 leading-relaxed">
                            &quot;Ik wilde mijn keuken verbouwen maar was bang voor betalingsproblemen. Met VertrouwdBouwen kon ik rustig werken met een aannemer, wetende dat mijn geld veilig was tot alles klaar was.&quot;
                          </p>
                          <div className="flex items-center gap-2 text-sm md:text-base">
                            <Star className="h-4 w-4 md:h-5 md:w-5 text-warning fill-warning flex-shrink-0" />
                            <span className="font-medium text-foreground">5/5 sterren</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-base md:text-lg font-semibold text-foreground mb-1.5">💡 Tip</p>
                            <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                              Verdeel grote projecten in milestones voor betere controle en transparantie.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </TabsContent>

                <TabsContent value="contractor">
                  <Card className="border-0 border-2 border-success/20 rounded-lg sm:rounded-xl hover:shadow-elevated transition-all duration-300">
                    <CardBody className="p-4 sm:p-6 md:p-8">
                      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                            </div>
                            <span>Voor Aannemers</span>
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex gap-2 sm:gap-3">
                              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                                1
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground mb-1 text-base md:text-lg">Zekerheid vóór je begint</h4>
                                <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                                  Het geld staat al in escrow voordat je start. Geen zorgen over betaling achteraf.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                                2
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground mb-1 text-base md:text-lg">Nooit meer achter geld aan</h4>
                                <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                                  Zodra de klant goedkeurt, wordt je automatisch betaald. Geen incasso&apos;s of wachttijden.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                                3
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground mb-1 text-base md:text-lg">Binnen 24 uur betaald</h4>
                                <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                                  Na goedkeuring ontvang je je betaling snel en veilig. Focus op je werk, niet op facturering.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-success-subtle/30 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mt-4 md:mt-0">
                          <h4 className="font-semibold text-foreground mb-2 text-base md:text-lg">Mini-case</h4>
                          <p className="text-base md:text-lg text-foreground-muted mb-3 leading-relaxed">
                            &quot;Als aannemer was ik altijd bezig met facturen en betalingen achterhalen. Nu werk ik alleen nog met projecten via VertrouwdBouwen - gegarandeerde betaling en geen gedoe meer.&quot;
                          </p>
                          <div className="flex items-center gap-2 text-sm md:text-base">
                            <Star className="h-4 w-4 md:h-5 md:w-5 text-warning fill-warning flex-shrink-0" />
                            <span className="font-medium text-foreground">5/5 sterren</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-base md:text-lg font-semibold text-foreground mb-1.5">💡 Tip</p>
                            <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                              Communiceer duidelijk over milestones om snelle goedkeuring te krijgen.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </TabsContent>
              </Tabs>
            </FadeIn>
          </SectionContainer>
        </section>

        {/* 3️⃣ USP BLOK (4 GRID ITEMS) - Mobile: stacked cards with better spacing */}
        <section className="py-12 sm:py-16 lg:py-20">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight px-4">
                  Waarom VertrouwdBouwen?
                </h2>
                <p className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4 leading-relaxed">
                  De voordelen die het verschil maken voor beide partijen
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
              <FadeIn direction="up" delay={100}>
                <Card className="group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl h-full bg-surface/50">
                  <CardBody className="p-5 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Gegarandeerde betaling</h3>
                    <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                      Aannemers krijgen gegarandeerd betaald zodra werk is goedgekeurd. Geen incasso&apos;s meer.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="up" delay={200}>
                <Card className="group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl h-full bg-surface/50">
                  <CardBody className="p-5 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Bescherming consumenten</h3>
                    <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                      Je geld blijft veilig tot je tevreden bent. Volledige controle over elke betaling.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="up" delay={300}>
                <Card className="group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl h-full bg-surface/50">
                  <CardBody className="p-5 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-info-subtle rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 text-info" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Transparante afspraken</h3>
                    <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                      Duidelijke milestones en afspraken. Alles is vastgelegd en traceerbaar.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="up" delay={400}>
                <Card className="group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl h-full bg-surface/50">
                  <CardBody className="p-5 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-warning-subtle rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <Handshake className="w-6 h-6 sm:w-7 sm:h-7 text-warning" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Minder conflicten</h3>
                    <p className="text-base md:text-lg text-foreground-muted leading-relaxed">
                      Duidelijke verwachtingen en automatische processen voorkomen misverstanden.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 3.5️⃣ LINKS VOOR CONSUMENTEN EN AANNEMERS - Nieuwe sectie met logische links */}
        <section className="py-12 sm:py-16 lg:py-20 bg-surface">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight px-4">
                  Handige hulpmiddelen en gidsen
                </h2>
                <p className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4 leading-relaxed">
                  Alles wat je nodig hebt om veilig te bouwen
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
              {/* Voor Consumenten */}
              <FadeIn direction="right" delay={100}>
                <Card className="border-0 border-2 border-primary/20 rounded-lg sm:rounded-xl hover:shadow-elevated transition-all duration-300 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <span>Voor Consumenten</span>
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Link href="/hoe-het-werkt" className="group">
                        <div className="p-4 bg-primary-subtle/30 rounded-lg hover:bg-primary-subtle/50 transition-colors border border-border/30 hover:border-primary/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-primary transition-colors">Hoe escrow werkt</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">Uitleg over het escrow proces</p>
                        </div>
                      </Link>
                      <Link href="/consument/checklist" className="group">
                        <div className="p-4 bg-primary-subtle/30 rounded-lg hover:bg-primary-subtle/50 transition-colors border border-border/30 hover:border-primary/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-primary transition-colors">Checklist verbouwing</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">Stap-voor-stap gids</p>
                        </div>
                      </Link>
                      <Link href="/calculator" className="group">
                        <div className="p-4 bg-primary-subtle/30 rounded-lg hover:bg-primary-subtle/50 transition-colors border border-border/30 hover:border-primary/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-primary transition-colors">Escrow calculator</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">Bereken je kosten</p>
                        </div>
                      </Link>
                      <Link href="/consument/hulp" className="group">
                        <div className="p-4 bg-primary-subtle/30 rounded-lg hover:bg-primary-subtle/50 transition-colors border border-border/30 hover:border-primary/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-primary transition-colors">Problemen oplossen</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">FAQ en hulp</p>
                        </div>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Voor Aannemers */}
              <FadeIn direction="left" delay={200}>
                <Card className="border-0 border-2 border-success/20 rounded-lg sm:rounded-xl hover:shadow-elevated transition-all duration-300 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                      </div>
                      <span>Voor Aannemers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Link href="/aannemer/werken-met-escrow" className="group">
                        <div className="p-4 bg-success-subtle/30 rounded-lg hover:bg-success-subtle/50 transition-colors border border-border/30 hover:border-success/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-success transition-colors">Werken met escrow</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">Complete gids</p>
                        </div>
                      </Link>
                      <Link href="/aannemer/tips" className="group">
                        <div className="p-4 bg-success-subtle/30 rounded-lg hover:bg-success-subtle/50 transition-colors border border-border/30 hover:border-success/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-success transition-colors">Klantcommunicatie tips</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">Beste praktijken</p>
                        </div>
                      </Link>
                      <Link href="/register?role=CONTRACTOR" className="group">
                        <div className="p-4 bg-success-subtle/30 rounded-lg hover:bg-success-subtle/50 transition-colors border border-border/30 hover:border-success/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-success transition-colors">Professioneel profiel</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">Registreer je bedrijf</p>
                        </div>
                      </Link>
                      <Link href="/hoe-het-werkt" className="group">
                        <div className="p-4 bg-success-subtle/30 rounded-lg hover:bg-success-subtle/50 transition-colors border border-border/30 hover:border-success/30">
                          <h4 className="font-semibold text-foreground mb-1.5 text-base md:text-lg group-hover:text-success transition-colors">Hoe het werkt</h4>
                          <p className="text-sm md:text-base text-foreground-muted leading-relaxed">Platform uitleg</p>
                        </div>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 4️⃣ PLATFORM FEATURES GRID - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
        <section className="py-12 sm:py-16 lg:py-20">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-2 sm:mb-3 tracking-tight px-4">
                  Ontdek de platform features
                </h2>
                <p className="text-sm md:text-base text-foreground-muted max-w-2xl mx-auto px-4 leading-relaxed">
                  Bekijk hoe VertrouwdBouwen werkt in de praktijk
                </p>
              </div>
            </FadeIn>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Feature Card 1: Escrow Tijdlijn */}
                <FadeIn direction="up" delay={100}>
                  <Card className="h-full rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:border-primary/30">
                    <CardBody className="p-6 md:p-8 flex flex-col gap-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">Feature</p>
                          <Badge variant="info" className="mb-3 text-xs">Escrow Tijdlijn</Badge>
                          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Real-time project tracking</h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Volg je project van begin tot eind met real-time updates.
                          </p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Voor consumenten</h4>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              Volg elke milestone in real-time en zie precies waar je project staat.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Voor aannemers</h4>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              Dien milestones in en zie direct wanneer betaling wordt vrijgegeven.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-xs font-semibold text-foreground mb-3">Project status</h4>
                          <ul className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                              <span>Project gestart</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                              <span>Milestone 1: Voorbereiding</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-info flex-shrink-0" />
                              <span>Milestone 2: Uitvoering</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </FadeIn>

                {/* Feature Card 2: Projectdossier */}
                <FadeIn direction="up" delay={200}>
                  <Card className="h-full rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:border-primary/30">
                    <CardBody className="p-6 md:p-8 flex flex-col gap-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">Feature</p>
                          <Badge variant="success" className="mb-3 text-xs">Projectdossier</Badge>
                          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Alles op één plek</h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Centraal beheer van alle projectdocumenten en communicatie.
                          </p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Voor consumenten</h4>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              Bewaar alle documenten, foto&apos;s en afspraken op één centrale plek.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Voor aannemers</h4>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              Upload bewijs van werk en documenten voor snelle goedkeuring.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-xs font-semibold text-foreground mb-3">Documenten</h4>
                          <ul className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span>Offerte.pdf</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span>Foto&apos;s werk.pdf</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span>Factuur.pdf</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </FadeIn>

                {/* Feature Card 3: Communicatie Center */}
                <FadeIn direction="up" delay={300}>
                  <Card className="h-full rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:border-primary/30">
                    <CardBody className="p-6 md:p-8 flex flex-col gap-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">Feature</p>
                          <Badge variant="info" className="mb-3 text-xs">Communicatie Center</Badge>
                          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Directe communicatie</h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            Chat direct met je projectpartner voor snelle vragen en updates.
                          </p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Voor consumenten</h4>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              Chat direct met je aannemer en stel vragen over je project.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Voor aannemers</h4>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              Beantwoord vragen snel en houd klanten op de hoogte.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-xs font-semibold text-foreground mb-3">Chat voorbeeld</h4>
                          <div className="space-y-2">
                            <div className="p-2.5 bg-muted/50 rounded-lg border border-border/50">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0" />
                                <span className="text-xs font-medium text-foreground">Klant</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">Wanneer kunnen we beginnen?</p>
                            </div>
                            <div className="p-2.5 bg-muted/50 rounded-lg border border-border/50">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 bg-success rounded-full flex-shrink-0" />
                                <span className="text-xs font-medium text-foreground">Aannemer</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">Volgende week maandag kunnen we starten!</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </SectionContainer>
        </section>

        {/* 5️⃣ TESTIMONIALS CAROUSEL - Mobile: swipe support, desktop: grid fallback */}
        <section className="py-12 sm:py-16 lg:py-20 bg-surface">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight px-4">
                  Wat zeggen onze gebruikers?
                </h2>
                <p className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4 leading-relaxed">
                  Echte verhalen van consumenten en aannemers
                </p>
              </div>
            </FadeIn>

            {/* Mobile: Carousel, Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto px-4 sm:px-0">
              {/* Review 1 - Consumer */}
              <FadeIn direction="up" delay={100}>
                <Card className="border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 sm:mb-5 italic leading-relaxed flex-1">
                      &quot;VertrouwdBouwen heeft mijn verbouwing compleet veranderd. Ik voelde me veilig om vooruit te betalen, en de aannemer kreeg gegarandeerd betaald. Perfect systeem!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base">Sarah de Vries</p>
                        <p className="text-xs sm:text-sm text-foreground-muted truncate">Keukenverbouwing • €15.000</p>
                      </div>
                      <Badge variant="success" className="text-xs sm:text-sm flex-shrink-0">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 2 - Contractor */}
              <FadeIn direction="up" delay={200}>
                <Card className="border border-border/50 hover:border-success/30 rounded-lg sm:rounded-xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 sm:mb-5 italic leading-relaxed flex-1">
                      &quot;Als aannemer is dit een game-changer. Geen gedoe meer met facturen achterhalen of betalingen uitstellen. Het geld staat al klaar, en na goedkeuring krijg ik het direct. Top!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base">Jan Bakker Bouw</p>
                        <p className="text-xs sm:text-sm text-foreground-muted truncate">Aannemer • 50+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs sm:text-sm flex-shrink-0">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 3 - Consumer */}
              <FadeIn direction="up" delay={300}>
                <Card className="border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 sm:mb-5 italic leading-relaxed flex-1">
                      &quot;Na een slechte ervaring met een vorige aannemer was ik erg voorzichtig. Met VertrouwdBouwen kon ik eindelijk met vertrouwen een groot project starten. Alles verliep perfect!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base">Mark van der Berg</p>
                        <p className="text-xs sm:text-sm text-foreground-muted truncate">Badkamer renovatie • €8.500</p>
                      </div>
                      <Badge variant="success" className="text-xs sm:text-sm flex-shrink-0">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 4 - Contractor */}
              <FadeIn direction="up" delay={400}>
                <Card className="border border-border/50 hover:border-success/30 rounded-lg sm:rounded-xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 sm:mb-5 italic leading-relaxed flex-1">
                      &quot;Het escrow systeem heeft mijn bedrijf geholpen om professioneler te werken. Klanten vertrouwen ons meer en we krijgen altijd op tijd betaald. Een win-win voor iedereen!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base">De Vries Bouw</p>
                        <p className="text-xs sm:text-sm text-foreground-muted truncate">Aannemer • 100+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs sm:text-sm flex-shrink-0">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 5 - Consumer */}
              <FadeIn direction="up" delay={500}>
                <Card className="border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 sm:mb-5 italic leading-relaxed flex-1">
                      &quot;De transparantie en controle die ik heb over mijn project is geweldig. Ik kan elke milestone goedkeuren en weet precies waar mijn geld naartoe gaat. Zeer aan te raden!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base">Lisa Jansen</p>
                        <p className="text-xs sm:text-sm text-foreground-muted truncate">Uitbouw • €25.000</p>
                      </div>
                      <Badge variant="success" className="text-xs sm:text-sm flex-shrink-0">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 6 - Contractor */}
              <FadeIn direction="up" delay={600}>
                <Card className="border border-border/50 hover:border-success/30 rounded-lg sm:rounded-xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 sm:mb-5 italic leading-relaxed flex-1">
                      &quot;Sinds ik alleen nog via VertrouwdBouwen werk, heb ik geen enkele betalingsachterstand meer gehad. Het systeem werkt perfect en mijn klanten zijn ook tevreden. Fantastisch platform!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base">Bouwbedrijf Smit</p>
                        <p className="text-xs sm:text-sm text-foreground-muted truncate">Aannemer • 75+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs sm:text-sm flex-shrink-0">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden px-4">
              <Slider autoPlay={true} autoPlayInterval={8000} showControls={true} showDots={true}>
                {/* Review 1 - Consumer */}
                <Card className="border border-border/50 hover:border-primary/30 rounded-xl shadow-sm h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 italic leading-relaxed flex-1">
                      &quot;VertrouwdBouwen heeft mijn verbouwing compleet veranderd. Ik voelde me veilig om vooruit te betalen, en de aannemer kreeg gegarandeerd betaald. Perfect systeem!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <div className="w-10 h-10 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Sarah de Vries</p>
                        <p className="text-xs text-foreground-muted truncate">Keukenverbouwing • €15.000</p>
                      </div>
                      <Badge variant="success" className="text-xs flex-shrink-0">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>

                {/* Review 2 - Contractor */}
                <Card className="border border-border/50 hover:border-success/30 rounded-xl shadow-sm h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 italic leading-relaxed flex-1">
                      &quot;Als aannemer is dit een game-changer. Geen gedoe meer met facturen achterhalen of betalingen uitstellen. Het geld staat al klaar, en na goedkeuring krijg ik het direct. Top!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <div className="w-10 h-10 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Jan Bakker Bouw</p>
                        <p className="text-xs text-foreground-muted truncate">Aannemer • 50+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs flex-shrink-0">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>

                {/* Review 3 - Consumer */}
                <Card className="border border-border/50 hover:border-primary/30 rounded-xl shadow-sm h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 italic leading-relaxed flex-1">
                      &quot;Na een slechte ervaring met een vorige aannemer was ik erg voorzichtig. Met VertrouwdBouwen kon ik eindelijk met vertrouwen een groot project starten. Alles verliep perfect!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <div className="w-10 h-10 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Mark van der Berg</p>
                        <p className="text-xs text-foreground-muted truncate">Badkamer renovatie • €8.500</p>
                      </div>
                      <Badge variant="success" className="text-xs flex-shrink-0">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>

                {/* Review 4 - Contractor */}
                <Card className="border border-border/50 hover:border-success/30 rounded-xl shadow-sm h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 italic leading-relaxed flex-1">
                      &quot;Het escrow systeem heeft mijn bedrijf geholpen om professioneler te werken. Klanten vertrouwen ons meer en we krijgen altijd op tijd betaald. Een win-win voor iedereen!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <div className="w-10 h-10 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">De Vries Bouw</p>
                        <p className="text-xs text-foreground-muted truncate">Aannemer • 100+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs flex-shrink-0">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>

                {/* Review 5 - Consumer */}
                <Card className="border border-border/50 hover:border-primary/30 rounded-xl shadow-sm h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 italic leading-relaxed flex-1">
                      &quot;De transparantie en controle die ik heb over mijn project is geweldig. Ik kan elke milestone goedkeuren en weet precies waar mijn geld naartoe gaat. Zeer aan te raden!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <div className="w-10 h-10 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Lisa Jansen</p>
                        <p className="text-xs text-foreground-muted truncate">Uitbouw • €25.000</p>
                      </div>
                      <Badge variant="success" className="text-xs flex-shrink-0">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>

                {/* Review 6 - Contractor */}
                <Card className="border border-border/50 hover:border-success/30 rounded-xl shadow-sm h-full flex flex-col bg-surface/50">
                  <CardBody className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      ))}
                    </div>
                    <p className="text-base md:text-lg text-foreground mb-4 italic leading-relaxed flex-1">
                      &quot;Sinds ik alleen nog via VertrouwdBouwen werk, heb ik geen enkele betalingsachterstand meer gehad. Het systeem werkt perfect en mijn klanten zijn ook tevreden. Fantastisch platform!&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <div className="w-10 h-10 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Bouwbedrijf Smit</p>
                        <p className="text-xs text-foreground-muted truncate">Aannemer • 75+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs flex-shrink-0">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>
              </Slider>
            </div>
          </SectionContainer>
        </section>

        {/* 6️⃣ WAAROM ESCROW ONMISBAAR IS? - Mobile: stacked layout, better spacing */}
        <section className="py-12 sm:py-16 lg:py-20">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight px-4">
                  Waarom escrow onmisbaar is?
                </h2>
                <p className="text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4 leading-relaxed">
                  Bescherming en zekerheid voor beide partijen
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0">
              {/* Consumentenvoordelen */}
              <FadeIn direction="right" delay={100}>
                <Card className="border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <span>Consumentenvoordelen</span>
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="flex-1 pt-0 flex flex-col">
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground mb-1 text-base md:text-lg">Geld blijft veilig</p>
                          <p className="text-base md:text-lg text-foreground-muted leading-relaxed">Tot je tevreden bent, blijft je geld beschermd.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground mb-1 text-base md:text-lg">Volledige controle</p>
                          <p className="text-base md:text-lg text-foreground-muted leading-relaxed">Jij bepaalt wanneer betaling wordt vrijgegeven.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground mb-1 text-base md:text-lg">Geen risico</p>
                          <p className="text-base md:text-lg text-foreground-muted leading-relaxed">Bescherming tegen onafgemaakt werk of slechte kwaliteit.</p>
                        </div>
                      </li>
                    </ul>
                    <Link href="/register?role=CUSTOMER" className="mt-auto">
                      <Button variant="primary" size="lg" className="w-full min-h-[48px] sm:min-h-[52px]" endIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}>
                        Registreer als consument
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Aannemersvoordelen */}
              <FadeIn direction="left" delay={200}>
                <Card className="border border-border/50 hover:border-success/30 rounded-lg sm:rounded-xl hover:shadow-elevated transition-all duration-300 h-full flex flex-col bg-surface/50">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                      </div>
                      <span>Aannemersvoordelen</span>
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="flex-1 pt-0 flex flex-col">
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground mb-1 text-base md:text-lg">Gegarandeerde betaling</p>
                          <p className="text-base md:text-lg text-foreground-muted leading-relaxed">Het geld staat al klaar voordat je begint.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground mb-1 text-base md:text-lg">Snelle uitbetaling</p>
                          <p className="text-base md:text-lg text-foreground-muted leading-relaxed">Binnen 24 uur betaald na goedkeuring.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground mb-1 text-base md:text-lg">Geen incasso&apos;s</p>
                          <p className="text-base md:text-lg text-foreground-muted leading-relaxed">Geen gedoe meer met achterstallige betalingen.</p>
                        </div>
                      </li>
                    </ul>
                    <Link href="/register?role=CONTRACTOR" className="mt-auto">
                      <Button variant="secondary" size="lg" className="w-full min-h-[48px] sm:min-h-[52px] bg-success hover:bg-success/90 text-success-foreground" endIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}>
                        Registreer als aannemer
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 7️⃣ CTA VOOR SEGMENTATIE - Mobile: stacked, prominent buttons */}
        <section className="py-12 sm:py-16 lg:py-20 bg-surface">
          <SectionContainer maxWidth="7xl">
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto px-4 sm:px-0">
              <FadeIn direction="right" delay={100}>
                <Card className="group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border-0 border-2 border-primary/20 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-subtle/20 to-transparent h-full">
                  <CardBody className="p-4 sm:p-6 text-center flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                        <Home className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">Start met veilig bouwen</h3>
                      <p className="text-sm sm:text-base text-foreground-muted mb-3 sm:mb-4 leading-relaxed">
                        Bescherm je investering en werk met vertrouwen met geverifieerde aannemers.
                      </p>
                    </div>
                    <Link href="/register?role=CUSTOMER" className="block">
                      <Button variant="primary" size="lg" className="w-full min-h-[44px] sm:min-h-[48px]" endIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}>
                        Registreer als consument
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="left" delay={200}>
                <Card className="group hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border-0 border-2 border-success/20 rounded-lg sm:rounded-xl bg-gradient-to-br from-success-subtle/20 to-transparent h-full">
                  <CardBody className="p-4 sm:p-6 text-center flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-success-foreground" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">Werk met gegarandeerde betaling</h3>
                      <p className="text-sm sm:text-base text-foreground-muted mb-3 sm:mb-4 leading-relaxed">
                        Ontvang gegarandeerde betalingen en focus op wat je het beste doet: bouwen.
                      </p>
                    </div>
                    <Link href="/register?role=CONTRACTOR" className="block">
                      <Button variant="secondary" size="lg" className="w-full min-h-[44px] sm:min-h-[48px] bg-success hover:bg-success/90 text-success-foreground" endIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}>
                        Registreer als aannemer
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 8️⃣ FOOTER PER DOELGROEP - Mobile: stacked columns, better spacing */}
        <footer className="bg-surface border-t border-border-strong py-6 sm:py-8 md:py-10">
          <SectionContainer maxWidth="7xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 px-4 sm:px-0">
              {/* Brand */}
              <div>
                <div className="mb-3 sm:mb-4">
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-foreground-muted">
                    Vertrouwd
                  </p>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">Bouwen</p>
                </div>
                <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
                  Het veilige escrow platform voor bouwprojecten. Bescherming voor consumenten en aannemers.
                </p>
              </div>

              {/* Voor Consumenten */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 sm:mb-5 flex items-center gap-2 text-base sm:text-lg">
                  <Home className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Voor consumenten</span>
                </h4>
                <ul className="space-y-2.5 sm:space-y-3">
                  <li>
                    <Link href="/hoe-het-werkt" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Hoe escrow werkt
                    </Link>
                  </li>
                  <li>
                    <Link href="/consument/checklist" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Checklist verbouwing
                    </Link>
                  </li>
                  <li>
                    <Link href="/calculator" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Escrow calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/consument/hulp" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Problemen oplossen
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Voor Aannemers */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 sm:mb-5 flex items-center gap-2 text-base sm:text-lg">
                  <Building2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Voor aannemers</span>
                </h4>
                <ul className="space-y-2.5 sm:space-y-3">
                  <li>
                    <Link href="/aannemer/werken-met-escrow" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Werken met escrow
                    </Link>
                  </li>
                  <li>
                    <Link href="/aannemer/tips" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Klantcommunicatie tips
                    </Link>
                  </li>
                  <li>
                    <Link href="/register?role=CONTRACTOR" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Professioneel profiel
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Algemeen */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 sm:mb-5 text-base sm:text-lg">Algemeen</h4>
                <ul className="space-y-2.5 sm:space-y-3">
                  <li>
                    <Link href="/login" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Inloggen
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Registreren
                    </Link>
                  </li>
                  <li>
                    <Link href="/over-ons" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Over ons
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm sm:text-base text-foreground-muted hover:text-primary transition-colors block py-1.5 sm:py-2 min-h-[44px] sm:min-h-0 flex items-center">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-border-strong text-center px-4 sm:px-0">
              <p className="text-sm sm:text-base text-foreground-muted">
                © 2024 VertrouwdBouwen. Alle rechten voorbehouden.
              </p>
            </div>
          </SectionContainer>
        </footer>

        {/* Sticky CTA for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-sm border-t border-border-strong shadow-elevated p-3 safe-area-inset-bottom">
          <div className="flex gap-2 max-w-7xl mx-auto">
            <Link href="/register?role=CUSTOMER" className="flex-1">
              <Button variant="primary" size="lg" className="w-full min-h-[48px]" startIcon={<Home className="h-4 w-4" />}>
                <span className="text-sm font-semibold">Start als consument</span>
              </Button>
            </Link>
            <Link href="/register?role=CONTRACTOR" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full min-h-[48px]" startIcon={<Building2 className="h-4 w-4" />}>
                <span className="text-sm font-semibold">Start als aannemer</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
