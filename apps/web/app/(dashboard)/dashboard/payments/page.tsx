// TODO: Betalingen dashboard placeholder. Beschrijf escrow-transacties zodra API klaar is.
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';

export default function PaymentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect aannemers naar dashboard - alleen consumenten mogen betalingen zien
    if (!isLoading && user && user.role !== 'CUSTOMER') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // Toon loading state tijdens auth check
  if (isLoading) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Betalingen"
            description="Laden..."
            meta="Financiën"
          />
          <div className="flex items-center justify-center py-16">
            <Loading size="lg" />
          </div>
        </PageShell>
      </div>
    );
  }

  // Toon toegang geweigerd voor niet-consumenten
  // Als er geen gebruiker is, wordt dit al afgehandeld door de layout
  if (!user) {
    return null;
  }

  if (user.role !== 'CUSTOMER') {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Toegang geweigerd"
            description="Alleen consumenten kunnen betalingen beheren."
            meta="Financiën"
          />
          <EmptyState
            title="Geen toegang"
            description="Als aannemer kun je betalingen bekijken via de projectdetailpagina."
            action={
              <Button
                variant="primary"
                onClick={() => router.replace('/dashboard')}
              >
                Ga naar dashboard
              </Button>
            }
          />
        </PageShell>
      </div>
    );
  }

  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Betalingen"
          meta="Financiën"
          description="Volledige controle over escrow-stortingen, vrijgaven en refunds. Deze placeholder voorkomt dode links totdat de betaal-API gekoppeld is."
          actions={
            <Button variant="secondary" size="sm" disabled>
              Export (binnenkort)
            </Button>
          }
        />

        <PageSection
          title="Transactieoverzicht"
          description="Binnenkort zie je hier alle escrow-transacties met filters per status."
        >
          <EmptyState
            title="Nog geen betalingsdata beschikbaar"
            description="Koppeling met de payments-service staat gepland. Tot die tijd blijf je betalingen per project volgen via de projectdetailpagina."
          />
        </PageSection>
      </PageShell>
    </div>
  );
}

