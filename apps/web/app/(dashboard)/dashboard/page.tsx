'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { getProjects, acceptProject, Project } from '@/lib/api/projects';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader, PageSection, PageShell } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';

export default function ContractorDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'status'>('recent');
  const router = useRouter();
  
  // Alleen consumenten (CUSTOMER) kunnen nieuwe projecten aanmaken
  const canCreateProject = user?.role === 'CUSTOMER';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProjects();

      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        setError(response.error?.message || 'Fout bij het laden van projecten');
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleAcceptProject = async (projectId: string) => {
    try {
      const response = await acceptProject(projectId);
      if (response.success) {
        // Reload projects to show updated list
        await loadProjects();
      } else {
        alert(response.error?.message || 'Fout bij het accepteren van project');
      }
    } catch (err) {
      alert('Er is een onverwachte fout opgetreden');
    }
  };

  const sortProjects = (projectsToSort: Project[]) => {
    const sorted = [...projectsToSort];
    switch (sortBy) {
      case 'recent':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return sorted;
    }
  };

  const availableProjects = sortProjects(projects.filter((p) => !p.contractorId));
  const myProjects = sortProjects(projects.filter((p) => p.contractorId));
  const activeProjects = myProjects.filter(
    (project) => !['COMPLETED', 'CANCELLED'].includes(project.status),
  );
  const totalManagedBudget = myProjects.reduce(
    (sum, project) => sum + (project.totalBudget || 0),
    0,
  );

  const metricCards = useMemo(
    () => [
      {
        label: 'Beschikbaar',
        value: availableProjects.length,
        description: 'Projecten wachten op acceptatie',
      },
      {
        label: 'Lopend',
        value: activeProjects.length,
        description: 'Actieve projecten onder uitvoering',
      },
      {
        label: 'Budget in beheer',
        value: formatCurrency(totalManagedBudget),
        description: 'Totaal escrow-budget',
      },
    ],
    [availableProjects.length, activeProjects.length, totalManagedBudget],
  );

  const sectionActions = (
    <div className="flex flex-wrap gap-3">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'status')}
        className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-subtle focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        <option value="recent">Meest recent</option>
        <option value="title">Titel</option>
        <option value="status">Status</option>
      </select>
      <Button variant="ghost" size="sm" onClick={loadProjects}>
        Opnieuw laden
      </Button>
    </div>
  );

  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Projectdashboard"
          description="Overzicht van je escrow-projecten, voortgang en nieuwe aanvragen."
          meta="Aannemer"
          actions={
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/projects"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-border-strong"
              >
                Alle projecten
              </Link>
              {canCreateProject && (
                <Link
                  href="/dashboard/projects/new"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary-hover"
                >
                  Nieuw project
                </Link>
              )}
            </div>
          }
        />

        {isLoading ? (
          <div className="space-y-10">
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-8 rounded-2xl border border-danger bg-danger-subtle p-4 text-danger">
                <div className="flex items-start justify-between gap-4">
                  <p>{error}</p>
                  <Button variant="ghost" size="sm" onClick={loadProjects}>
                    Opnieuw
                  </Button>
                </div>
              </div>
            )}

            <div className="mb-10 grid gap-4 md:grid-cols-3">
              {metricCards.map((metric) => (
                <Card key={metric.label} className="border border-border bg-surface shadow-subtle">
                  <CardBody className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
                    <p className="text-sm text-foreground-muted">{metric.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            <PageSection
              title="Beschikbare projecten"
              description="Projecten zonder toegewezen aannemer, klaar om opgepakt te worden."
              actions={sectionActions}
            >
              {availableProjects.length === 0 ? (
                <EmptyState
                  title="Geen open aanvragen"
                  description="Nieuwe projecten verschijnen hier zodra klanten een escrow starten."
                  action={
                    <Link
                      href="/dashboard/projects"
                      className="text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      Bekijk alle projecten
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {availableProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onViewDetails={handleViewDetails}
                      onAccept={handleAcceptProject}
                      showAcceptButton
                    />
                  ))}
                </div>
              )}
            </PageSection>

            <PageSection
              className="mt-10"
              title="Mijn projecten"
              description="Alle lopende en afgeronde projecten onder jouw beheer."
            >
              {myProjects.length === 0 ? (
                <EmptyState
                  title="Nog geen projecten geaccepteerd"
                  description="Gebruik de projectlijst om geschikte opdrachten te vinden."
                  action={
                    <Link
                      href="/dashboard/projects"
                      className="text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      Ga naar overzicht
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {myProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </PageSection>
          </>
        )}
      </PageShell>
    </div>
  );
}
