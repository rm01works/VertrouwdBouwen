'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
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
  };

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
          />
        </PageSection>
      </PageShell>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectById, Project } from '@/lib/api/projects';
import { MilestoneList } from '@/components/projects/MilestoneList';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, getStatusBadgeVariant, getStatusLabel } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Loading } from '@/components/ui/Loading';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadProject = async () => {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading size="lg" className="py-12" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#121212] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-[#ff4444] bg-[#ff4444]/10">
            <CardBody>
              <p className="text-[#ff4444]">{error || 'Project niet gevonden'}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="mt-4"
              >
                Terug
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const sortedMilestones = project.milestones
    ? [...project.milestones].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="min-h-screen bg-[#121212] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="mb-4 sm:mb-6"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Terug naar Overzicht
          </Button>
          <div className="bg-[#1e1e1e] rounded-xl shadow-lg p-6 sm:p-8 border border-[#333333]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Badge
                    variant={getStatusBadgeVariant(project.status)}
                    className="text-sm px-3 py-1"
                  >
                    {getStatusLabel(project.status)}
                  </Badge>
                  <div className="flex items-center gap-2 text-[#b3b3b3]">
                    <svg
                      className="h-5 w-5 text-[#00d4ff]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-lg sm:text-xl font-bold text-white">
                      {formatCurrency(project.totalBudget)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#1e1e1e] border-b border-[#333333]">
                <div className="flex items-center gap-3">
                  <svg
                    className="h-6 w-6 text-[#00d4ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Project Beschrijving
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <p className="text-[#b3b3b3] whitespace-pre-wrap leading-relaxed text-base">
                  {project.description}
                </p>
              </CardBody>
            </Card>

            {/* Milestones */}
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-6 w-6 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Milestones
                    </h2>
                  </div>
                  <Badge variant="info" className="text-sm px-3 py-1">
                    {sortedMilestones.length} totaal
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <MilestoneList
                  milestones={sortedMilestones}
                  userRole={user?.role || 'CUSTOMER'}
                  onUpdate={loadProject}
                />
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="shadow-md sticky top-6">
              <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#1e1e1e] border-b border-[#333333]">
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-[#b3b3b3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="text-lg font-bold text-white">
                    Project Informatie
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-5">
                <div className="pb-4 border-b border-[#333333]">
                  <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-2">
                    Totaal Budget
                  </p>
                  <p className="text-2xl font-bold text-[#00d4ff]">
                    {formatCurrency(project.totalBudget)}
                  </p>
                </div>

                {project.startDate && (
                  <div>
                    <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1">
                      Startdatum
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                )}

                {project.endDate && (
                  <div>
                    <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1">
                      Einddatum
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(project.endDate)}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#333333]">
                  <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1">
                    Aantal Milestones
                  </p>
                  <p className="text-lg font-bold text-white">
                    {sortedMilestones.length}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Customer/Contractor Info */}
            {project.customer && (
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#1e1e1e] border-b border-[#333333]">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-[#00d4ff]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <h2 className="text-lg font-bold text-white">Klant</h2>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <p className="font-semibold text-white text-base mb-1">
                    {project.customer.firstName} {project.customer.lastName}
                  </p>
                  <p className="text-sm text-[#b3b3b3] break-all">
                    {project.customer.email}
                  </p>
                </CardBody>
              </Card>
            )}

            {project.contractor && (
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#1e1e1e] border-b border-[#333333]">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-[#00d4ff]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <h2 className="text-lg font-bold text-white">Aannemer</h2>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <p className="font-semibold text-white text-base mb-1">
                    {project.contractor.firstName} {project.contractor.lastName}
                  </p>
                  {project.contractor.companyName && (
                    <p className="text-sm font-medium text-[#b3b3b3] mb-1">
                      {project.contractor.companyName}
                    </p>
                  )}
                  <p className="text-sm text-[#b3b3b3] break-all">
                    {project.contractor.email}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

