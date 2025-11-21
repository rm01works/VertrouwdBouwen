'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, Project } from '@/lib/api/projects';
import { EmptyState } from '@/components/ui/EmptyState';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Concept',
  PENDING_CONTRACTOR: 'Wacht op aannemer',
  ACTIVE: 'Actief',
  IN_PROGRESS: 'In uitvoering',
  COMPLETED: 'Afgerond',
  CANCELLED: 'Geannuleerd',
  DISPUTED: 'Geschil',
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_CONTRACTOR: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-orange-100 text-orange-800',
};

export default function AdminProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      loadProjects();
    }
  }, [user, authLoading]);

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
      console.error('Error loading projects:', err);
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projecten</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer alle projecten op het platform
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projecten</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer alle projecten op het platform
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadProjects}>
          Opnieuw laden
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-danger bg-danger-subtle p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          Alle ({projects.length})
        </Button>
        {Object.keys(PROJECT_STATUS_LABELS).map((status) => {
          const count = projects.filter(p => p.status === status).length;
          if (count === 0) return null;
          return (
            <Button
              key={status}
              variant={filterStatus === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {PROJECT_STATUS_LABELS[status]} ({count})
            </Button>
          );
        })}
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="Geen projecten gevonden"
              description={
                filterStatus === 'all'
                  ? "Er zijn nog geen projecten op het platform."
                  : `Er zijn geen projecten met status "${PROJECT_STATUS_LABELS[filterStatus]}".`
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className="cursor-pointer hover:shadow-elevated transition-shadow"
              onClick={() => router.push(`/dashboard/admin/projects/${project.id}`)}
            >
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {project.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-3 flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-foreground-muted">Klant:</span>
                        <span className="ml-2 font-medium">
                          {project.customer?.firstName} {project.customer?.lastName}
                        </span>
                      </div>
                      {project.contractor && (
                        <div>
                          <span className="text-foreground-muted">Aannemer:</span>
                          <span className="ml-2 font-medium">
                            {project.contractor?.companyName || `${project.contractor?.firstName} ${project.contractor?.lastName}`}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-foreground-muted">Budget:</span>
                        <span className="ml-2 font-semibold">
                          {formatCurrency(project.totalBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-foreground-muted">Milestones:</span>
                        <span className="ml-2 font-medium">
                          {project.milestones?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/admin/projects/${project.id}`);
                      }}
                    >
                      Details →
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

