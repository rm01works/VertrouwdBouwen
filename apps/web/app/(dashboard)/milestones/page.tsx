// TODO: Milestones workspace placeholder. Vervang zodra globale milestone tracking is gebouwd.
'use client';

import React from 'react';
import { PageShell, PageHeader, PageSection } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function MilestonesPage() {
  return (
    <div className="bg-background pb-16">
      <PageShell>
        <PageHeader
          title="Milestones"
          description="Plan, volg en keur milestones project-overschrijdend goed. Deze stub houdt de route beschikbaar terwijl de echte workflow gebouwd wordt."
          meta="Workflow"
          actions={
            <Button variant="secondary" size="sm" disabled>
              Batch-acties (binnenkort)
            </Button>
          }
        />

        <PageSection
          title="Milestone statusoverzicht"
          description="Hier komt een filterbare lijst met alle milestones, deadlines en actieknoppen. Tot die tijd tonen we een duidelijke placeholder."
        >
          <EmptyState
            title="Nog geen aparte milestone-hub"
            description="Gebruik voorlopig het projectdetail om milestones te beheren. Deze pagina wordt binnenkort gevuld met een cross-project overzicht."
          />
        </PageSection>
      </PageShell>
    </div>
  );
}

