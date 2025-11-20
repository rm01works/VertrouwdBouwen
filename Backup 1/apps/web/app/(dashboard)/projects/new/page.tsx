'use client';

import React from 'react';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PageHeader, PageShell } from '@/components/layout/Page';

export default function NewProjectPage() {
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

