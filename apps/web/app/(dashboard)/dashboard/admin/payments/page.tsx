'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CreditCard, CheckCircle, XCircle, RefreshCw, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPendingEscrowPayments,
  approveEscrowPayment,
  rejectEscrowPayment,
  ProjectPayment,
} from '@/lib/api/admin-payments';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminPaymentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<ProjectPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getPendingEscrowPayments();
      
      if (response.success && response.data) {
        setPendingPayments(response.data);
      } else {
        setError(response.error?.message || 'Fout bij het laden van betalingen');
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      loadPayments();
      
      // Auto-refresh every 30 seconds to check for new payments
      const interval = setInterval(loadPayments, 30000);
      return () => clearInterval(interval);
    }
  }, [user, authLoading, loadPayments]);

  const handleApprove = async (paymentId: string) => {
    try {
      const response = await approveEscrowPayment(paymentId);
      if (response.success) {
        await loadPayments();
      } else {
        alert(response.error?.message || 'Fout bij goedkeuren van betaling');
      }
    } catch (err) {
      alert('Er is een fout opgetreden');
    }
  };

  const handleReject = async (paymentId: string) => {
    const notes = prompt('Reden voor afwijzing:');
    if (!notes || notes.trim().length === 0) {
      alert('Reden is verplicht bij afwijzing');
      return;
    }
    
    try {
      const response = await rejectEscrowPayment(paymentId, { adminNotes: notes });
      if (response.success) {
        await loadPayments();
      } else {
        alert(response.error?.message || 'Fout bij afwijzen van betaling');
      }
    } catch (err) {
      alert('Er is een fout opgetreden');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Betalingen & Escrow</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer escrow-betalingen en goedkeuringsprocessen
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-foreground">Betalingen & Escrow</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer escrow-betalingen en goedkeuringsprocessen
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadPayments} startIcon={<RefreshCw className="h-4 w-4" />}>
          Opnieuw laden
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-danger bg-danger-subtle p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {pendingPayments.length === 0 && !isLoading ? (
        <Card>
          <CardBody>
            <EmptyState
              title="Geen betalingen in afwachting"
              description="Er zijn momenteel geen escrow-betalingen die wachten op admin review."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <Card key={payment.id} className="border border-gray-200 dark:border-neutral-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {payment.project?.title || 'Onbekend project'}
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-2 text-sm text-foreground-muted">
                        <User className="h-4 w-4" />
                        <span>
                          {payment.consumer?.firstName} {payment.consumer?.lastName} ({payment.consumer?.email})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    In afwachting
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-foreground-muted" />
                    <div>
                      <p className="text-xs text-foreground-muted">Bedrag</p>
                      <p className="text-base font-bold text-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                  {payment.transactionRef && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-foreground-muted" />
                      <div>
                        <p className="text-xs text-foreground-muted">Transactie ref</p>
                        <p className="text-sm font-mono text-foreground">
                          {payment.transactionRef}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                    <div>
                      <p className="text-xs text-foreground-muted">Aangemaakt</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(payment.createdAt).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(payment.id)}
                    startIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Goedkeuren
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(payment.id)}
                    startIcon={<XCircle className="h-4 w-4" />}
                  >
                    Afwijzen
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

