'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Eye,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { getProjects, Project } from '@/lib/api/projects';
import { getConsumerProjectPayments, ProjectPayment } from '@/lib/api/project-payments';
import { getContractorPayouts, Payout } from '@/lib/api/payouts';
import { formatCurrency } from '@/lib/utils/format';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  NOT_FUNDED: 'Niet gefund',
  PARTIALLY_FUNDED: 'Gedeeltelijk gefund',
  FULLY_FUNDED: 'Volledig gefund',
};

const PROJECT_PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING_CONSUMER: 'Wacht op consument',
  PENDING_ADMIN_REVIEW: 'Wacht op review',
  ESCROW_CONFIRMED: 'Bevestigd',
  REJECTED: 'Afgewezen',
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: string;
}

function KPICard({ title, value, subtitle, icon, iconColor = 'text-primary', trend }: KPICardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground-muted mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-foreground-muted mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`${iconColor} p-3 rounded-xl bg-primary/10 dark:bg-primary/20`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function PaymentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user?.role === 'CUSTOMER') {
        const [projectsResponse, paymentsResponse] = await Promise.all([
          getProjects(),
          getConsumerProjectPayments(),
        ]);

        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data);
        } else {
          setError(projectsResponse.error?.message || 'Fout bij het laden van projecten');
        }

        if (paymentsResponse.success && paymentsResponse.data) {
          setPayments(paymentsResponse.data);
        }
      } else if (user?.role === 'CONTRACTOR') {
        const [projectsResponse, payoutsResponse] = await Promise.all([
          getProjects(),
          getContractorPayouts(),
        ]);

        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data);
        } else {
          setError(projectsResponse.error?.message || 'Fout bij het laden van projecten');
        }

        if (payoutsResponse.success && payoutsResponse.data) {
          setPayouts(payoutsResponse.data);
        }
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.role === 'CUSTOMER' || user.role === 'CONTRACTOR')) {
      loadData();
    } else if (user && user.role === 'ADMIN') {
      setIsLoading(false);
    }
  }, [user, loadData]);

  const handleInitiatePayment = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}?action=pay`);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Betalingen"
            description="Laden..."
            meta="Financiën"
          />
          <div className="flex items-center justify-center py-16">
            <Loading size="lg" />
          </div>
        </PageShell>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'CUSTOMER' && user.role !== 'CONTRACTOR') {
    if (user.role === 'ADMIN') {
      return (
        <div className="bg-background pb-16">
          <PageShell>
            <PageHeader
              title="Admin Betalingen"
              description="Gebruik het admin dashboard voor betalingsbeheer."
              meta="Financiën"
            />
            <EmptyState
              title="Admin Betalingen"
              description="Als admin kun je betalingen en escrow beheren via het admin dashboard."
              action={
                <Button
                  variant="primary"
                  onClick={() => router.replace('/dashboard/admin')}
                >
                  Ga naar Admin Dashboard
                </Button>
              }
            />
          </PageShell>
        </div>
      );
    }
    
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Toegang geweigerd"
            description="Alleen consumenten en aannemers kunnen betalingen bekijken."
            meta="Financiën"
          />
          <EmptyState
            title="Geen toegang"
            description="Je hebt geen toegang tot deze pagina."
            action={
              <Button
                variant="primary"
                onClick={() => router.replace('/dashboard')}
              >
                Ga naar dashboard
              </Button>
            }
          />
        </PageShell>
      </div>
    );
  }

  const isCustomer = user.role === 'CUSTOMER';

  // Groepeer payments per project
  const paymentsByProject = payments.reduce((acc, payment) => {
    if (!acc[payment.projectId]) {
      acc[payment.projectId] = [];
    }
    acc[payment.projectId].push(payment);
    return acc;
  }, {} as Record<string, ProjectPayment[]>);

  // Projecten die niet gefund zijn
  const unfundedProjects = projects.filter(
    (p) => p.paymentStatus === 'NOT_FUNDED' || !p.paymentStatus
  );

  // Projecten die gedeeltelijk of volledig gefund zijn
  const fundedProjects = projects.filter(
    (p) => p.paymentStatus === 'PARTIALLY_FUNDED' || p.paymentStatus === 'FULLY_FUNDED'
  );

  // ============================================
  // CONSUMENT DASHBOARD
  // ============================================
  if (isCustomer) {
    // Bereken KPI's voor consument
    const confirmedPayments = payments.filter(p => p.status === 'ESCROW_CONFIRMED');
    const pendingPayments = payments.filter(p => p.status === 'PENDING_ADMIN_REVIEW' || p.status === 'PENDING_CONSUMER');
    const totalPaid = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
    const remainingToFund = totalBudget - totalPaid;

    // Openstaande escrow betalingen (pending)
    const openPendingPayments = payments.filter(
      p => p.status === 'PENDING_ADMIN_REVIEW' || p.status === 'PENDING_CONSUMER'
    );

    // Bevestigde escrow betalingen
    const confirmedEscrowPayments = payments.filter(
      p => p.status === 'ESCROW_CONFIRMED'
    );

    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Betalingen"
            meta="Financiën"
            description="Overzicht van escrow-betalingen en project funding"
          />

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* KPI Cards - Consument */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Totaal Betaald"
              value={formatCurrency(totalPaid)}
              subtitle={`${confirmedPayments.length} bevestigde betalingen`}
              icon={<CheckCircle className="h-6 w-6" />}
              iconColor="text-success"
            />
            <KPICard
              title="Openstaande Betalingen"
              value={formatCurrency(pendingAmount)}
              subtitle={`${pendingPayments.length} in afwachting`}
              icon={<Clock className="h-6 w-6" />}
              iconColor="text-warning"
            />
            <KPICard
              title="Bevestigde Escrow"
              value={formatCurrency(totalPaid)}
              subtitle="In escrow gezet"
              icon={<ShieldCheck className="h-6 w-6" />}
              iconColor="text-info"
            />
            <KPICard
              title="Nog Te Betalen"
              value={formatCurrency(Math.max(0, remainingToFund))}
              subtitle="Om project te starten"
              icon={<DollarSign className="h-6 w-6" />}
              iconColor="text-primary"
            />
          </div>

          {/* Openstaande escrow betalingen */}
          {openPendingPayments.length > 0 && (
            <PageSection
              title="Openstaande Escrow Betalingen"
              description="Betalingen die wachten op bevestiging"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openPendingPayments.map((payment) => {
                  const project = projects.find(p => p.id === payment.projectId);
                  return (
                    <Card key={payment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base mb-1">
                              {project?.title || 'Onbekend project'}
                            </CardTitle>
                            <p className="text-sm text-foreground-muted">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                          <Badge variant={payment.status === 'PENDING_ADMIN_REVIEW' ? 'warning' : 'neutral'}>
                            {PROJECT_PAYMENT_STATUS_LABELS[payment.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs text-foreground-muted">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(payment.createdAt).toLocaleDateString('nl-NL')}</span>
                          </div>
                          {payment.transactionRef && (
                            <div className="text-xs text-foreground-muted">
                              Ref: {payment.transactionRef}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleViewProject(payment.projectId)}
                              className="flex-1"
                              startIcon={<Eye className="h-4 w-4" />}
                            >
                              Bekijk Project
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </PageSection>
          )}

          {/* Bevestigde escrow betalingen */}
          {confirmedEscrowPayments.length > 0 && (
            <PageSection
              title="Bevestigde Escrow Betalingen"
              description="Betalingen die zijn goedgekeurd en in escrow staan"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {confirmedEscrowPayments.map((payment) => {
                  const project = projects.find(p => p.id === payment.projectId);
                  return (
                    <Card key={payment.id} className="hover:shadow-md transition-shadow">
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-foreground mb-1">
                              {project?.title || 'Onbekend project'}
                            </h4>
                            <p className="text-lg font-bold text-success">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                          <Badge variant="success">Bevestigd</Badge>
                        </div>
                        <div className="space-y-2 text-xs text-foreground-muted">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Bevestigd: {payment.confirmedAt ? new Date(payment.confirmedAt).toLocaleDateString('nl-NL') : 'N/A'}</span>
                          </div>
                          {payment.transactionRef && (
                            <div className="text-xs">Ref: {payment.transactionRef}</div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </PageSection>
          )}

          {/* Projecten die nog gefund moeten worden */}
          {unfundedProjects.length > 0 && (
            <PageSection
              title="Projecten Die Nog Gefund Moeten Worden"
              description="Start escrow-betalingen voor deze projecten"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unfundedProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">{project.title}</CardTitle>
                          <p className="text-sm text-foreground-muted line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <Badge variant="danger">Niet gefund</Badge>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground-muted">Totaal budget:</span>
                          <span className="font-bold">{formatCurrency(project.totalBudget)}</span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleInitiatePayment(project.id)}
                          className="w-full"
                          startIcon={<CreditCard className="h-4 w-4" />}
                        >
                          Escrow Betaling Bevestigen
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </PageSection>
          )}

          {/* Gefunde projecten */}
          {fundedProjects.length > 0 && (
            <PageSection
              title="Gefunde Projecten"
              description="Projecten met escrow-betalingen"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fundedProjects.map((project) => {
                  const projectPayments = paymentsByProject[project.id] || [];
                  const confirmedPayments = projectPayments.filter(
                    (p) => p.status === 'ESCROW_CONFIRMED'
                  );
                  const totalConfirmed = confirmedPayments.reduce(
                    (sum, p) => sum + p.amount,
                    0
                  );
                  const fundingPercentage = (totalConfirmed / project.totalBudget) * 100;

                  return (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base mb-1">{project.title}</CardTitle>
                            <p className="text-sm text-foreground-muted line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <Badge variant={project.paymentStatus === 'FULLY_FUNDED' ? 'success' : 'warning'}>
                            {PAYMENT_STATUS_LABELS[project.paymentStatus || 'NOT_FUNDED']}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground-muted">Totaal budget:</span>
                              <span className="font-bold">{formatCurrency(project.totalBudget)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground-muted">Gefund:</span>
                              <span className="font-bold text-success">
                                {formatCurrency(project.escrowFundedAmount || totalConfirmed)}
                              </span>
                            </div>
                            <div className="w-full bg-surface-muted rounded-full h-2">
                              <div
                                className="bg-success h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, fundingPercentage)}%` }}
                              />
                            </div>
                            <p className="text-xs text-foreground-muted text-right">
                              {fundingPercentage.toFixed(0)}% gefund
                            </p>
                          </div>
                          {projectPayments.length > 0 && (
                            <div className="pt-2 border-t border-border">
                              <p className="text-xs font-medium text-foreground-muted mb-2">
                                Betalingsgeschiedenis ({projectPayments.length})
                              </p>
                              <div className="space-y-1">
                                {projectPayments.slice(0, 3).map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex items-center justify-between text-xs py-1"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {formatCurrency(payment.amount)}
                                      </span>
                                      <Badge
                                        variant={
                                          payment.status === 'ESCROW_CONFIRMED'
                                            ? 'success'
                                            : payment.status === 'REJECTED'
                                            ? 'danger'
                                            : 'warning'
                                        }
                                        className="text-[10px] px-1.5 py-0"
                                      >
                                        {PROJECT_PAYMENT_STATUS_LABELS[payment.status]}
                                      </Badge>
                                    </div>
                                    <span className="text-foreground-muted">
                                      {new Date(payment.createdAt).toLocaleDateString('nl-NL')}
                                    </span>
                                  </div>
                                ))}
                                {projectPayments.length > 3 && (
                                  <p className="text-xs text-foreground-muted text-center pt-1">
                                    +{projectPayments.length - 3} meer
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewProject(project.id)}
                            className="w-full"
                            startIcon={<Eye className="h-4 w-4" />}
                          >
                            Bekijk Project Details
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </PageSection>
          )}

          {/* Lege state */}
          {projects.length === 0 && !isLoading && (
            <PageSection title="Geen projecten">
              <EmptyState
                title="Nog geen projecten"
                description="Je hebt nog geen projecten aangemaakt. Maak een project aan om escrow-betalingen te doen."
                action={
                  <Button
                    variant="primary"
                    onClick={() => router.push('/dashboard/projects')}
                  >
                    Maak project aan
                  </Button>
                }
              />
            </PageSection>
          )}
        </PageShell>
      </div>
    );
  }

  // ============================================
  // AANNEMER DASHBOARD
  // ============================================
  const contractorProjects = projects.filter(p => p.contractorId === user?.id);
  const paidPayouts = payouts.filter(p => p.status === 'PAID');
  const pendingPayouts = payouts.filter(p => p.status === 'PENDING_ADMIN_PAYOUT');
  
  // Bereken KPI's voor aannemer
  const totalEarned = paidPayouts.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
  
  // Potentieel te verdienen (nog niet afgeronde milestones)
  let potentialEarnings = 0;
  let activeProjects = 0;
  contractorProjects.forEach(project => {
    const projectMilestones = project.milestones || [];
    const incompleteMilestones = projectMilestones.filter(
      m => m.status !== 'APPROVED' && m.status !== 'PAID'
    );
    potentialEarnings += incompleteMilestones.reduce((sum, m) => sum + m.amount, 0);
    if (project.status === 'IN_PROGRESS' || project.status === 'ACTIVE') {
      activeProjects++;
    }
  });


  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Betalingen"
          meta="Financiën"
          description="Overzicht van uitbetalingen en project financiën"
        />

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* KPI Cards - Aannemer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Totaal Verdiend"
            value={formatCurrency(totalEarned)}
            subtitle={`${paidPayouts.length} uitbetalingen`}
            icon={<CheckCircle className="h-6 w-6" />}
            iconColor="text-success"
          />
          <KPICard
            title="Openstaande Uitbetalingen"
            value={formatCurrency(pendingAmount)}
            subtitle={`${pendingPayouts.length} in afwachting`}
            icon={<Clock className="h-6 w-6" />}
            iconColor="text-warning"
          />
          <KPICard
            title="Potentieel Te Verdienen"
            value={formatCurrency(potentialEarnings)}
            subtitle="Nog te voltooien milestones"
            icon={<TrendingUp className="h-6 w-6" />}
            iconColor="text-info"
          />
          <KPICard
            title="Projecten In Uitvoering"
            value={activeProjects.toString()}
            subtitle="Actieve projecten"
            icon={<Wallet className="h-6 w-6" />}
            iconColor="text-primary"
          />
        </div>

        {/* Project-based overzicht */}
        {contractorProjects.length > 0 && (
          <PageSection
            title="Project Financiën"
            description="Overzicht per project met milestones en uitbetalingen"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {contractorProjects.map((project) => {
                const projectPayouts = payouts.filter(p => p.projectId === project.id);
                const paidAmount = projectPayouts
                  .filter(p => p.status === 'PAID')
                  .reduce((sum, p) => sum + p.amount, 0);
                const pendingAmount = projectPayouts
                  .filter(p => p.status === 'PENDING_ADMIN_PAYOUT')
                  .reduce((sum, p) => sum + p.amount, 0);
                
                const projectMilestones = project.milestones || [];
                const completedMilestones = projectMilestones.filter(
                  m => m.status === 'APPROVED' || m.status === 'PAID'
                );
                const remainingMilestones = projectMilestones.filter(
                  m => m.status !== 'APPROVED' && m.status !== 'PAID'
                );
                const potentialEarnings = remainingMilestones.reduce(
                  (sum, m) => sum + m.amount,
                  0
                );

                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">{project.title}</CardTitle>
                          <p className="text-sm text-foreground-muted line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <Badge variant={
                          project.paymentStatus === 'FULLY_FUNDED' ? 'success' :
                          project.paymentStatus === 'PARTIALLY_FUNDED' ? 'warning' : 'danger'
                        }>
                          {PAYMENT_STATUS_LABELS[project.paymentStatus || 'NOT_FUNDED']}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-4">
                        {/* Financiële overzicht */}
                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                          <div className="text-center">
                            <p className="text-xs text-foreground-muted mb-1">Ontvangen</p>
                            <p className="text-sm font-bold text-success">
                              {formatCurrency(paidAmount)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-foreground-muted mb-1">In afwachting</p>
                            <p className="text-sm font-bold text-warning">
                              {formatCurrency(pendingAmount)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-foreground-muted mb-1">Potentieel</p>
                            <p className="text-sm font-bold">
                              {formatCurrency(potentialEarnings)}
                            </p>
                          </div>
                        </div>

                        {/* Milestone statistieken */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                          <span className="text-foreground-muted">
                            {completedMilestones.length} / {projectMilestones.length} milestones voltooid
                          </span>
                          <span className="font-medium">
                            {projectMilestones.length > 0 
                              ? Math.round((completedMilestones.length / projectMilestones.length) * 100)
                              : 0}%
                          </span>
                        </div>

                        {/* Acties */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewProject(project.id)}
                            className="flex-1"
                            startIcon={<Eye className="h-4 w-4" />}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </PageSection>
        )}

        {/* Openstaande uitbetalingen */}
        {pendingPayouts.length > 0 && (
          <PageSection
            title="Openstaande Uitbetalingen"
            description="Milestones die goedgekeurd zijn maar nog niet uitbetaald"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPayouts.map((payout) => (
                <Card key={payout.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">
                          {payout.milestone?.title || 'Milestone'}
                        </CardTitle>
                        <p className="text-sm text-foreground-muted">
                          {payout.project?.title || 'Onbekend project'}
                        </p>
                      </div>
                      <Badge variant="warning">In afwachting</Badge>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground-muted">Bedrag:</span>
                        <span className="text-lg font-bold">{formatCurrency(payout.amount)}</span>
                      </div>
                      {payout.requestedAt && (
                        <div className="flex items-center gap-2 text-xs text-foreground-muted">
                          <Calendar className="h-3 w-3" />
                          <span>Aangevraagd: {new Date(payout.requestedAt).toLocaleDateString('nl-NL')}</span>
                        </div>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewProject(payout.projectId)}
                        className="w-full"
                        startIcon={<Eye className="h-4 w-4" />}
                      >
                        Bekijk Project
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </PageSection>
        )}

        {/* Ontvangen betalingen */}
        {paidPayouts.length > 0 && (
          <PageSection
            title="Ontvangen Betalingen"
            description="Betalingen die je al hebt ontvangen"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paidPayouts.map((payout) => (
                <Card key={payout.id} className="hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground mb-1">
                          {payout.milestone?.title || 'Milestone'}
                        </h4>
                        <p className="text-xs text-foreground-muted mb-2">
                          {payout.project?.title || 'Onbekend project'}
                        </p>
                        <p className="text-lg font-bold text-success">
                          {formatCurrency(payout.amount)}
                        </p>
                      </div>
                      <Badge variant="success">Betaald</Badge>
                    </div>
                    {payout.paidAt && (
                      <div className="flex items-center gap-2 text-xs text-foreground-muted">
                        <Calendar className="h-3 w-3" />
                        <span>Betaald: {new Date(payout.paidAt).toLocaleDateString('nl-NL')}</span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          </PageSection>
        )}

        {/* Lege state */}
        {contractorProjects.length === 0 && payouts.length === 0 && !isLoading && (
          <PageSection title="Geen payouts">
            <EmptyState
              title="Nog geen payouts"
              description="Je hebt nog geen payouts ontvangen. Zodra milestones zijn goedgekeurd, verschijnen ze hier."
              action={
                <Button
                  variant="primary"
                  onClick={() => router.push('/dashboard/projects')}
                >
                  Bekijk projecten
                </Button>
              }
            />
          </PageSection>
        )}
      </PageShell>
    </div>
  );
}
