'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { getProjects, Project } from '@/lib/api/projects';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { PageHeader, PageSection, PageShell } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';

const statusFilters: Array<{ label: string; value: 'ALL' | Project['status'] }> = [
  { label: 'Alles', value: 'ALL' },
  { label: 'Actief', value: 'ACTIVE' },
  { label: 'In uitvoering', value: 'IN_PROGRESS' },
  { label: 'Voltooid', value: 'COMPLETED' },
  { label: 'Geschil', value: 'DISPUTED' },
];

export default function ProjectsOverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | Project['status']>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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
        setError(response.error?.message || 'Kon projecten niet ophalen');
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) =>
        statusFilter === 'ALL' ? true : project.status === statusFilter,
      )
      .filter((project) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          (project.customer &&
            `${project.customer.firstName} ${project.customer.lastName}`
              .toLowerCase()
              .includes(term))
        );
      });
  }, [projects, statusFilter, searchTerm]);

  const handleViewDetails = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Projecten"
          description="Filter en beheer alle projecten binnen VertrouwdBouwen."
          actions={
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" size="sm" onClick={loadProjects}>
                Vernieuwen
              </Button>
              <Link
                href="/dashboard/projects/new"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary-hover"
              >
                Nieuw project
              </Link>
            </div>
          }
        />

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-surface py-16 text-center">
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-danger bg-danger-subtle p-4 text-danger">
            <div className="flex items-start justify-between gap-4">
              <p>{error}</p>
              <Button variant="ghost" size="sm" onClick={loadProjects}>
                Opnieuw
              </Button>
            </div>
          </div>
        ) : (
          <PageSection
            title="Overzicht"
            description="Gebruik filters om snel te vinden wat je zoekt."
            contentClassName="space-y-6"
            actions={
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={[
                      'rounded-full border px-4 py-2 text-sm font-medium transition',
                      statusFilter === filter.value
                        ? 'border-primary bg-primary text-primary-foreground shadow-subtle'
                        : 'border-border text-foreground-muted hover:border-border-strong',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                type="search"
                placeholder="Zoek op titel, klant of omschrijving..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary sm:max-w-sm"
              />
              <p className="text-sm text-foreground-muted">
                {filteredProjects.length} resultaten
              </p>
            </div>

            {filteredProjects.length === 0 ? (
              <EmptyState
                title="Geen projecten gevonden"
                description="Pas je filters aan of probeer een andere zoekterm."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </PageSection>
        )}
      </PageShell>
    </div>
  );
}

