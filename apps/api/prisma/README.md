# Prisma Schema - VertrouwdBouwen Escrow Platform

Dit bestand bevat het Prisma schema voor het VertrouwdBouwen escrow platform.

## Overzicht

Het schema definieert de database structuur voor:
- **Users**: Klanten, aannemers en admins
- **Projects**: Projecten die klanten met aannemers verbinden
- **Milestones**: Project fasen met bedragen
- **EscrowPayments**: Betalingen in escrow
- **Approvals**: Goedkeuringen van milestones
- **Messages**: Communicatie tussen klant en aannemer
- **Disputes**: Geschillen over projecten

## Gebruik

### 1. Prisma Client Genereren

```bash
cd apps/api
npx prisma generate
```

Dit genereert de Prisma Client die gebruikt wordt in de applicatie.

### 2. Database Migraties

#### Eerste migratie (initial setup):
```bash
npx prisma migrate dev --name init
```

#### Nieuwe migratie na schema wijzigingen:
```bash
npx prisma migrate dev --name description_of_change
```

#### Migraties toepassen in productie:
```bash
npx prisma migrate deploy
```

### 3. Database Seeden (test data)

```bash
npx prisma db seed
```

Of:
```bash
npx tsx prisma/seed.ts
```

### 4. Prisma Studio (Database GUI)

Open een visuele interface om de database te bekijken en bewerken:

```bash
npx prisma studio
```

Dit opent een web interface op http://localhost:5555

## Schema Structuur

### ENUM Types

- **UserRole**: CUSTOMER, CONTRACTOR, ADMIN
- **ProjectStatus**: DRAFT, PENDING_CONTRACTOR, ACTIVE, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED
- **MilestoneStatus**: PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, PAID
- **PaymentStatus**: PENDING, HELD, RELEASED, REFUNDED
- **ApprovalStatus**: PENDING, APPROVED, REJECTED
- **DisputeStatus**: OPEN, RESOLVED, CLOSED

### Models

#### User
- Gebruikers van het platform
- Kan zowel klant als aannemer zijn (via role)
- Aannemers hebben verplicht companyName en kvkNumber

#### Project
- Verbindt klant (customer) met aannemer (contractor)
- contractorId is optioneel tot acceptatie
- Heeft meerdere milestones

#### Milestone
- Project fasen met specifieke bedragen
- Heeft een volgorde (order) binnen project
- Unieke combinatie: projectId + order

#### EscrowPayment
- Betalingen in escrow voor milestones
- Status bepaalt of geld vastgehouden, vrijgegeven of terugbetaald is
- Unieke transaction_reference

#### Approval
- Goedkeuringen door klant
- Meerdere approvals mogelijk per milestone (bij herindiening)

#### Message
- Berichten tussen klant en aannemer
- Altijd gekoppeld aan een project

#### Dispute
- Geschillen over projecten of milestones
- milestoneId is optioneel (null = geschil over heel project)

## Indexes

Het schema bevat indexes voor:
- Foreign keys (voor snelle joins)
- Status velden (voor filtering)
- Veelgebruikte query patterns
- Composite indexes voor complexe queries

## Relaties

### One-to-Many (1:N)
- User → Projects (als klant of aannemer)
- Project → Milestones
- Project → Messages
- Project → Disputes
- Milestone → EscrowPayments
- Milestone → Approvals
- Milestone → Disputes
- User → Approvals
- User → Messages
- User → Disputes

### Many-to-One (N:1)
- Project → User (customer)
- Project → User (contractor)
- Milestone → Project
- EscrowPayment → Milestone
- Approval → Milestone
- Approval → User
- Message → Project
- Message → User
- Dispute → Project
- Dispute → Milestone (optioneel)
- Dispute → User

## Cascade Behavior

- **Cascade Delete**: 
  - Project → Milestones, Messages, Disputes
  - Milestone → Approvals
  
- **Set Null**:
  - Project → Contractor (bij verwijderen contractor)
  - Dispute → Milestone (bij verwijderen milestone)

- **Restrict**:
  - Project → Customer (kan niet verwijderen als er projecten zijn)
  - EscrowPayment → Milestone
  - Approval → User
  - Message → User
  - Dispute → User

## Data Types

- **UUID**: Voor alle primary keys
- **Decimal(10, 2)**: Voor geldbedragen (precisie tot centen)
- **DateTime**: Voor timestamps
- **Date**: Voor start/end dates
- **Json**: Voor flexibele data (adressen)
- **String**: Voor tekstvelden
- **Int**: Voor order/volgorde

## Validatie

Prisma valideert automatisch:
- Required fields
- Unique constraints
- Foreign key relationships
- Enum values

Extra validatie moet in de applicatie laag gebeuren (bijv. email format, bedrag > 0).

## Environment Variables

Zorg dat `DATABASE_URL` is ingesteld in `.env`:

```env
DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen?schema=public
```

## Best Practices

1. **Migraties**: Maak altijd een migratie bij schema wijzigingen
2. **Backups**: Maak regelmatig backups van de database
3. **Indexes**: Voeg indexes toe voor veelgebruikte queries
4. **Types**: Gebruik Prisma Client types in TypeScript code
5. **Relations**: Gebruik `include` en `select` voor efficiente queries

## Troubleshooting

### Prisma Client niet up-to-date
```bash
npx prisma generate
```

### Database out of sync
```bash
npx prisma migrate reset  # ⚠️ Verwijdert alle data!
# Of
npx prisma migrate deploy
```

### Schema validatie errors
```bash
npx prisma validate
```

## Meer Informatie

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

