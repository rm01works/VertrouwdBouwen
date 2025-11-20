// TODO: Communicatiehub placeholder. Hier komen projectberichten & notificaties.
'use client';

import React from 'react';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function MessagesPage() {
  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Communicatie"
          meta="Contact"
          description="Alle gesprekken tussen klant en aannemer worden hier straks gebundeld. De placeholder voorkomt een 404 terwijl messaging nog gebouwd wordt."
          actions={
            <Button variant="secondary" size="sm" disabled>
              Nieuw bericht (binnenkort)
            </Button>
          }
        />

        <PageSection
          title="Gesprekskanalen"
          description="Zodra messaging actief is verschijnt hier een lijst met projecten, filters en snelle acties."
        >
          <EmptyState
            title="Messaging nog niet beschikbaar"
            description="Projectcommunicatie verloopt voorlopig buiten het platform. Gebruik e-mail of telefoon totdat deze module live is."
          />
        </PageSection>
      </PageShell>
    </div>
  );
}

