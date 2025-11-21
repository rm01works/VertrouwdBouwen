'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, FolderKanban, TrendingUp, RefreshCw, Plus } from 'lucide-react';
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
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'status'>('recent');
  const router = useRouter();
  
  // Check if user is a demo user
  const isDemoUser = user?.id === 'demo-user-id';
  
  // Alleen consumenten (CUSTOMER) kunnen nieuwe projecten aanmaken
  const canCreateProject = user?.role === 'CUSTOMER';

  // Redirect admins to admin portal
  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      router.replace('/dashboard/admin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      // Skip API calls for demo users - they don't have valid backend authentication
      if (isDemoUser) {
        setIsLoading(false);
        setProjects([]);
        setError(null);
        return;
      }
      loadProjects();
    }
  }, [user, isDemoUser]);

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

  const isCustomer = user?.role === 'CUSTOMER';
  const isContractor = user?.role === 'CONTRACTOR';
  
  const availableProjects = sortProjects(projects.filter((p) => !p.contractorId));
  const myProjects = sortProjects(projects.filter((p) => p.contractorId));
  const activeProjects = myProjects.filter(
    (project) => !['COMPLETED', 'CANCELLED'].includes(project.status),
  );
  const totalManagedBudget = myProjects.reduce(
    (sum, project) => sum + (project.totalBudget || 0),
    0,
  );
  
  // Voor consumenten: projecten waar consument eigenaar van is
  const customerProjects = sortProjects(projects.filter((p) => p.customerId === user?.id));
  const customerActiveProjects = customerProjects.filter(
    (project) => !['COMPLETED', 'CANCELLED'].includes(project.status),
  );
  
  // Milestones die wachten op consument actie
  const awaitingActionMilestones = useMemo(() => {
    if (!isCustomer) return [];
    return customerProjects.flatMap((project) => 
      (project.milestones || []).filter((m) => 
        m.status === 'SUBMITTED' &&
        m.requiresConsumerAction === true &&
        m.approvedByConsumer === false
      )
    );
  }, [customerProjects, isCustomer]);

  const metricCards = useMemo(
    () => {
      if (isCustomer) {
        // Consumenten-dashboard metrics
        return [
          {
            label: 'Wacht op actie',
            value: awaitingActionMilestones.length,
            description: 'Milestones die jouw goedkeuring nodig hebben',
            icon: <AlertCircle className="h-5 w-5" />,
            color: 'text-warning',
          },
          {
            label: 'Lopende projecten',
            value: customerActiveProjects.length,
            description: 'Actieve projecten',
            icon: <FolderKanban className="h-5 w-5" />,
            color: 'text-info',
          },
          {
            label: 'Totaal budget',
            value: formatCurrency(
              customerProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
            ),
            description: 'Totaal projectbudget',
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'text-primary',
          },
        ];
      } else {
        // Aannemers-dashboard metrics
        return [
          {
            label: 'Beschikbaar',
            value: availableProjects.length,
            description: 'Projecten wachten op acceptatie',
            icon: <FolderKanban className="h-5 w-5" />,
            color: 'text-info',
          },
          {
            label: 'Lopend',
            value: activeProjects.length,
            description: 'Actieve projecten onder uitvoering',
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'text-success',
          },
          {
            label: 'Budget in beheer',
            value: formatCurrency(totalManagedBudget),
            description: 'Totaal escrow-budget',
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'text-primary',
          },
        ];
      }
    },
    [
      isCustomer,
      awaitingActionMilestones.length,
      customerActiveProjects.length,
      customerProjects,
      availableProjects.length,
      activeProjects.length,
      totalManagedBudget,
    ],
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
      <Button variant="ghost" size="sm" onClick={loadProjects} startIcon={<RefreshCw className="h-4 w-4" />}>
        Opnieuw laden
      </Button>
    </div>
  );

  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Projectdashboard"
          description={
            isCustomer
              ? "Overzicht van je projecten en milestones die wachten op jouw actie."
              : "Overzicht van je escrow-projecten, voortgang en nieuwe aanvragen."
          }
          meta={isCustomer ? "Consument" : "Aannemer"}
          actions={
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/projects"
                className="rounded-full border border-gray-200 dark:border-neutral-700 px-4 py-2 text-sm font-semibold text-foreground hover:border-gray-300 dark:hover:border-neutral-600 transition-colors"
              >
                Alle projecten
              </Link>
              {canCreateProject && (
                <Link
                  href="/dashboard/projects/new"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
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
            {isDemoUser && (
              <div className="mb-8 rounded-2xl border border-info bg-info-subtle p-4 text-info">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Demo modus</p>
                    <p className="text-sm">Je bekijkt het dashboard in demo modus. Om volledige functionaliteit te gebruiken, log in met een echt account.</p>
                  </div>
                </div>
              </div>
            )}
            {error && !isDemoUser && (
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
                <Card key={metric.label} className="border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm hover:shadow-md transition-all duration-200">
                  <CardBody className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
                        {metric.label}
                      </p>
                      <div className={metric.color}>
                        {metric.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className="text-sm text-foreground-muted">{metric.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Consumenten-dashboard: "Wacht op actie" sectie */}
            {isCustomer && awaitingActionMilestones.length > 0 && (
              <PageSection
                title="Wacht op jouw actie"
                description={`${awaitingActionMilestones.length} milestone${awaitingActionMilestones.length > 1 ? 's' : ''} wachten op jouw goedkeuring`}
                className="mb-10"
              >
                <Card className="border-warning bg-warning-subtle">
                  <CardBody>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-warning/20">
                          <AlertCircle className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-2">
                            Actie vereist
                          </h3>
                          <p className="text-sm text-foreground-muted">
                            Er {awaitingActionMilestones.length === 1 ? 'staat' : 'staan'} {awaitingActionMilestones.length} milestone{awaitingActionMilestones.length > 1 ? 's' : ''} klaar voor goedkeuring.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/milestones"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      Bekijk milestones →
                    </Link>
                  </CardBody>
                </Card>
              </PageSection>
            )}

            {/* Aannemers-dashboard: "Beschikbare projecten" sectie */}
            {isContractor && (
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
                      compact={true}
                    />
                  ))}
                </div>
                )}
              </PageSection>
            )}

            {/* Projecten sectie - verschillend voor consumenten en aannemers */}
            <PageSection
              className="mt-10"
              title={isCustomer ? "Mijn projecten" : "Mijn projecten"}
              description={
                isCustomer
                  ? "Overzicht van al je projecten. Klik op een project voor details."
                  : "Alle lopende en afgeronde projecten onder jouw beheer."
              }
            >
              {(isCustomer ? customerProjects : myProjects).length === 0 ? (
                <EmptyState
                  title={isCustomer ? "Nog geen projecten" : "Nog geen projecten geaccepteerd"}
                  description={
                    isCustomer
                      ? "Maak je eerste project aan om te beginnen."
                      : "Gebruik de projectlijst om geschikte opdrachten te vinden."
                  }
                  action={
                    <Link
                      href={isCustomer ? "/dashboard/projects/new" : "/dashboard/projects"}
                      className="text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      {isCustomer ? "Nieuw project aanmaken" : "Ga naar overzicht"}
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {(isCustomer ? customerProjects : myProjects).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onViewDetails={handleViewDetails}
                      compact={true}
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
