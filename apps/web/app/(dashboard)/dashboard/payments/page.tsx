'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { getProjects, Project } from '@/lib/api/projects';
import { getConsumerProjectPayments, ProjectPayment } from '@/lib/api/project-payments';
import { getContractorPayouts, Payout } from '@/lib/api/payouts';
import { formatCurrency } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  NOT_FUNDED: 'Niet gefund',
  PARTIALLY_FUNDED: 'Gedeeltelijk gefund',
  FULLY_FUNDED: 'Volledig gefund',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  NOT_FUNDED: 'bg-red-100 text-red-800',
  PARTIALLY_FUNDED: 'bg-yellow-100 text-yellow-800',
  FULLY_FUNDED: 'bg-green-100 text-green-800',
};

const PROJECT_PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING_CONSUMER: 'Wacht op consument',
  PENDING_ADMIN_REVIEW: 'Wacht op admin review',
  ESCROW_CONFIRMED: 'Bevestigd',
  REJECTED: 'Afgewezen',
};

const PROJECT_PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING_CONSUMER: 'bg-gray-100 text-gray-800',
  PENDING_ADMIN_REVIEW: 'bg-yellow-100 text-yellow-800',
  ESCROW_CONFIRMED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function PaymentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && (user.role === 'CUSTOMER' || user.role === 'CONTRACTOR')) {
      loadData();
    } else if (user && user.role === 'ADMIN') {
      // Admin users should use the admin dashboard for payments
      // Stop loading state to prevent infinite loading
      setIsLoading(false);
    }
  }, [user]);

  const loadData = async () => {
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
  };

  const handleInitiatePayment = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}?action=pay`);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  // Toon loading state tijdens auth check
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

  // Toon toegang geweigerd voor niet-consumenten
  if (!user) {
    return null;
  }

  if (user.role !== 'CUSTOMER' && user.role !== 'CONTRACTOR') {
    // Admin users should use the admin dashboard
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

  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Betalingen"
          meta="Financiën"
          description="Overzicht van escrow-betalingen en project funding status"
        />

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Niet-gefunde projecten */}
        {unfundedProjects.length > 0 && (
          <PageSection
            title="Projecten die nog gefund moeten worden"
            description="Deze projecten hebben nog geen escrow-betaling ontvangen"
          >
            <div className="space-y-4">
              {unfundedProjects.map((project) => (
                <Card key={project.id}>
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        <div className="mt-3 flex items-center gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground">
                              Totaal budget:
                            </span>
                            <span className="ml-2 font-semibold">
                              {formatCurrency(project.totalBudget)}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              PAYMENT_STATUS_COLORS[project.paymentStatus || 'NOT_FUNDED']
                            }`}
                          >
                            {PAYMENT_STATUS_LABELS[project.paymentStatus || 'NOT_FUNDED']}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="primary"
                          onClick={() => handleInitiatePayment(project.id)}
                        >
                          Escrow betaling doen
                        </Button>
                      </div>
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
            title="Gefunde projecten"
            description="Projecten met escrow-betalingen"
          >
            <div className="space-y-4">
              {fundedProjects.map((project) => {
                const projectPayments = paymentsByProject[project.id] || [];
                const confirmedPayments = projectPayments.filter(
                  (p) => p.status === 'ESCROW_CONFIRMED'
                );
                const totalConfirmed = confirmedPayments.reduce(
                  (sum, p) => sum + p.amount,
                  0
                );

                return (
                  <Card key={project.id}>
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {project.title}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                PAYMENT_STATUS_COLORS[project.paymentStatus || 'NOT_FUNDED']
                              }`}
                            >
                              {PAYMENT_STATUS_LABELS[project.paymentStatus || 'NOT_FUNDED']}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {project.description}
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Totaal budget:
                                </span>
                                <span className="ml-2 font-semibold">
                                  {formatCurrency(project.totalBudget)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Gefund:
                                </span>
                                <span className="ml-2 font-semibold text-green-600">
                                  {formatCurrency(project.escrowFundedAmount || totalConfirmed)}
                                </span>
                              </div>
                            </div>
                            {projectPayments.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-foreground">
                                  Betalingen:
                                </h4>
                                <div className="mt-2 space-y-2">
                                  {projectPayments.map((payment) => (
                                    <div
                                      key={payment.id}
                                      className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="font-medium">
                                          {formatCurrency(payment.amount)}
                                        </span>
                                        <span
                                          className={`rounded-full px-2 py-1 text-xs ${
                                            PROJECT_PAYMENT_STATUS_COLORS[payment.status]
                                          }`}
                                        >
                                          {PROJECT_PAYMENT_STATUS_LABELS[payment.status]}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(payment.createdAt).toLocaleDateString('nl-NL')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            variant="secondary"
                            onClick={() => handleViewProject(project.id)}
                          >
                            Bekijk project
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

        {/* Aannemer sectie - payouts */}
        {!isCustomer && (
          <>
            {/* Ontvangen betalingen */}
            {payouts.filter((p) => p.status === 'PAID').length > 0 && (
              <PageSection
                title="Ontvangen betalingen"
                description="Betalingen die je al hebt ontvangen"
              >
                <div className="space-y-4">
                  {payouts
                    .filter((p) => p.status === 'PAID')
                    .map((payout) => (
                      <Card key={payout.id}>
                        <CardBody>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground">
                                {payout.milestone?.title || 'Milestone'}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Project: {payout.project?.title || 'Onbekend project'}
                              </p>
                              <div className="mt-3 flex items-center gap-4">
                                <div>
                                  <span className="text-sm text-muted-foreground">
                                    Bedrag:
                                  </span>
                                  <span className="ml-2 font-semibold text-green-600">
                                    {formatCurrency(payout.amount)}
                                  </span>
                                </div>
                                {payout.paidAt && (
                                  <div>
                                    <span className="text-sm text-muted-foreground">
                                      Betaald op:
                                    </span>
                                    <span className="ml-2 text-sm">
                                      {new Date(payout.paidAt).toLocaleDateString('nl-NL')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                              Betaald
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                </div>
              </PageSection>
            )}

            {/* Openstaande uitbetalingen */}
            {payouts.filter((p) => p.status === 'PENDING_ADMIN_PAYOUT').length > 0 && (
              <PageSection
                title="Openstaande uitbetalingen"
                description="Milestones die goedgekeurd zijn maar nog niet uitbetaald"
              >
                <div className="space-y-4">
                  {payouts
                    .filter((p) => p.status === 'PENDING_ADMIN_PAYOUT')
                    .map((payout) => (
                      <Card key={payout.id}>
                        <CardBody>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground">
                                {payout.milestone?.title || 'Milestone'}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Project: {payout.project?.title || 'Onbekend project'}
                              </p>
                              <div className="mt-3 flex items-center gap-4">
                                <div>
                                  <span className="text-sm text-muted-foreground">
                                    Bedrag:
                                  </span>
                                  <span className="ml-2 font-semibold">
                                    {formatCurrency(payout.amount)}
                                  </span>
                                </div>
                                {payout.requestedAt && (
                                  <div>
                                    <span className="text-sm text-muted-foreground">
                                      Aangevraagd op:
                                    </span>
                                    <span className="ml-2 text-sm">
                                      {new Date(payout.requestedAt).toLocaleDateString('nl-NL')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                              In afwachting
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                </div>
              </PageSection>
            )}

            {/* Potentieel te verdienen */}
            {projects.length > 0 && (
              <PageSection
                title="Potentieel te verdienen"
                description="Bedrag dat je nog kunt verdienen door milestones af te ronden"
              >
                <div className="space-y-4">
                  {projects
                    .filter((p) => p.contractorId === user?.id)
                    .map((project) => {
                      const projectPayouts = payouts.filter((p) => p.projectId === project.id);
                      const paidAmount = projectPayouts
                        .filter((p) => p.status === 'PAID')
                        .reduce((sum, p) => sum + p.amount, 0);
                      const pendingAmount = projectPayouts
                        .filter((p) => p.status === 'PENDING_ADMIN_PAYOUT')
                        .reduce((sum, p) => sum + p.amount, 0);
                      const completedMilestones = project.milestones?.filter(
                        (m) => m.status === 'APPROVED' || m.status === 'PAID'
                      ) || [];
                      const remainingMilestones = project.milestones?.filter(
                        (m) => m.status !== 'APPROVED' && m.status !== 'PAID'
                      ) || [];
                      const potentialEarnings = remainingMilestones.reduce(
                        (sum, m) => sum + m.amount,
                        0
                      );

                      return (
                        <Card key={project.id}>
                          <CardBody>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {project.title}
                                </h3>
                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Ontvangen:
                                      </span>
                                      <span className="ml-2 font-semibold text-green-600">
                                        {formatCurrency(paidAmount)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        In afwachting:
                                      </span>
                                      <span className="ml-2 font-semibold text-yellow-600">
                                        {formatCurrency(pendingAmount)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Potentieel:
                                      </span>
                                      <span className="ml-2 font-semibold">
                                        {formatCurrency(potentialEarnings)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Button
                                  variant="secondary"
                                  onClick={() => handleViewProject(project.id)}
                                >
                                  Bekijk project
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
          </>
        )}

        {/* Lege state */}
        {projects.length === 0 && !isLoading && (
          <PageSection title={isCustomer ? 'Geen projecten' : 'Geen payouts'}>
            <EmptyState
              title={isCustomer ? 'Nog geen projecten' : 'Nog geen payouts'}
              description={
                isCustomer
                  ? 'Je hebt nog geen projecten aangemaakt. Maak een project aan om escrow-betalingen te doen.'
                  : 'Je hebt nog geen payouts ontvangen. Zodra milestones zijn goedgekeurd, verschijnen ze hier.'
              }
              action={
                <Button
                  variant="primary"
                  onClick={() => router.push('/dashboard/projects')}
                >
                  {isCustomer ? 'Maak project aan' : 'Bekijk projecten'}
                </Button>
              }
            />
          </PageSection>
        )}
      </PageShell>
    </div>
  );
}
