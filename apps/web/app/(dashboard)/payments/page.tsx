// TODO: Betalingen dashboard placeholder. Beschrijf escrow-transacties zodra API klaar is.
'use client';

import React from 'react';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function PaymentsPage() {
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

