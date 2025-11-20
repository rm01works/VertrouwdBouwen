'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { getAllMilestones, Milestone } from '@/lib/api/milestones';
import { MilestoneList } from '@/components/projects/MilestoneList';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';
import { useToast } from '@/hooks/useToast';

export default function MilestonesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadMilestones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllMilestones();

      if (response.success && response.data) {
        setMilestones(response.data);
      } else {
        setError(response.error?.message || 'Fout bij het laden van milestones');
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadMilestones();
    }
  }, [authLoading, user, loadMilestones]);

  // Bepaal welke milestones wachten op actie van de ingelogde gebruiker
  const awaitingAction = useMemo(() => {
    if (!user || !milestones.length) return [];

    return milestones.filter((milestone) => {
      // Voor consumenten: milestones die SUBMITTED zijn en nog niet goedgekeurd
      if (user.role === 'CUSTOMER') {
        return (
          milestone.status === 'SUBMITTED' &&
          !milestone.approvedByConsumer &&
          milestone.payments?.some((p) => p.status === 'HELD')
        );
      }

      // Voor aannemers: milestones die SUBMITTED zijn en nog niet goedgekeurd door aannemer
      if (user.role === 'CONTRACTOR') {
        return (
          milestone.status === 'SUBMITTED' &&
          !milestone.approvedByContractor &&
          milestone.payments?.some((p) => p.status === 'HELD')
        );
      }

      return false;
    });
  }, [milestones, user]);

  // Filter milestones op basis van status
  const filteredMilestones = useMemo(() => {
    if (statusFilter === 'all') return milestones;
    if (statusFilter === 'awaiting') return awaitingAction;
    return milestones.filter((m) => m.status === statusFilter);
  }, [milestones, statusFilter, awaitingAction]);

  // Groepeer milestones per project
  const milestonesByProject = useMemo(() => {
    const grouped: Record<string, Milestone[]> = {};
    filteredMilestones.forEach((milestone) => {
      const projectId = milestone.projectId;
      if (!grouped[projectId]) {
        grouped[projectId] = [];
      }
      grouped[projectId].push(milestone);
    });
    return grouped;
  }, [filteredMilestones]);

  if (authLoading || isLoading) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Milestones"
            description="Laden..."
            meta="Workflow"
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

  if (error) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Milestones"
            description="Fout bij het laden"
            meta="Workflow"
          />
          <Card className="border-danger bg-danger-subtle">
            <CardBody>
              <p className="text-danger">{error}</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={loadMilestones}>
                Opnieuw proberen
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
          title="Milestones"
          description="Overzicht van alle milestones uit alle projecten"
          meta="Workflow"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={loadMilestones}>
                Vernieuwen
              </Button>
            </div>
          }
        />

        {/* "Wacht op jouw actie" sectie */}
        {awaitingAction.length > 0 && (
          <PageSection
            title="Actie vereist"
            description={`${awaitingAction.length} milestone${awaitingAction.length > 1 ? 's' : ''} wachten op jouw goedkeuring`}
            className="mb-8"
          >
            <Card className="border-warning bg-warning-subtle">
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Wacht op jouw actie
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      Er {awaitingAction.length === 1 ? 'staat' : 'staan'} {awaitingAction.length} milestone{awaitingAction.length > 1 ? 's' : ''} klaar voor goedkeuring.
                    </p>
                  </div>
                  <Badge variant="warning" className="text-sm">
                    {awaitingAction.length} open
                  </Badge>
                </div>
              </CardBody>
            </Card>
          </PageSection>
        )}

        {/* Statistieken */}
        <PageSection
          title="Overzicht"
          description="Alle milestones uit alle projecten"
        >
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-xs uppercase tracking-wide text-foreground-muted mb-1">
                  Totaal milestones
                </p>
                <p className="text-2xl font-semibold text-foreground">{milestones.length}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs uppercase tracking-wide text-foreground-muted mb-1">
                  Wacht op actie
                </p>
                <p className="text-2xl font-semibold text-warning">{awaitingAction.length}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs uppercase tracking-wide text-foreground-muted mb-1">
                  Totaal bedrag
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(
                    milestones.reduce((sum, m) => sum + m.amount, 0)
                  )}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Alle ({milestones.length})
            </Button>
            <Button
              variant={statusFilter === 'awaiting' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('awaiting')}
            >
              Wacht op actie ({awaitingAction.length})
            </Button>
            <Button
              variant={statusFilter === 'SUBMITTED' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('SUBMITTED')}
            >
              Ingediend ({milestones.filter((m) => m.status === 'SUBMITTED').length})
            </Button>
            <Button
              variant={statusFilter === 'APPROVED' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('APPROVED')}
            >
              Goedgekeurd ({milestones.filter((m) => m.status === 'APPROVED').length})
            </Button>
            <Button
              variant={statusFilter === 'PAID' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('PAID')}
            >
              Betaald ({milestones.filter((m) => m.status === 'PAID').length})
            </Button>
          </div>

          {/* Milestones lijst */}
          {filteredMilestones.length === 0 ? (
            <EmptyState
              title="Geen milestones gevonden"
              description={
                statusFilter === 'awaiting'
                  ? 'Er zijn geen milestones die wachten op jouw actie.'
                  : 'Er zijn geen milestones die voldoen aan de geselecteerde filter.'
              }
            />
          ) : (
            <div className="space-y-8">
              {Object.entries(milestonesByProject).map(([projectId, projectMilestones]) => {
                const firstMilestone = projectMilestones[0];
                const project = firstMilestone.project;
                
                return (
                  <div key={projectId} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {project?.title || `Project ${projectId.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-foreground-muted">
                          {projectMilestones.length} milestone{projectMilestones.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                      >
                        Bekijk project →
                      </Button>
                    </div>
                    <MilestoneList
                      milestones={projectMilestones}
                      userRole={user.role as 'CUSTOMER' | 'CONTRACTOR'}
                      projectOwnerId={project?.customer?.id}
                      contractorId={project?.contractorId || null}
                      projectStatus={project?.status}
                      projectBudget={project?.totalBudget}
                      onUpdate={loadMilestones}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </PageSection>
      </PageShell>
    </div>
  );
}
