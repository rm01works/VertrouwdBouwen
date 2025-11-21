# Admin Portal Documentatie

## Overzicht

Het admin portal is een volledig herontworpen admin-dashboard met links-gebaseerde navigatie. Admins worden automatisch doorgestuurd naar het admin portal na inloggen.

## Structuur

### Layout & Navigatie

- **Admin Layout**: `/apps/web/app/(dashboard)/dashboard/admin/layout.tsx`
  - Bevat de sidebar navigatie
  - Beveiligt alle admin routes (alleen ADMIN rol)
  
- **Admin Sidebar**: `/apps/web/components/admin/AdminSidebar.tsx`
  - Links-gebaseerde navigatie met 6 hoofd secties:
    1. Overzicht (KPI's en statistieken)
    2. Klanten
    3. Aannemers
    4. Projecten
    5. Betalingen & Escrow
    6. Payouts

### Routes

Alle admin routes bevinden zich onder `/dashboard/admin/`:

- `/dashboard/admin` - Overzicht met KPI's, grafieken en metrics
- `/dashboard/admin/customers` - Lijst van alle klanten
- `/dashboard/admin/contractors` - Lijst van alle aannemers
- `/dashboard/admin/projects` - Lijst van alle projecten met filters
- `/dashboard/admin/payments` - Escrow-betalingen beheren
- `/dashboard/admin/payouts` - Uitbetalingen aan aannemers beheren
- `/dashboard/admin/projects/[id]` - Project detail pagina

## Data Structuren

### Klant (Customer)

```typescript
interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    customerProjects: number;
  };
}
```

**Velden per klant:**
- Naam (firstName + lastName)
- Email
- Telefoon (optioneel)
- Aantal projecten
- Registratiedatum

### Aannemer (Contractor)

```typescript
interface Contractor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  phone?: string | null;
}
```

**Velden per aannemer:**
- Bedrijfsnaam (of naam als geen bedrijfsnaam)
- Contactpersoon (firstName + lastName)
- Email
- Telefoon (optioneel)

### Project

Zie bestaande Project interface. Admin ziet alle projecten met:
- Titel & beschrijving
- Status (met kleurcodering)
- Klant informatie
- Aannemer informatie (indien toegewezen)
- Budget
- Aantal milestones
- Filter op status

### Betalingen & Escrow

```typescript
interface ProjectPayment {
  id: string;
  projectId: string;
  amount: number;
  status: 'PENDING_CONSUMER' | 'PENDING_ADMIN_REVIEW' | 'ESCROW_CONFIRMED' | 'REJECTED';
  transactionRef?: string;
  createdAt: string;
  project?: {
    title: string;
    customer?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  consumer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

**Admin acties:**
- Escrow betaling goedkeuren
- Escrow betaling afwijzen (met verplichte admin notes)

### Payouts

```typescript
interface Payout {
  id: string;
  projectId: string;
  milestoneId: string;
  amount: number;
  status: 'PENDING_ADMIN_PAYOUT' | 'PAID';
  requestedAt: string;
  paidAt?: string;
  project?: {
    title: string;
  };
  milestone?: {
    title: string;
  };
  contractor?: {
    firstName: string;
    lastName: string;
    companyName?: string;
  };
}
```

**Admin acties:**
- Payout markeren als betaald

## KPI's & Metrics (Admin Overzicht)

Het admin overzicht toont de volgende KPI cards:

1. **Totaal op escrow** - Geld dat nu in escrow staat
2. **Nog uit te betalen** - Afgeronde projecten die nog uitbetaald moeten worden
3. **Totaal uitbetaald** - Totaal bedrag dat al is uitbetaald
4. **Niet gestarte opdrachten** - Projecten in DRAFT status
5. **Opdrachten in uitvoering** - ACTIVE + IN_PROGRESS projecten
6. **Wacht op klantactie** - Milestones met SUBMITTED status
7. **Afgeronde projecten** - COMPLETED projecten
8. **Uitbetalingen deze maand** - Totaal uitbetaald deze maand

### Grafieken

- **Uitbetalingen per maand** (Line Chart) - Laatste 12 maanden
- **Verdeling projectstatussen** (Pie Chart)
- **Verdeling milestonestatussen** (Pie Chart)

### Tabellen

- **Projecten die nog uitbetaald moeten worden** - Projecten met afgeronde milestones waarvan betalingen nog in escrow staan

## API Endpoints

### Backend Endpoints

#### Admin Endpoints
- `GET /api/admin/metrics/financial` - Financiële metrics
- `GET /api/admin/escrow-payments/pending` - Pending escrow payments
- `POST /api/admin/escrow-payments/:id/approve` - Goedkeur escrow payment
- `POST /api/admin/escrow-payments/:id/reject` - Wijzig escrow payment af
- `GET /api/admin/payouts/pending` - Pending payouts
- `POST /api/admin/payouts/:id/mark-paid` - Markeer payout als betaald

#### User Endpoints (voor admin)
- `GET /api/users/customers` - Alle klanten (alleen ADMIN)
- `GET /api/users/contractors` - Alle aannemers
- `GET /api/users/:id` - Gebruiker details

#### Project Endpoints
- `GET /api/projects` - Alle projecten (admin ziet alles)

### Frontend API Clients

- `@/lib/api/admin` - Admin metrics
- `@/lib/api/admin-payments` - Escrow payments & payouts
- `@/lib/api/users` - Customers & contractors
- `@/lib/api/projects` - Projects

## Bug Fixes

### Infinite Loading Bug (Payments Page)

**Probleem**: Admin gebruikers bleven oneindig laden op `/dashboard/payments` pagina.

**Oplossing**: 
- Admin gebruikers worden nu correct afgehandeld
- `isLoading` wordt op `false` gezet voor admin gebruikers
- Admin gebruikers krijgen een bericht om naar het admin dashboard te gaan

**Bestand**: `apps/web/app/(dashboard)/dashboard/payments/page.tsx`

## Routing & Redirects

### Admin Redirect

Wanneer een admin gebruiker inlogt en naar `/dashboard` navigeert, wordt deze automatisch doorgestuurd naar `/dashboard/admin`.

**Implementatie**: `apps/web/app/(dashboard)/dashboard/page.tsx`

```typescript
useEffect(() => {
  if (!authLoading && user?.role === 'ADMIN') {
    router.replace('/dashboard/admin');
  }
}, [user, authLoading, router]);
```

## UI Componenten

### Admin Sidebar

- Fixed left sidebar (256px breed)
- Actieve route highlighting
- Iconen voor elke sectie
- Responsive (verbergt op mobiel, kan worden uitgebreid)

### Admin Layout

- Flex layout met sidebar + main content
- Max width container voor main content
- Automatische auth check en redirect

## Toekomstige Verbeteringen

1. **Detail Views**: 
   - Klant detail pagina met alle projecten
   - Aannemer detail pagina met alle projecten
   - Uitgebreide project detail pagina

2. **Admin Acties**:
   - Account blokkeren/activeren
   - Project status handmatig aanpassen
   - Bulk acties

3. **Filters & Search**:
   - Zoeken op klanten/aannemers
   - Geavanceerde filters op projecten
   - Export functionaliteit

4. **Logs & Audit Trail**:
   - Admin actie logs
   - Gebruikers activiteit logs

