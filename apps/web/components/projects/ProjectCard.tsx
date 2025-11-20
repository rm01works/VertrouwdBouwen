'use client';

import React from 'react';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Badge, getStatusBadgeVariant, getStatusLabel } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Project } from '@/lib/api/projects';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (projectId: string) => void;
  onAccept?: (projectId: string) => void;
  showAcceptButton?: boolean;
}

export function ProjectCard({
  project,
  onViewDetails,
  onAccept,
  showAcceptButton = false,
}: ProjectCardProps) {
  const { user } = useAuth();
  const totalMilestones = project.milestones?.length || 0;
  const completedMilestones =
    project.milestones?.filter((m) => m.status === 'PAID').length || 0;
  const pendingMilestones =
    project.milestones?.filter((m) => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length || 0;
  const progressPercentage =
    totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);
  
  // Bepaal welke partij informatie te tonen
  const isCustomer = user?.role === 'CUSTOMER';
  const showContractorInfo = isCustomer && project.contractor;
  const showCustomerInfo = !isCustomer && project.customer;

  return (
    <Card className="flex h-full flex-col border border-border bg-surface shadow-subtle transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elevated">
      <CardBody className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground-muted">
                Project
              </p>
              <h3 className="text-xl font-semibold text-foreground line-clamp-2">{project.title}</h3>
            </div>
            <Badge variant={getStatusBadgeVariant(project.status)}>{getStatusLabel(project.status)}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-foreground-muted line-clamp-3">{project.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface-muted/40 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Budget</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(project.totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Voortgang</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              {completedMilestones} / {totalMilestones || 0}
              <span className="text-xs font-normal text-foreground-muted">{progressPercentage}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 text-sm text-foreground-muted sm:grid-cols-2">
          {project.createdAt && (
            <div className="rounded-xl border border-border bg-background-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-foreground-muted">Aangemaakt</p>
              <p className="mt-1 font-semibold text-foreground">{formatDate(project.createdAt)}</p>
            </div>
          )}

          {project.startDate && project.endDate && (
            <div className="rounded-xl border border-border bg-background-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-foreground-muted">Planning</p>
              <p className="mt-1 font-semibold text-foreground">
                {formatDate(project.startDate)} — {formatDate(project.endDate)}
              </p>
            </div>
          )}
        </div>

        {totalMilestones > 0 && (
          <div className="rounded-xl border border-border bg-background-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-foreground-muted">Milestones</p>
            <p className="mt-1 font-semibold text-foreground">
              {totalMilestones} totaal • {completedMilestones} voltooid
              {pendingMilestones > 0 && ` • ${pendingMilestones} in afwachting`}
            </p>
          </div>
        )}

        {showContractorInfo && (
          <div className="rounded-2xl border border-border bg-surface-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Aannemer</p>
            <p className="mt-1 font-semibold text-foreground">
              {project.contractor?.companyName || `${project.contractor?.firstName} ${project.contractor?.lastName}`}
            </p>
            {project.contractor?.email && (
              <p className="text-sm text-foreground-muted">{project.contractor.email}</p>
            )}
          </div>
        )}

        {showCustomerInfo && project.customer && (
          <div className="rounded-2xl border border-border bg-surface-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Klant</p>
            <p className="mt-1 font-semibold text-foreground">
              {project.customer.firstName} {project.customer.lastName}
            </p>
            <p className="text-sm text-foreground-muted">{project.customer.email}</p>
          </div>
        )}
      </CardBody>

      <CardFooter className="flex flex-col gap-2 border-t border-border bg-surface-muted/40 p-4 sm:flex-row">
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(project.id)}
            className="flex-1"
            endIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
          >
            Details
          </Button>
        )}
        {showAcceptButton && onAccept && !project.contractorId && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAccept(project.id)}
            className="flex-1"
            endIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          >
            Project accepteren
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
