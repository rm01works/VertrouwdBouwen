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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
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
          <Card className="lg:col-span-2">
            <CardBody className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground-muted">Budget</p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(project.totalBudget)}
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
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground-muted">Contact</p>
                <p className="text-base text-foreground">
                  {project.customer
                    ? `${project.customer.firstName} ${project.customer.lastName}`
                    : 'Onbekend'}
                </p>
                {project.customer?.email && (
                  <p className="text-sm text-foreground-muted">{project.customer.email}</p>
                )}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm text-foreground-muted">
                Houd milestones bij en bevestig betalingen zodra werk gereed is.
              </p>
              <Button variant="secondary" size="sm" onClick={loadProject}>
                Vernieuwen
              </Button>
            </CardBody>
          </Card>
        </div>

        <PageSection title="Projectbeschrijving">
          <p className="text-base leading-relaxed text-foreground-muted whitespace-pre-wrap">
            {project.description}
          </p>
        </PageSection>

        <PageSection
          id="milestones"
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
            userRole={user?.role || 'CONTRACTOR'}
            projectBudget={project.totalBudget}
            onUpdate={loadProject}
          />
        </PageSection>
      </PageShell>
    </div>
  );
}
