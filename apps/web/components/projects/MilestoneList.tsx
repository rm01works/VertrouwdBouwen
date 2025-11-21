'use client';

import React, { useState } from 'react';
import { DollarSign, Calendar, CreditCard, CheckCircle, XCircle, Play, AlertCircle } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge, getStatusBadgeVariant, getStatusLabel } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { submitMilestone, approveMilestone, rejectMilestone, startMilestone, Milestone } from '@/lib/api/milestones';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface MilestoneListProps {
  milestones: Milestone[];
  userRole: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
  projectOwnerId?: string;
  contractorId?: string | null;
  projectStatus?: string;
  projectPaymentStatus?: 'NOT_FUNDED' | 'PARTIALLY_FUNDED' | 'FULLY_FUNDED';
  projectBudget?: number;
  onUpdate?: () => void;
}

export function MilestoneList({
  milestones,
  userRole,
  projectOwnerId: _projectOwnerId,
  contractorId: _contractorId,
  projectStatus: _projectStatus,
  projectPaymentStatus,
  projectBudget: _projectBudget,
  onUpdate,
}: MilestoneListProps) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<{
    type: 'SUBMIT' | 'APPROVE' | 'REJECT';
    milestone: Milestone;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { success, error: showError } = useToast();
  const router = useRouter();

  const handleSubmit = async (milestoneId: string) => {
    try {
      setLoadingIds((prev) => new Set(prev).add(milestoneId));

      const response = await submitMilestone(milestoneId);

      if (response.success) {
        success('Milestone succesvol ingediend voor goedkeuring');
        if (onUpdate) {
          onUpdate();
        } else {
          router.refresh();
        }
      } else {
        showError(response.error?.message || 'Fout bij het indienen van milestone');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Er is een onverwachte fout opgetreden');
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(milestoneId);
        return newSet;
      });
    }
  };

  const handleApprove = async (milestoneId: string) => {
    try {
      setLoadingIds((prev) => new Set(prev).add(milestoneId));

      const response = await approveMilestone(milestoneId);

      if (response.success) {
        // Response data structuur: { milestone: {...}, approval: {...}, fullyApproved: boolean, message: string }
        // API client geeft data.data || data terug, dus response.data kan het hele object zijn
        const responseData = response.data as any;
        const milestone = responseData?.milestone || responseData;
        const isFullyApproved = responseData?.fullyApproved ?? (milestone?.approvedByConsumer && milestone?.approvedByContractor);
        const message = responseData?.message || (isFullyApproved
          ? 'Milestone volledig goedgekeurd en betaling vrijgegeven!'
          : 'Milestone goedgekeurd - wachtend op andere partij');
        success(message);
        
        // Sluit modal als die open is
        setPendingAction(null);
        
        // Ververs data zodat knoppen correct worden getoond/verborgen
        // Dit zorgt ervoor dat canApprove() opnieuw wordt geëvalueerd met de nieuwe flags
        if (onUpdate) {
          await onUpdate();
        } else {
          router.refresh();
        }
      } else {
        showError(response.error?.message || 'Fout bij het goedkeuren van milestone');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Er is een onverwachte fout opgetreden');
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(milestoneId);
        return newSet;
      });
      setIsConfirming(false);
    }
  };

  const handleReject = async (milestoneId: string) => {
    try {
      setLoadingIds((prev) => new Set(prev).add(milestoneId));

      const response = await rejectMilestone(milestoneId);

      if (response.success) {
        success('Milestone afgekeurd - aannemer kan herwerken');
        if (onUpdate) {
          onUpdate();
        } else {
          router.refresh();
        }
      } else {
        showError(response.error?.message || 'Fout bij het afkeuren van milestone');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Er is een onverwachte fout opgetreden');
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(milestoneId);
        return newSet;
      });
    }
  };

  const handleStart = async (milestoneId: string) => {
    try {
      setLoadingIds((prev) => new Set(prev).add(milestoneId));

      const response = await startMilestone(milestoneId);

      if (response.success) {
        success('Milestone gestart - werk kan beginnen!');
        if (onUpdate) {
          onUpdate();
        } else {
          router.refresh();
        }
      } else {
        showError(response.error?.message || 'Fout bij het starten van milestone');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Er is een onverwachte fout opgetreden');
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(milestoneId);
        return newSet;
      });
    }
  };

  const canSubmit = (milestone: Milestone) => {
    // Aannemer kan alleen indienen als:
    // - Milestone IN_PROGRESS is
    // - Aannemer heeft nog niet goedgekeurd (approvedByContractor === false)
    return (
      userRole === 'CONTRACTOR' &&
      milestone.status === 'IN_PROGRESS' &&
      milestone.approvedByContractor !== true
    );
  };

  const canApprove = (milestone: Milestone) => {
    // Milestone moet ingediend zijn door aannemer
    if (milestone.status !== 'SUBMITTED') return false;
    
    // Consument kan goedkeuren als:
    // - requiresConsumerAction === true (aannemer heeft milestone ingediend)
    // - Consument heeft nog niet goedgekeurd (approvedByConsumer === false)
    if (userRole === 'CUSTOMER') {
      if (milestone.approvedByConsumer) return false; // Consument heeft al goedgekeurd
      if (!milestone.requiresConsumerAction) return false; // Aannemer moet eerst milestone indienen
      
      // Check payment: als payments data beschikbaar is, moet er een HELD payment zijn
      // Als payments data niet beschikbaar is (undefined of leeg), toon knop toch
      // Backend valideert payment bij goedkeuren
      if (milestone.payments && milestone.payments.length > 0) {
        return milestone.payments.some((p) => p.status === 'HELD');
      }
      // Geen payment data beschikbaar - toon knop (backend valideert)
      return true;
    }
    
    // Aannemer kan NIET meer goedkeuren na indienen - alleen consument kan goedkeuren
    // Aannemer heeft al goedgekeurd door milestone in te dienen (approvedByContractor = true)
    if (userRole === 'CONTRACTOR') {
      return false; // Aannemer kan niet meer goedkeuren na indienen
    }
    
    return false;
  };

  const canReject = (milestone: Milestone) => {
    // Alleen consument kan afkeuren
    if (userRole !== 'CUSTOMER') return false;
    if (milestone.status !== 'SUBMITTED') return false;
    if (milestone.approvedByConsumer) return false;
    
    // Check payment: als payments data beschikbaar is, moet er een HELD payment zijn
    // Als payments data niet beschikbaar is, toon knop toch (backend valideert)
    if (milestone.payments && milestone.payments.length > 0) {
      return milestone.payments.some((p) => p.status === 'HELD');
    }
    // Geen payment data beschikbaar - toon knop (backend valideert)
    return true;
  };

  const isCompleted = (milestone: Milestone) => {
    // Milestone is voltooid als:
    // 1. Status is PAID (volledig afgerond en betaald)
    // 2. Status is APPROVED (volledig goedgekeurd door beide partijen)
    // 3. Beide partijen hebben goedgekeurd (two-sided confirmation)
    return (
      milestone.status === 'PAID' ||
      milestone.status === 'APPROVED' ||
      (milestone.approvedByConsumer && milestone.approvedByContractor)
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {milestones.length === 0 ? (
        <Card className="border border-dashed border-border bg-surface">
          <CardBody className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-foreground-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-4 font-medium text-foreground-muted">
              Geen milestones gevonden
            </p>
          </CardBody>
        </Card>
      ) : (
        milestones.map((milestone) => (
          <Card
            key={milestone.id}
            className="border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-md"
          >
            <CardBody className="p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      #{milestone.order}
                    </span>
                    <h3 className="truncate text-lg font-bold text-foreground sm:text-xl">
                      {milestone.title}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(milestone.status)}>
                      {getStatusLabel(milestone.status)}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground-muted sm:text-base">
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-surface-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-foreground-muted">
                      Bedrag
                    </p>
                    <p className="text-base font-bold text-foreground sm:text-lg">
                      {formatCurrency(milestone.amount)}
                    </p>
                  </div>
                </div>
                {milestone.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-foreground-muted">
                        Deadline
                      </p>
                      <p className="text-sm font-bold text-foreground sm:text-base">
                        {formatDate(milestone.dueDate)}
                      </p>
                    </div>
                  </div>
                )}
                {milestone.payments && milestone.payments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-foreground-muted">
                        Betaling
                      </p>
                      <Badge
                        variant={getStatusBadgeVariant(
                          milestone.payments[0].status
                        )}
                        className="w-fit"
                      >
                        {getStatusLabel(milestone.payments[0].status)}
                      </Badge>
                    </div>
                  </div>
                )}
                {milestone.approvals && milestone.approvals.length > 0 && (
                  <div className="flex flex-col">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground-muted">
                      Goedkeuring
                    </p>
                    <div className="flex items-center gap-2">
                      {milestone.approvals[0].status === 'APPROVED' ? (
                        <>
                          <svg
                            className="h-5 w-5 text-success"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-semibold text-success">
                            Goedgekeurd
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-danger">
                          Afgewezen
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
                {canSubmit(milestone) && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setPendingAction({ type: 'SUBMIT', milestone })}
                    className="w-full sm:w-auto"
                    isLoading={loadingIds.has(milestone.id)}
                    startIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Markeer als Voltooid
                  </Button>
                )}

                {canApprove(milestone) && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setPendingAction({ type: 'APPROVE', milestone })}
                    className="w-full sm:w-auto"
                    isLoading={loadingIds.has(milestone.id)}
                    startIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    {userRole === 'CUSTOMER' ? 'Goedkeuren' : 'Goedkeuren (Aannemer)'}
                  </Button>
                )}

                {canReject(milestone) && (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => setPendingAction({ type: 'REJECT', milestone })}
                    className="w-full sm:w-auto"
                    isLoading={loadingIds.has(milestone.id)}
                    startIcon={<XCircle className="h-4 w-4" />}
                  >
                    Afkeuren
                  </Button>
                )}

                {isCompleted(milestone) && (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2 sm:justify-start">
                    <svg
                      className="h-5 w-5 text-success"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-success">
                      {milestone.status === 'PAID'
                        ? 'Betaald en Voltooid'
                        : 'Goedgekeurd'}
                    </span>
                  </div>
                )}

                {milestone.status === 'PENDING' && userRole === 'CONTRACTOR' && (
                  <>
                    {projectPaymentStatus !== 'FULLY_FUNDED' && (
                      <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          {projectPaymentStatus === 'NOT_FUNDED' ? (
                            <>
                              Dit project is nog niet gefund. De consument moet eerst geld naar escrow overmaken, 
                              de betaling bevestigen, en de admin moet dit goedkeuren voordat je kunt starten.
                            </>
                          ) : (
                            <>
                              Dit project is nog niet volledig gefund ({projectPaymentStatus === 'PARTIALLY_FUNDED' ? 'gedeeltelijk' : 'niet'} gefund). 
                              Wacht tot het project volledig gefund is (FULLY_FUNDED) voordat je kunt starten.
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStart(milestone.id)}
                      isLoading={loadingIds.has(milestone.id)}
                      disabled={projectPaymentStatus !== 'FULLY_FUNDED'}
                      className="w-full sm:w-auto"
                      startIcon={<Play className="h-4 w-4" />}
                    >
                      Start Werk
                    </Button>
                  </>
                )}
              </div>

              {/* Approval Comments */}
              {milestone.approvals &&
                milestone.approvals.length > 0 &&
                milestone.approvals[0].comments && (
                  <div className="mt-4 rounded-2xl border border-primary bg-primary-subtle p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-primary mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          Opmerking van Klant
                        </p>
                        <p className="text-sm leading-relaxed text-foreground">
                          {milestone.approvals[0].comments}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </CardBody>
          </Card>
        ))
      )}
      {pendingAction && (
        <Modal
          open
          title={
            pendingAction.type === 'SUBMIT'
              ? 'Milestone markeren als voltooid'
              : pendingAction.type === 'APPROVE'
              ? 'Milestone goedkeuren'
              : 'Milestone afkeuren'
          }
          description={
            pendingAction.type === 'SUBMIT'
              ? 'Bevestig dat het werk is afgerond. De klant krijgt een notificatie om goed te keuren.'
              : pendingAction.type === 'APPROVE'
              ? 'Na bevestiging wordt de escrow-betaling vrijgegeven aan de aannemer.'
              : 'Na afwijzing blijft het geld in escrow en kan de aannemer het werk herzien en opnieuw indienen.'
          }
          confirmLabel={
            pendingAction.type === 'SUBMIT'
              ? 'Indienen'
              : pendingAction.type === 'APPROVE'
              ? 'Goedkeuren'
              : 'Afkeuren'
          }
          isConfirmLoading={isConfirming}
          onClose={() => setPendingAction(null)}
          onConfirm={async () => {
            if (!pendingAction) return;
            setIsConfirming(true);
            try {
              if (pendingAction.type === 'SUBMIT') {
                await handleSubmit(pendingAction.milestone.id);
                setPendingAction(null);
              } else if (pendingAction.type === 'APPROVE') {
                await handleApprove(pendingAction.milestone.id);
                // Modal wordt gesloten in handleApprove
              } else {
                await handleReject(pendingAction.milestone.id);
                setPendingAction(null);
              }
            } catch (err) {
              // Error wordt al getoond in de handler
              // Modal blijft open bij error zodat gebruiker kan proberen opnieuw
            } finally {
              setIsConfirming(false);
            }
          }}
        >
          <div className="space-y-2 text-sm text-foreground-muted">
            <p className="font-semibold text-foreground">{pendingAction.milestone.title}</p>
            <p>{pendingAction.milestone.description}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

