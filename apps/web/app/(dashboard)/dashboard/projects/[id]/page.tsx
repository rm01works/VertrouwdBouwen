'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, DollarSign, Calendar, User, Mail, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById, Project } from '@/lib/api/projects';
import { MilestoneList } from '@/components/projects/MilestoneList';
import { PaymentForm } from '@/components/projects/PaymentForm';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge, getStatusBadgeVariant, getStatusLabel } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Loading } from '@/components/ui/Loading';
import { PageHeader, PageSection, PageShell } from '@/components/layout/Page';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { user } = useAuth();

  // Check if payment form should be opened from URL
  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'pay') {
      setShowPaymentForm(true);
      // Remove query param from URL without triggering navigation
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProjectById(projectId);

      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError(response.error?.message || 'Fout bij het laden van project');
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const sortedMilestones = useMemo(
    () =>
      project?.milestones
        ? [...project.milestones].sort((a, b) => a.order - b.order)
        : [],
    [project?.milestones],
  );

  if (isLoading) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <Card>
            <CardBody className="flex justify-center py-16">
              <Loading size="lg" />
            </CardBody>
          </Card>
        </PageShell>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <Card className="border-danger bg-danger-subtle">
            <CardBody>
              <p className="text-danger">{error || 'Project niet gevonden'}</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => router.back()}>
                Terug
              </Button>
            </CardBody>
          </Card>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title={project.title}
          description="Volledige projectinformatie, milestones en budgetten."
          meta={
            <Badge variant={getStatusBadgeVariant(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
          }
          actions={
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()} startIcon={<ArrowLeft className="h-4 w-4" />}>
                Terug
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  document.getElementById('milestones')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Naar milestones
              </Button>
            </div>
          }
        />

        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border border-gray-200 dark:border-neutral-700">
            <CardBody className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Budget</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(project.totalBudget)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Escrow Status</p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {project.paymentStatus === 'FULLY_FUNDED' && (
                    <Badge variant="success" className="text-sm font-semibold">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Volledig gefund
                    </Badge>
                  )}
                  {project.paymentStatus === 'PARTIALLY_FUNDED' && (
                    <Badge variant="warning" className="text-sm font-semibold">
                      ⚠ Gedeeltelijk gefund
                    </Badge>
                  )}
                  {(project.paymentStatus === 'NOT_FUNDED' || !project.paymentStatus) && (
                    <Badge variant="danger" className="text-sm font-semibold">
                      ✗ Niet gefund
                    </Badge>
                  )}
                  {project.escrowFundedAmount !== undefined && (
                    <span className="text-sm text-foreground-muted">
                      ({formatCurrency(project.escrowFundedAmount)})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Tijdlijn</p>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {project.startDate && project.endDate
                    ? `${formatDate(project.startDate)} — ${formatDate(project.endDate)}`
                    : 'Niet opgegeven'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Aangemaakt</p>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {formatDate(project.createdAt || project.updatedAt || new Date().toISOString())}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Contact</p>
                </div>
                <p className="text-base font-bold text-foreground">
                  {project.customer
                    ? `${project.customer.firstName} ${project.customer.lastName}`
                    : 'Onbekend'}
                </p>
                {project.customer?.email && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                    <Mail className="h-3 w-3" />
                    <span>{project.customer.email}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
          <Card className="border border-gray-200 dark:border-neutral-700">
            <CardBody className="space-y-3">
              <p className="text-sm text-foreground-muted">
                Houd milestones bij en bevestig betalingen zodra werk gereed is.
              </p>
              <div className="flex flex-col gap-2">
                {user?.role === 'CUSTOMER' && project.paymentStatus !== 'FULLY_FUNDED' && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => setShowPaymentForm(true)}
                    startIcon={<CreditCard className="h-4 w-4" />}
                  >
                    Escrow Betaling Bevestigen
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={loadProject} startIcon={<RefreshCw className="h-4 w-4" />}>
                  Vernieuwen
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <PageSection title="Projectbeschrijving">
          <p className="text-base leading-relaxed text-foreground-muted whitespace-pre-wrap">
            {project.description}
          </p>
        </PageSection>

        <PageSection
          className="mt-10"
          title="Milestones"
          description="Elke milestone wordt uitbetaald zodra deze is goedgekeurd."
          actions={
            <Badge variant="info" className="text-sm">
              {sortedMilestones.length} totaal
            </Badge>
          }
          contentClassName="p-0"
        >
          <MilestoneList
            milestones={sortedMilestones}
            projectOwnerId={project.customer?.id}
            contractorId={project.contractorId}
            projectStatus={project.status}
            projectPaymentStatus={project.paymentStatus}
            userRole={user?.role || 'CONTRACTOR'}
            projectBudget={project.totalBudget}
            onUpdate={loadProject}
          />
        </PageSection>

        {/* Payment Form Modal */}
        {project && user?.role === 'CUSTOMER' && (
          <PaymentForm
            projectId={project.id}
            projectTitle={project.title}
            totalBudget={Number(project.totalBudget)}
            currentFunded={Number(project.escrowFundedAmount || 0)}
            isOpen={showPaymentForm}
            onClose={() => setShowPaymentForm(false)}
            onSuccess={loadProject}
          />
        )}
      </PageShell>
    </div>
  );
}
