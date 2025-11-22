// TODO: Communicatiehub placeholder. Hier komen projectberichten & notificaties.
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'CUSTOMER') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Communicatie"
            description="Laden..."
            meta="Contact"
          />
          <div className="flex items-center justify-center py-16">
            <Loading size="lg" />
          </div>
        </PageShell>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'CUSTOMER') {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Toegang geweigerd"
            description="Alleen consumenten kunnen communicatie beheren."
            meta="Contact"
          />
          <EmptyState
            title="Geen toegang"
            description="Als aannemer kun je berichten bekijken via de projectdetailpagina."
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

