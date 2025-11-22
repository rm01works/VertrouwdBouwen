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

export default function HomePage() {
  const [, setActiveTab] = useState<'consumer' | 'contractor'>('consumer');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-strong bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-foreground-muted">
                  Vertrouwd
                </p>
                <p className="text-xl font-semibold text-foreground">Bouwen</p>
              </div>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors px-2 sm:px-3 py-2 flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Inloggen</span>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="sm:size-md" startIcon={<UserPlus className="h-4 w-4" />}>
                  <span className="hidden sm:inline">Registreren</span>
                  <span className="sm:hidden">Reg</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* 1️⃣ HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-subtle/30 via-transparent to-transparent blur-3xl" />
          
          <SectionContainer maxWidth="7xl">
            <div className="text-center mb-12">
              {/* KPI/Stats Section - Vervangt het logo element */}
              <FadeIn direction="fade" delay={100}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12">
                  <Card className="border-0 border-2 border-primary/20 hover:border-primary/40 rounded-2xl transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                    <CardBody className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">€2.5M+</div>
                      <p className="text-xs sm:text-sm text-foreground-muted">Escrow Volume</p>
                    </CardBody>
                  </Card>
                  
                  <Card className="border-0 border-2 border-success/20 hover:border-success/40 rounded-2xl transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                    <CardBody className="p-6 text-center">
                      <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">500+</div>
                      <p className="text-xs sm:text-sm text-foreground-muted">Projecten</p>
                    </CardBody>
                  </Card>
                  
                  <Card className="border-0 border-2 border-info/20 hover:border-info/40 rounded-2xl transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                    <CardBody className="p-6 text-center">
                      <div className="w-12 h-12 bg-info-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-info" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">1,200+</div>
                      <p className="text-xs sm:text-sm text-foreground-muted">Gebruikers</p>
                    </CardBody>
                  </Card>
                  
                  <Card className="border-0 border-2 border-warning/20 hover:border-warning/40 rounded-2xl transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                    <CardBody className="p-6 text-center">
                      <div className="w-12 h-12 bg-warning-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-6 h-6 text-warning fill-warning" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">4.9/5</div>
                      <p className="text-xs sm:text-sm text-foreground-muted">Beoordeling</p>
                    </CardBody>
                  </Card>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={200}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
                  Veilig bouwen begint met vertrouwen
                  <br />
                  <span className="text-primary">— voor iedereen.</span>
                </h1>
              </FadeIn>
              
              <FadeIn direction="up" delay={300}>
                <p className="text-lg sm:text-xl lg:text-2xl text-foreground-muted mb-8 max-w-3xl mx-auto leading-relaxed">
                  VertrouwdBouwen beschermt consumenten én aannemers met een onafhankelijk escrow-systeem
                  dat betalingen veilig stelt tot de klus is afgerond.
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={400}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <Link href="/register?role=CUSTOMER">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto" startIcon={<Home className="h-5 w-5" />}>
                      Start als consument
                    </Button>
                  </Link>
                  <Link href="/register?role=CONTRACTOR">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto" startIcon={<Building2 className="h-5 w-5" />}>
                      Start als aannemer
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={500}>
                <Link href="/hoe-het-werkt" className="text-sm text-foreground-muted hover:text-primary transition-colors inline-flex items-center gap-1">
                  Bekijk hoe escrow werkt
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </FadeIn>

              {/* Trust Badges */}
              <FadeIn direction="up" delay={600}>
                <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Shield className="h-5 w-5 text-success" />
                    <span>100% Veilig</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <Lock className="h-5 w-5 text-primary" />
                    <span>Bank-level Security</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Onafhankelijk Escrow</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 2️⃣ "HOE HET WERKT VOOR JOU" — TAB SWITCH */}
        <section id="hoe-het-werkt" className="py-16 sm:py-20 lg:py-24 bg-surface">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                  Hoe het werkt voor jou
                </h2>
                <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                  Kies jouw rol en ontdek hoe VertrouwdBouwen specifiek voor jou werkt
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={200}>
              <Tabs defaultValue="consumer" onValueChange={(v) => setActiveTab(v as 'consumer' | 'contractor')} className="max-w-4xl mx-auto">
                <TabsList className="w-full sm:w-auto mx-auto mb-8">
                  <TabsTrigger value="consumer" className="flex-1 sm:flex-initial">
                    <Home className="h-4 w-4 mr-2" />
                    Consument
                  </TabsTrigger>
                  <TabsTrigger value="contractor" className="flex-1 sm:flex-initial">
                    <Building2 className="h-4 w-4 mr-2" />
                    Aannemer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="consumer">
                  <Card className="border-0 border-2 border-primary/20 rounded-2xl hover:shadow-elevated transition-all duration-300">
                    <CardBody className="p-8 sm:p-10">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center">
                              <Home className="w-6 h-6 text-primary" />
                            </div>
                            Voor Consumenten
                          </h3>
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                1
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Start escrow</h4>
                                <p className="text-sm text-foreground-muted">
                                  Maak je project aan en stort het budget veilig in escrow. Het geld blijft beschermd tot je tevreden bent.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                2
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Betaal veilig vooruit</h4>
                                <p className="text-sm text-foreground-muted">
                                  Je geld wordt veilig bewaard door een onafhankelijke partij. Geen risico op verlies.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                3
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Pas betalen bij goedkeuring</h4>
                                <p className="text-sm text-foreground-muted">
                                  Keur elke milestone goed voordat betaling wordt vrijgegeven. Volledige controle over je project.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-primary-subtle/30 rounded-xl p-6">
                          <h4 className="font-semibold text-foreground mb-3">Mini-case</h4>
                          <p className="text-sm text-foreground-muted mb-4">
                            &quot;Ik wilde mijn keuken verbouwen maar was bang voor betalingsproblemen. Met VertrouwdBouwen kon ik rustig werken met een aannemer, wetende dat mijn geld veilig was tot alles klaar was.&quot;
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            <span className="font-medium text-foreground">5/5 sterren</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs font-semibold text-foreground mb-2">💡 Tip</p>
                            <p className="text-xs text-foreground-muted">
                              Verdeel grote projecten in milestones voor betere controle en transparantie.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </TabsContent>

                <TabsContent value="contractor">
                  <Card className="border-0 border-2 border-success/20 rounded-2xl hover:shadow-elevated transition-all duration-300">
                    <CardBody className="p-8 sm:p-10">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                            <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-success" />
                            </div>
                            Voor Aannemers
                          </h3>
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                                1
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Zekerheid vóór je begint</h4>
                                <p className="text-sm text-foreground-muted">
                                  Het geld staat al in escrow voordat je start. Geen zorgen over betaling achteraf.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                                2
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Nooit meer achter geld aan</h4>
                                <p className="text-sm text-foreground-muted">
                                  Zodra de klant goedkeurt, wordt je automatisch betaald. Geen incasso&apos;s of wachttijden.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                                3
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Binnen 24 uur betaald</h4>
                                <p className="text-sm text-foreground-muted">
                                  Na goedkeuring ontvang je je betaling snel en veilig. Focus op je werk, niet op facturering.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-success-subtle/30 rounded-xl p-6">
                          <h4 className="font-semibold text-foreground mb-3">Mini-case</h4>
                          <p className="text-sm text-foreground-muted mb-4">
                            &quot;Als aannemer was ik altijd bezig met facturen en betalingen achterhalen. Nu werk ik alleen nog met projecten via VertrouwdBouwen - gegarandeerde betaling en geen gedoe meer.&quot;
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            <span className="font-medium text-foreground">5/5 sterren</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs font-semibold text-foreground mb-2">💡 Tip</p>
                            <p className="text-xs text-foreground-muted">
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

        {/* 3️⃣ USP BLOK (4 GRID ITEMS) */}
        <section className="py-16 sm:py-20 lg:py-24">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                  Waarom VertrouwdBouwen?
                </h2>
                <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                  De voordelen die het verschil maken voor beide partijen
                </p>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FadeIn direction="up" delay={100}>
                <Card className="group hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 border-0 border-2 border-transparent hover:border-primary/20 rounded-2xl h-full">
                  <CardBody className="p-6 text-center">
                    <div className="w-16 h-16 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Gegarandeerde betaling</h3>
                    <p className="text-sm text-foreground-muted">
                      Aannemers krijgen gegarandeerd betaald zodra werk is goedgekeurd. Geen incasso&apos;s meer.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="up" delay={200}>
                <Card className="group hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 border-0 border-2 border-transparent hover:border-primary/20 rounded-2xl h-full">
                  <CardBody className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Bescherming consumenten</h3>
                    <p className="text-sm text-foreground-muted">
                      Je geld blijft veilig tot je tevreden bent. Volledige controle over elke betaling.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="up" delay={300}>
                <Card className="group hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 border-0 border-2 border-transparent hover:border-primary/20 rounded-2xl h-full">
                  <CardBody className="p-6 text-center">
                    <div className="w-16 h-16 bg-info-subtle rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FileCheck className="w-8 h-8 text-info" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Transparante afspraken</h3>
                    <p className="text-sm text-foreground-muted">
                      Duidelijke milestones en afspraken. Alles is vastgelegd en traceerbaar.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="up" delay={400}>
                <Card className="group hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 border-0 border-2 border-transparent hover:border-primary/20 rounded-2xl h-full">
                  <CardBody className="p-6 text-center">
                    <div className="w-16 h-16 bg-warning-subtle rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Handshake className="w-8 h-8 text-warning" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Minder conflicten</h3>
                    <p className="text-sm text-foreground-muted">
                      Duidelijke verwachtingen en automatische processen voorkomen misverstanden.
                    </p>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 4️⃣ UI SHOWCASE SLIDER */}
        <section className="py-16 sm:py-20 lg:py-24 bg-surface">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                  Ontdek de platform features
                </h2>
                <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                  Bekijk hoe VertrouwdBouwen werkt in de praktijk
                </p>
              </div>
            </FadeIn>

            <Slider autoPlay={true} autoPlayInterval={6000} className="max-w-5xl mx-auto">
              {/* Slide 1: Escrow Tijdlijn */}
              <Card className="border-0 border-2 border-primary/20 rounded-2xl">
                <CardBody className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="info" className="mb-4">Escrow Tijdlijn</Badge>
                      <h3 className="text-2xl font-bold text-foreground mb-4">Real-time project tracking</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                            <Home className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Voor consumenten</p>
                            <p className="text-sm text-foreground-muted">Volg elke milestone in real-time en zie precies waar je project staat.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Voor aannemers</p>
                            <p className="text-sm text-foreground-muted">Dien milestones in en zie direct wanneer betaling wordt vrijgegeven.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary-subtle/20 rounded-xl p-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Project gestart</span>
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Milestone 1: Voorbereiding</span>
                          <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Milestone 2: Uitvoering</span>
                          <Clock className="w-5 h-5 text-info" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Slide 2: Projectdossier */}
              <Card className="border-0 border-2 border-primary/20 rounded-2xl">
                <CardBody className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="success" className="mb-4">Projectdossier</Badge>
                      <h3 className="text-2xl font-bold text-foreground mb-4">Alles op één plek</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                            <Home className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Voor consumenten</p>
                            <p className="text-sm text-foreground-muted">Bewaar alle documenten, foto&apos;s en afspraken op één centrale plek.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Voor aannemers</p>
                            <p className="text-sm text-foreground-muted">Upload bewijs van werk en documenten voor snelle goedkeuring.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary-subtle/20 rounded-xl p-8">
                      <div className="space-y-3">
                        <div className="p-4 bg-surface rounded-lg flex items-center gap-3 border border-border">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm">Offerte.pdf</span>
                        </div>
                        <div className="p-4 bg-surface rounded-lg flex items-center gap-3 border border-border">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm">Foto&apos;s werk.pdf</span>
                        </div>
                        <div className="p-4 bg-surface rounded-lg flex items-center gap-3 border border-border">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm">Factuur.pdf</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Slide 3: Communicatie Center */}
              <Card className="border-0 border-2 border-primary/20 rounded-2xl">
                <CardBody className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="info" className="mb-4">Communicatie Center</Badge>
                      <h3 className="text-2xl font-bold text-foreground mb-4">Directe communicatie</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                            <Home className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Voor consumenten</p>
                            <p className="text-sm text-foreground-muted">Chat direct met je aannemer en stel vragen over je project.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Voor aannemers</p>
                            <p className="text-sm text-foreground-muted">Beantwoord vragen snel en houd klanten op de hoogte.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary-subtle/20 rounded-xl p-8">
                      <div className="space-y-3">
                        <div className="p-4 bg-surface rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary rounded-full" />
                            <span className="text-sm font-medium">Klant</span>
                          </div>
                          <p className="text-sm text-foreground-muted">Wanneer kunnen we beginnen?</p>
                        </div>
                        <div className="p-4 bg-surface rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-success rounded-full" />
                            <span className="text-sm font-medium">Aannemer</span>
                          </div>
                          <p className="text-sm text-foreground-muted">Volgende week maandag kunnen we starten!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Slider>
          </SectionContainer>
        </section>

        {/* 5️⃣ TESTIMONIALS GRID */}
        <section className="py-16 sm:py-20 lg:py-24">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                  Wat zeggen onze gebruikers?
                </h2>
                <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                  Echte verhalen van consumenten en aannemers
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {/* Review 1 - Consumer */}
              <FadeIn direction="up" delay={100}>
                <Card className="border-0 border-2 border-primary/20 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardBody className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-base text-foreground mb-6 italic leading-relaxed flex-1">
                      &quot;VertrouwdBouwen heeft mijn verbouwing compleet veranderd. Ik voelde me veilig om vooruit te betalen, en de aannemer kreeg gegarandeerd betaald. Perfect systeem!&quot;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Sarah de Vries</p>
                        <p className="text-xs text-foreground-muted truncate">Keukenverbouwing • €15.000</p>
                      </div>
                      <Badge variant="success" className="text-xs">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 2 - Contractor */}
              <FadeIn direction="up" delay={200}>
                <Card className="border-0 border-2 border-success/20 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardBody className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-base text-foreground mb-6 italic leading-relaxed flex-1">
                      &quot;Als aannemer is dit een game-changer. Geen gedoe meer met facturen achterhalen of betalingen uitstellen. Het geld staat al klaar, en na goedkeuring krijg ik het direct. Top!&quot;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Jan Bakker Bouw</p>
                        <p className="text-xs text-foreground-muted truncate">Aannemer • 50+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 3 - Consumer */}
              <FadeIn direction="up" delay={300}>
                <Card className="border-0 border-2 border-primary/20 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardBody className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-base text-foreground mb-6 italic leading-relaxed flex-1">
                      &quot;Na een slechte ervaring met een vorige aannemer was ik erg voorzichtig. Met VertrouwdBouwen kon ik eindelijk met vertrouwen een groot project starten. Alles verliep perfect!&quot;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Mark van der Berg</p>
                        <p className="text-xs text-foreground-muted truncate">Badkamer renovatie • €8.500</p>
                      </div>
                      <Badge variant="success" className="text-xs">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 4 - Contractor */}
              <FadeIn direction="up" delay={400}>
                <Card className="border-0 border-2 border-success/20 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardBody className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-base text-foreground mb-6 italic leading-relaxed flex-1">
                      &quot;Het escrow systeem heeft mijn bedrijf geholpen om professioneler te werken. Klanten vertrouwen ons meer en we krijgen altijd op tijd betaald. Een win-win voor iedereen!&quot;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">De Vries Bouw</p>
                        <p className="text-xs text-foreground-muted truncate">Aannemer • 100+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 5 - Consumer */}
              <FadeIn direction="up" delay={500}>
                <Card className="border-0 border-2 border-primary/20 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardBody className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-base text-foreground mb-6 italic leading-relaxed flex-1">
                      &quot;De transparantie en controle die ik heb over mijn project is geweldig. Ik kan elke milestone goedkeuren en weet precies waar mijn geld naartoe gaat. Zeer aan te raden!&quot;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Lisa Jansen</p>
                        <p className="text-xs text-foreground-muted truncate">Uitbouw • €25.000</p>
                      </div>
                      <Badge variant="success" className="text-xs">Consument</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Review 6 - Contractor */}
              <FadeIn direction="up" delay={600}>
                <Card className="border-0 border-2 border-success/20 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardBody className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-base text-foreground mb-6 italic leading-relaxed flex-1">
                      &quot;Sinds ik alleen nog via VertrouwdBouwen werk, heb ik geen enkele betalingsachterstand meer gehad. Het systeem werkt perfect en mijn klanten zijn ook tevreden. Fantastisch platform!&quot;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">Bouwbedrijf Smit</p>
                        <p className="text-xs text-foreground-muted truncate">Aannemer • 75+ projecten</p>
                      </div>
                      <Badge variant="info" className="text-xs">Aannemer</Badge>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 6️⃣ WAAROM ESCROW ONMISBAAR IS? */}
        <section className="py-16 sm:py-20 lg:py-24 bg-surface">
          <SectionContainer maxWidth="7xl">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                  Waarom escrow onmisbaar is?
                </h2>
                <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                  Bescherming en zekerheid voor beide partijen
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {/* Consumentenvoordelen */}
              <FadeIn direction="right" delay={100}>
                <Card className="border-0 border-2 border-primary/20 rounded-2xl hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-lg">Consumentenvoordelen</span>
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="flex-1">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Geld blijft veilig</p>
                          <p className="text-sm text-foreground-muted">Tot je tevreden bent, blijft je geld beschermd.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Volledige controle</p>
                          <p className="text-sm text-foreground-muted">Jij bepaalt wanneer betaling wordt vrijgegeven.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Geen risico</p>
                          <p className="text-sm text-foreground-muted">Bescherming tegen onafgemaakt werk of slechte kwaliteit.</p>
                        </div>
                      </li>
                    </ul>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Veilige Oplevering (Center) */}
              <FadeIn direction="up" delay={200}>
                <Card className="border-0 border-2 border-primary rounded-2xl lg:border-primary/60 lg:scale-[1.02] relative z-10 hover:shadow-elevated transition-all duration-300 h-full flex flex-col">
                  <CardBody className="p-8 text-center flex-1 flex flex-col justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Veilige Oplevering</h3>
                    <p className="text-foreground-muted mb-6 leading-relaxed">
                      Escrow zorgt ervoor dat beide partijen beschermd zijn. Het geld wordt alleen vrijgegeven wanneer beide partijen akkoord zijn.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-foreground-muted">
                      <Shield className="w-5 h-5 text-success" />
                      <span>100% Veilig</span>
                    </div>
                  </CardBody>
                </Card>
              </FadeIn>

              {/* Aannemersvoordelen */}
              <FadeIn direction="left" delay={300}>
                <Card className="border-0 border-2 border-success/20 rounded-2xl hover:shadow-elevated transition-all duration-300 h-full flex flex-col md:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-success" />
                      </div>
                      <span className="text-lg">Aannemersvoordelen</span>
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="flex-1">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Gegarandeerde betaling</p>
                          <p className="text-sm text-foreground-muted">Het geld staat al klaar voordat je begint.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Snelle uitbetaling</p>
                          <p className="text-sm text-foreground-muted">Binnen 24 uur betaald na goedkeuring.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Geen incasso&apos;s</p>
                          <p className="text-sm text-foreground-muted">Geen gedoe meer met achterstallige betalingen.</p>
                        </div>
                      </li>
                    </ul>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 7️⃣ CTA VOOR SEGMENTATIE */}
        <section className="py-16 sm:py-20 lg:py-24">
          <SectionContainer maxWidth="7xl">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
              <FadeIn direction="right" delay={100}>
                <Card className="group hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 border-0 border-2 border-primary/20 rounded-2xl bg-gradient-to-br from-primary-subtle/20 to-transparent h-full">
                  <CardBody className="p-8 lg:p-10 text-center flex flex-col justify-between h-full">
                    <div>
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Home className="w-10 h-10 text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4">Start met veilig bouwen</h3>
                      <p className="text-foreground-muted mb-6">
                        Bescherm je investering en werk met vertrouwen met geverifieerde aannemers.
                      </p>
                    </div>
                    <Link href="/register?role=CUSTOMER" className="block">
                      <Button variant="primary" size="lg" className="w-full" endIcon={<ArrowRight className="h-5 w-5" />}>
                        Registreer als consument
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </FadeIn>

              <FadeIn direction="left" delay={200}>
                <Card className="group hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 border-0 border-2 border-success/20 rounded-2xl bg-gradient-to-br from-success-subtle/20 to-transparent h-full">
                  <CardBody className="p-8 lg:p-10 text-center flex flex-col justify-between h-full">
                    <div>
                      <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Building2 className="w-10 h-10 text-success-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4">Werk met gegarandeerde betaling</h3>
                      <p className="text-foreground-muted mb-6">
                        Ontvang gegarandeerde betalingen en focus op wat je het beste doet: bouwen.
                      </p>
                    </div>
                    <Link href="/register?role=CONTRACTOR" className="block">
                      <Button variant="secondary" size="lg" className="w-full bg-success hover:bg-success/90 text-success-foreground" endIcon={<ArrowRight className="h-5 w-5" />}>
                        Registreer als aannemer
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </FadeIn>
            </div>
          </SectionContainer>
        </section>

        {/* 8️⃣ FOOTER PER DOELGROEP */}
        <footer className="bg-surface border-t border-border-strong py-12 sm:py-16">
          <SectionContainer maxWidth="7xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-foreground-muted">
                    Vertrouwd
                  </p>
                  <p className="text-xl font-semibold text-foreground">Bouwen</p>
                </div>
                <p className="text-sm text-foreground-muted">
                  Het veilige escrow platform voor bouwprojecten. Bescherming voor consumenten en aannemers.
                </p>
              </div>

              {/* Voor Consumenten */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  Voor consumenten
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/hoe-het-werkt" className="text-foreground-muted hover:text-primary transition-colors">
                      Hoe escrow werkt
                    </Link>
                  </li>
                  <li>
                    <Link href="/consument/checklist" className="text-foreground-muted hover:text-primary transition-colors">
                      Checklist verbouwing
                    </Link>
                  </li>
                  <li>
                    <Link href="/calculator" className="text-foreground-muted hover:text-primary transition-colors">
                      Escrow calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/consument/hulp" className="text-foreground-muted hover:text-primary transition-colors">
                      Problemen oplossen
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Voor Aannemers */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-success" />
                  Voor aannemers
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/aannemer/werken-met-escrow" className="text-foreground-muted hover:text-primary transition-colors">
                      Werken met escrow
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/payments" className="text-foreground-muted hover:text-primary transition-colors">
                      Betaaloverzicht
                    </Link>
                  </li>
                  <li>
                    <Link href="/aannemer/tips" className="text-foreground-muted hover:text-primary transition-colors">
                      Klantcommunicatie tips
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-foreground-muted hover:text-primary transition-colors">
                      Professioneel profiel
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Algemeen */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Algemeen</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/login" className="text-foreground-muted hover:text-primary transition-colors">
                      Inloggen
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-foreground-muted hover:text-primary transition-colors">
                      Registreren
                    </Link>
                  </li>
                  <li>
                    <Link href="/over-ons" className="text-foreground-muted hover:text-primary transition-colors">
                      Over ons
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-foreground-muted hover:text-primary transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border-strong text-center">
              <p className="text-sm text-foreground-muted">
                © 2024 VertrouwdBouwen. Alle rechten voorbehouden.
              </p>
            </div>
          </SectionContainer>
        </footer>
      </main>
    </div>
  );
}
