export type DashboardJourneyStage =
  | 'overzicht'
  | 'projectbeheer'
  | 'workflow'
  | 'financien'
  | 'communicatie'
  | 'support';

export type DashboardNavStatus = 'live' | 'stub' | 'planned';

export interface DashboardNavItem {
  label: string;
  href: string;
  description: string;
  stage: DashboardJourneyStage;
  status: DashboardNavStatus;
  enabled: boolean;
  notes?: string;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: 'Overzicht',
    href: '/dashboard',
    description: 'Startpunt met KPI’s, alerts en snelle acties.',
    stage: 'overzicht',
    status: 'live',
    enabled: true,
  },
  {
    label: 'Projecten',
    href: '/dashboard/projects',
    description: 'Alle escrow-projecten beheren en filteren.',
    stage: 'projectbeheer',
    status: 'live',
    enabled: true,
  },
  {
    label: 'Milestones',
    href: '/dashboard/milestones',
    description: 'Globaal overzicht van milestone-statussen en taken.',
    stage: 'workflow',
    status: 'stub',
    enabled: true,
  },
  {
    label: 'Betalingen',
    href: '/dashboard/payments',
    description: 'Escrow-transacties en vrijgaven monitoren.',
    stage: 'financien',
    status: 'stub',
    enabled: true,
  },
  {
    label: 'Communicatie',
    href: '/dashboard/messages',
    description: 'Projectberichten en updates centraliseren.',
    stage: 'communicatie',
    status: 'stub',
    enabled: true,
  },
  {
    label: 'Klanten',
    href: '/dashboard/clients',
    description: 'CRM-lite voor klantdossiers en contactmomenten.',
    stage: 'projectbeheer',
    status: 'planned',
    enabled: false,
    notes: 'Nog geen data/API beschikbaar; knop verborgen.',
  },
  {
    label: 'Instellingen',
    href: '/dashboard/settings',
    description: 'Account-, team- en notificatie-instellingen.',
    stage: 'support',
    status: 'planned',
    enabled: false,
    notes: 'Wordt zichtbaar zodra instellingen-flow bestaat.',
  },
];

export const visibleDashboardNavItems = dashboardNavItems.filter((item) => item.enabled);

