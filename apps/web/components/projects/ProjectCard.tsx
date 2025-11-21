'use client';

import React from 'react';
import { FolderKanban, Eye, CheckCircle, DollarSign, Calendar, User, Mail } from 'lucide-react';
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
  compact?: boolean; // Compact mode voor dashboard - minder details
}

export function ProjectCard({
  project,
  onViewDetails,
  onAccept,
  showAcceptButton = false,
  compact = false,
}: ProjectCardProps) {
  const { user } = useAuth();
  const totalMilestones = project.milestones?.length || 0;
  // Milestones zijn voltooid als:
  // 1. Status is PAID (volledig afgerond en betaald)
  // 2. Status is APPROVED (volledig goedgekeurd door beide partijen)
  // 3. Beide partijen hebben goedgekeurd (two-sided confirmation)
  const completedMilestones =
    project.milestones?.filter((m) => 
      m.status === 'PAID' ||
      m.status === 'APPROVED' ||
      (m.approvedByConsumer === true && m.approvedByContractor === true)
    ).length || 0;
  const pendingMilestones =
    project.milestones?.filter((m) => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length || 0;
  const progressPercentage =
    totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);
  
  // Bepaal welke partij informatie te tonen
  const isCustomer = user?.role === 'CUSTOMER';
  const showContractorInfo = isCustomer && project.contractor;
  const showCustomerInfo = !isCustomer && project.customer;

  return (
    <Card className="flex h-full flex-col border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-md">
      <CardBody className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground-muted">
                  Project
                </p>
                <h3 className="text-xl font-bold text-foreground line-clamp-2">{project.title}</h3>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(project.status)}>{getStatusLabel(project.status)}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-foreground-muted line-clamp-3">{project.description}</p>
        </div>

        {!compact ? (
          <>
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-surface-muted/40 p-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Budget</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(project.totalBudget)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Voortgang</p>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-bold text-foreground">
                  {completedMilestones} / {totalMilestones || 0}
                  <span className="text-xs font-normal text-foreground-muted">{progressPercentage}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 text-sm text-foreground-muted sm:grid-cols-2">
              {project.createdAt && (
                <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-background-muted/40 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                    <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Aangemaakt</p>
                  </div>
                  <p className="mt-1 font-bold text-foreground">{formatDate(project.createdAt)}</p>
                </div>
              )}

              {project.startDate && project.endDate && (
                <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-background-muted/40 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                    <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Planning</p>
                  </div>
                  <p className="mt-1 font-bold text-foreground">
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
              <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-surface-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Aannemer</p>
                </div>
                <p className="mt-1 font-bold text-foreground">
                  {project.contractor?.companyName || `${project.contractor?.firstName} ${project.contractor?.lastName}`}
                </p>
                {project.contractor?.email && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                    <Mail className="h-3 w-3" />
                    <span>{project.contractor.email}</span>
                  </div>
                )}
              </div>
            )}

            {showCustomerInfo && project.customer && (
              <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-surface-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-foreground-muted" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Klant</p>
                </div>
                <p className="mt-1 font-bold text-foreground">
                  {project.customer.firstName} {project.customer.lastName}
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                  <Mail className="h-3 w-3" />
                  <span>{project.customer.email}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          // Compact mode: alleen kerninfo
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-surface-muted/40 p-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-foreground-muted" />
                <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Budget</p>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(project.totalBudget)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-foreground-muted" />
                <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">Voortgang</p>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-foreground">
                {completedMilestones} / {totalMilestones || 0}
                <span className="text-xs font-normal text-foreground-muted">{progressPercentage}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardBody>

      <CardFooter className="flex flex-col gap-2 border-t border-gray-200 dark:border-neutral-700 bg-surface-muted/40 p-4 sm:flex-row">
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(project.id)}
            className="flex-1"
            endIcon={<Eye className="h-4 w-4" />}
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
            endIcon={<CheckCircle className="h-4 w-4" />}
          >
            Project accepteren
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
