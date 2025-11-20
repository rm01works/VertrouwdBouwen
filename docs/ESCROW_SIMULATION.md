# Escrow Simulatie - Volledige Workflow

Dit document beschrijft hoe de escrow simulatie werkt van begin tot eind.

## Workflow Overzicht

```
┌─────────────────────────────────────────────────────────────┐
│              ESCROW WORKFLOW SIMULATIE                      │
└─────────────────────────────────────────────────────────────┘

1. KLANT STORT BEDRAG
   POST /api/milestones/:id/fund
   └─> EscrowPayment aangemaakt in database
   └─> Status: HELD
   └─> heldAt: timestamp
   └─> transactionRef: ESCROW-{timestamp}-{uuid}
   ✅ Geld staat nu "in escrow" (gesimuleerd)

2. AANNEMER START WERK
   POST /api/milestones/:id/start
   └─> Milestone status: PENDING → IN_PROGRESS
   ✅ Aannemer kan nu werken

3. AANNEMER WERKT AAN MILESTONE
   (Werk wordt uitgevoerd - geen API call nodig)

4. AANNEMER DIENT MILESTONE IN (VOLTOOID)
   POST /api/milestones/:id/submit
   └─> Milestone status: IN_PROGRESS → SUBMITTED
   └─> Betaling blijft in escrow (HELD)
   ✅ Wacht op goedkeuring van klant

5. KLANT KEURT GOED
   POST /api/milestones/:id/approve
   └─> Approval aangemaakt: APPROVED
   └─> Milestone status: SUBMITTED → APPROVED → PAID
   └─> EscrowPayment status: HELD → RELEASED
   └─> releasedAt: timestamp
   └─> transactionRef: TXN-{timestamp}-{uuid}
   ✅ AANNEMER ONTVANGT BETALING (gesimuleerd)
```

## Stap-voor-Stap Uitleg

### Stap 1: Klant Stort Bedrag

**Wat gebeurt er:**
- Klant roept `POST /api/milestones/:id/fund` aan
- Service maakt `EscrowPayment` record aan in database
- Status wordt `HELD` (geld staat in escrow)
- `heldAt` timestamp wordt gezet
- Unieke transactie referentie wordt gegenereerd
- **Geen echte betaling** - alleen database record

**Database State:**
```sql
escrow_payments:
  id: uuid
  milestone_id: uuid
  amount: 5000.00
  status: 'HELD'
  held_at: 2024-02-01 10:00:00
  released_at: NULL
  transaction_reference: 'ESCROW-1708000000-A1B2C3D4'
```

### Stap 2: Aannemer Start Werk

**Wat gebeurt er:**
- Aannemer roept `POST /api/milestones/:id/start` aan
- Milestone status wordt `PENDING` → `IN_PROGRESS`
- Aannemer kan nu werk uitvoeren

**Database State:**
```sql
milestones:
  id: uuid
  status: 'IN_PROGRESS'
```

### Stap 3: Aannemer Werkt

**Wat gebeurt er:**
- Aannemer voert werk uit
- Geen API calls nodig
- Milestone blijft `IN_PROGRESS`

### Stap 4: Aannemer Dient In (Voltooid)

**Wat gebeurt er:**
- Aannemer roept `POST /api/milestones/:id/submit` aan
- Milestone status wordt `IN_PROGRESS` → `SUBMITTED`
- Betaling blijft in escrow (status blijft `HELD`)
- Klant kan nu goedkeuren

**Database State:**
```sql
milestones:
  status: 'SUBMITTED'

escrow_payments:
  status: 'HELD' (blijft hetzelfde)
```

### Stap 5: Klant Keurt Goed

**Wat gebeurt er:**
- Klant roept `POST /api/milestones/:id/approve` aan
- **In één database transactie:**
  1. Approval record aangemaakt (status: `APPROVED`)
  2. Milestone status: `SUBMITTED` → `APPROVED` → `PAID`
  3. EscrowPayment status: `HELD` → `RELEASED`
  4. `releasedAt` timestamp gezet
  5. Nieuwe transactie referentie voor release
- **Aannemer ontvangt betaling** (gesimuleerd - alleen status update)

**Database State:**
```sql
milestones:
  status: 'PAID'

escrow_payments:
  status: 'RELEASED'
  released_at: 2024-02-15 14:30:00
  transaction_reference: 'TXN-1708000000-B2C3D4E5'

approvals:
  id: uuid
  milestone_id: uuid
  approver_id: {customerId}
  status: 'APPROVED'
  comments: 'Goedgekeurd!'
```

## API Endpoints Overzicht

| Stap | Endpoint | Rol | Status Change |
|------|----------|-----|---------------|
| 1 | `POST /api/milestones/:id/fund` | CUSTOMER | Payment: PENDING → HELD |
| 2 | `POST /api/milestones/:id/start` | CONTRACTOR | Milestone: PENDING → IN_PROGRESS |
| 3 | (Werk uitvoeren) | - | - |
| 4 | `POST /api/milestones/:id/submit` | CONTRACTOR | Milestone: IN_PROGRESS → SUBMITTED |
| 5 | `POST /api/milestones/:id/approve` | CUSTOMER | Payment: HELD → RELEASED<br>Milestone: SUBMITTED → PAID |

## Test de Workflow

### Optie 1: Test Script

```bash
./scripts/test-escrow-flow.sh
```

Dit script:
1. Registreert klant en aannemer
2. Maakt project met milestone aan
3. Voert alle stappen uit
4. Verifieert eindstatus

### Optie 2: Handmatig met cURL

```bash
# 1. Fund milestone (klant)
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/fund \
  -H "Authorization: Bearer {customerToken}"

# 2. Start milestone (aannemer)
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/start \
  -H "Authorization: Bearer {contractorToken}"

# 3. Submit milestone (aannemer)
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/submit \
  -H "Authorization: Bearer {contractorToken}"

# 4. Approve milestone (klant)
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/approve \
  -H "Authorization: Bearer {customerToken}" \
  -d '{"comments": "Goedgekeurd!"}'
```

## Validatie per Stap

### Stap 1: Fund
- ✅ Klant is geauthenticeerd
- ✅ Klant is eigenaar van project
- ✅ Milestone bestaat
- ✅ Geen actieve HELD betaling

### Stap 2: Start
- ✅ Aannemer is geauthenticeerd
- ✅ Aannemer is geaccepteerd op project
- ✅ Milestone status is PENDING

### Stap 3: Submit
- ✅ Aannemer is geauthenticeerd
- ✅ Aannemer is eigenaar van project
- ✅ Milestone status is IN_PROGRESS
- ✅ Betaling staat in escrow (HELD)

### Stap 4: Approve
- ✅ Klant is geauthenticeerd
- ✅ Klant is eigenaar van project
- ✅ Milestone status is SUBMITTED
- ✅ Betaling status is HELD
- ✅ Geen eerdere goedkeuring

## Database Transacties

### Fund Milestone
```typescript
// Eén database insert
EscrowPayment.create({
  status: 'HELD',
  heldAt: new Date(),
  transactionRef: generateRef()
})
```

### Approve Milestone
```typescript
// Alles in één transactie (atomic)
prisma.$transaction([
  Approval.create({ status: 'APPROVED' }),
  Milestone.update({ status: 'APPROVED' }),
  EscrowPayment.update({ status: 'RELEASED' }),
  Milestone.update({ status: 'PAID' })
])
```

## Simulatie Details

### Wat wordt gesimuleerd:
- ✅ Geld in escrow zetten (database record)
- ✅ Geld vasthouden (status: HELD)
- ✅ Geld vrijgeven (status: RELEASED)
- ✅ Transactie tracking (transactionRef)
- ✅ Timestamps voor audit trail
- ✅ Status management

### Wat wordt NIET gesimuleerd:
- ❌ Echte betalingen (geen bank integratie)
- ❌ Creditcard verwerking
- ❌ Payment providers (Stripe, Mollie, etc.)
- ❌ Geld transfers tussen accounts

## Success Criteria

Workflow is succesvol als:

1. ✅ **Fund**: EscrowPayment aangemaakt met status HELD
2. ✅ **Start**: Milestone status is IN_PROGRESS
3. ✅ **Submit**: Milestone status is SUBMITTED
4. ✅ **Approve**: 
   - Approval aangemaakt (APPROVED)
   - Milestone status is PAID
   - EscrowPayment status is RELEASED
   - releasedAt timestamp is gezet
   - Aannemer heeft betaling "ontvangen" (gesimuleerd)

## Error Handling

Elke stap heeft specifieke error checks:
- **401**: Niet geauthenticeerd
- **403**: Verkeerde rol of geen toegang
- **404**: Resource niet gevonden
- **400**: Validatie error (verkeerde status, etc.)
- **409**: Conflict (bijv. al gefinancierd)

## Monitoring

Check betaling status:
```bash
GET /api/milestones/:id/payments
GET /api/payments/:id
```

Check milestone status:
```bash
GET /api/milestones/:id
```

## Volgende Stappen

Voor productie:
1. Integreer echte payment provider
2. Voeg webhooks toe voor payment events
3. Implementeer payment method selection
4. Voeg email notificaties toe
5. Maak payment dashboard
6. Voeg reporting toe

