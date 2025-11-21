'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, RefreshCw, CheckCircle, DollarSign, Calendar, FolderKanban, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPendingPayouts,
  markPayoutPaid,
  Payout,
} from '@/lib/api/admin-payments';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminPayoutsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      loadPayouts();
    }
  }, [user, authLoading]);

  const loadPayouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getPendingPayouts();
      
      if (response.success && response.data) {
        setPendingPayouts(response.data);
      } else {
        setError(response.error?.message || 'Fout bij het laden van payouts');
      }
    } catch (err) {
      console.error('Error loading payouts:', err);
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
    try {
      const response = await markPayoutPaid(payoutId);
      if (response.success) {
        await loadPayouts();
      } else {
        alert(response.error?.message || 'Fout bij markeren van payout');
      }
    } catch (err) {
      alert('Er is een fout opgetreden');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer uitbetalingen aan aannemers
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
          <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer uitbetalingen aan aannemers
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadPayouts} startIcon={<RefreshCw className="h-4 w-4" />}>
          Opnieuw laden
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-danger bg-danger-subtle p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {pendingPayouts.length === 0 && !isLoading ? (
        <Card>
          <CardBody>
            <EmptyState
              title="Geen payouts in afwachting"
              description="Er zijn momenteel geen payouts die wachten op uitbetaling."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPayouts.map((payout) => (
            <Card key={payout.id} className="border border-gray-200 dark:border-neutral-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Wallet className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {payout.milestone?.title || 'Milestone'}
                      </CardTitle>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                          <FolderKanban className="h-4 w-4" />
                          <span>Project: {payout.project?.title || 'Onbekend project'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                          <Hammer className="h-4 w-4" />
                          <span>
                            {payout.contractor?.companyName || `${payout.contractor?.firstName} ${payout.contractor?.lastName}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    Te betalen
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-foreground-muted" />
                    <div>
                      <p className="text-xs text-foreground-muted">Bedrag</p>
                      <p className="text-base font-bold text-foreground">
                        {formatCurrency(payout.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                    <div>
                      <p className="text-xs text-foreground-muted">Aangevraagd</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(payout.requestedAt).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleMarkPaid(payout.id)}
                    startIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Markeer als betaald
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

