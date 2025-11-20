'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PageHeader, PageShell } from '@/components/layout/Page';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function NewProjectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect aannemers naar dashboard - alleen consumenten mogen projecten aanmaken
    if (!isLoading && user && user.role !== 'CUSTOMER') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Toon loading state tijdens auth check
  if (isLoading) {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Nieuw project"
            description="Laden..."
            actions={null}
          />
        </PageShell>
      </div>
    );
  }

  // Toon toegang geweigerd voor niet-consumenten
  if (user && user.role !== 'CUSTOMER') {
    return (
      <div className="bg-background pb-16">
        <PageShell>
          <PageHeader
            title="Toegang geweigerd"
            description="Alleen consumenten kunnen nieuwe projecten aanmaken."
            actions={null}
          />
          <EmptyState
            title="Geen toegang"
            description="Als aannemer kun je projecten accepteren, maar niet zelf aanmaken."
            action={
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard')}
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
          title="Nieuw project"
          description="Definieer scope, budget en milestones voor een veilig escrow-traject."
          actions={null}
        />
        <ProjectForm />
      </PageShell>
    </div>
  );
}

