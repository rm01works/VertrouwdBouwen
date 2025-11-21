'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById, Project } from '@/lib/api/projects';
import { MilestoneList } from '@/components/projects/MilestoneList';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge, getStatusBadgeVariant, getStatusLabel } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Loading } from '@/components/ui/Loading';
import { PageHeader, PageSection, PageShell } from '@/components/layout/Page';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

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
    if (user?.role === 'ADMIN') {
      loadProject();
    }
  }, [loadProject, user]);

  const sortedMilestones = useMemo(
    () =>
      project?.milestones
        ? [...project.milestones].sort((a, b) => a.order - b.order)
        : [],
    [project?.milestones],
  );

  const allMilestonesCompleted = useMemo(() => {
    if (!project?.milestones || project.milestones.length === 0) return false;
    return project.milestones.every((m) => m.status === 'PAID');
  }, [project?.milestones]);

  const completedMilestonesCount = useMemo(() => {
    return sortedMilestones.filter((m) => m.status === 'PAID').length;
  }, [sortedMilestones]);

  if (user?.role !== 'ADMIN') {
    return null;
  }

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
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => router.push('/dashboard/admin')}>
                Terug naar admin dashboard
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
          description="Volledige projectinformatie, milestones, betalingen en alle gerelateerde data."
          meta={
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
              {allMilestonesCompleted && (
                <Badge variant="success">✅ Alle milestones afgerond</Badge>
              )}
            </div>
          }
          actions={
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                Terug naar admin dashboard
              </Button>
              <Button variant="primary" size="sm" onClick={loadProject}>
                Vernieuwen
              </Button>
            </div>
          }
        />

        {/* Alert if all milestones completed */}
        {allMilestonesCompleted && (
          <Card className="mb-6 border-success bg-success-subtle">
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Alle milestones zijn voltooid
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    Dit project heeft alle {sortedMilestones.length} milestone{sortedMilestones.length > 1 ? 's' : ''} succesvol afgerond en betaald.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardBody className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground-muted">Budget</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {formatCurrency(project.totalBudget)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground-muted">Voortgang</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {completedMilestonesCount} / {sortedMilestones.length}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {sortedMilestones.length > 0
                      ? Math.round((completedMilestonesCount / sortedMilestones.length) * 100)
                      : 0}% voltooid
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground-muted">Tijdlijn</p>
                  <p className="text-base text-foreground">
                    {project.startDate && project.endDate
                      ? `${formatDate(project.startDate)} — ${formatDate(project.endDate)}`
                      : 'Niet opgegeven'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground-muted">Aangemaakt</p>
                  <p className="text-base text-foreground">
                    {formatDate(project.createdAt || project.updatedAt || new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted mb-4">
                  Klant informatie
                </h3>
                <div className="space-y-2">
                  <p className="text-base text-foreground">
                    {project.customer
                      ? `${project.customer.firstName} ${project.customer.lastName}`
                      : 'Onbekend'}
                  </p>
                  {project.customer?.email && (
                    <p className="text-sm text-foreground-muted">{project.customer.email}</p>
                  )}
                  {project.customer?.id && (
                    <p className="text-xs text-foreground-muted">ID: {project.customer.id}</p>
                  )}
                </div>
              </div>

              {project.contractor && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted mb-4">
                    Aannemer informatie
                  </h3>
                  <div className="space-y-2">
                    <p className="text-base text-foreground">
                      {project.contractor.companyName || `${project.contractor.firstName} ${project.contractor.lastName}`}
                    </p>
                    {project.contractor.email && (
                      <p className="text-sm text-foreground-muted">{project.contractor.email}</p>
                    )}
                    {project.contractor.id && (
                      <p className="text-xs text-foreground-muted">ID: {project.contractor.id}</p>
                    )}
                  </div>
                </div>
              )}

              {!project.contractor && (
                <div className="border-t border-border pt-6">
                  <p className="text-sm text-foreground-muted">
                    Geen aannemer toegewezen aan dit project.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground-muted mb-2">
                  Project ID
                </p>
                <p className="text-sm font-mono text-foreground break-all">{project.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground-muted mb-2">
                  Status
                </p>
                <Badge variant={getStatusBadgeVariant(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground-muted mb-2">
                  Laatste update
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(project.updatedAt || project.createdAt || new Date().toISOString())}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground-muted mb-2">
                  Milestones
                </p>
                <p className="text-sm text-foreground">
                  {completedMilestonesCount} / {sortedMilestones.length} voltooid
                </p>
                {allMilestonesCompleted && (
                  <p className="text-xs text-success mt-1">✅ Alle milestones afgerond</p>
                )}
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
          description="Alle milestones voor dit project met volledige statusinformatie."
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="info" className="text-sm">
                {sortedMilestones.length} totaal
              </Badge>
              {allMilestonesCompleted && (
                <Badge variant="success" className="text-sm">
                  ✅ Alle voltooid
                </Badge>
              )}
            </div>
          }
          contentClassName="p-0"
        >
          <MilestoneList
            milestones={sortedMilestones}
            projectOwnerId={project.customer?.id}
            contractorId={project.contractorId}
            projectStatus={project.status}
            userRole={user?.role || 'ADMIN'}
            projectBudget={project.totalBudget}
            onUpdate={loadProject}
          />
        </PageSection>
      </PageShell>
    </div>
  );
}

