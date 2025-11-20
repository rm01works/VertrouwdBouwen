# Escrow Service - Gesimuleerde Betalingsservice

Deze service simuleert een escrow betalingssysteem waarbij geld wordt vastgehouden tot goedkeuring.

## Overzicht

De escrow service:
- **Houdt geld vast** in de database (geen echte betalingen)
- **Genereert transactie referenties** voor tracking
- **Geeft geld vrij** na goedkeuring door klant
- **Kan geld terugbetalen** (refund) aan klant

## Workflow

```
1. Klant financiert milestone
   → POST /api/milestones/:id/fund
   → EscrowPayment aangemaakt met status: HELD
   → Geld staat "in escrow"

2. Aannemer werkt aan milestone
   → Milestone status: IN_PROGRESS

3. Aannemer dient milestone in
   → POST /api/milestones/:id/submit
   → Milestone status: SUBMITTED

4. Klant keurt goed
   → POST /api/milestones/:id/approve
   → EscrowPayment status: HELD → RELEASED
   → Milestone status: PAID
   → Geld wordt "vrijgegeven" (gesimuleerd)

OF

4. Klant vraagt refund aan
   → POST /api/payments/:id/refund
   → EscrowPayment status: HELD → REFUNDED
   → Geld wordt "terugbetaald" (gesimuleerd)
```

## Database Model

### EscrowPayment

```typescript
{
  id: UUID
  milestoneId: UUID
  amount: Decimal(10, 2)
  status: PaymentStatus (PENDING | HELD | RELEASED | REFUNDED)
  heldAt: DateTime?        // Wanneer geld in escrow gezet
  releasedAt: DateTime?    // Wanneer geld vrijgegeven/terugbetaald
  transactionRef: String   // Unieke transactie referentie
  createdAt: DateTime
  updatedAt: DateTime
}
```

## API Endpoints

### Fund Milestone
```
POST /api/milestones/:id/fund
```
Zet geld in escrow voor een milestone.

### Get Payment
```
GET /api/payments/:id
```
Haal specifieke betaling op.

### Get Milestone Payments
```
GET /api/milestones/:id/payments
```
Haal alle betalingen voor een milestone op.

### Get User Payments
```
GET /api/payments
```
Haal alle betalingen voor gebruiker op (gefilterd op rol).

### Refund Payment
```
POST /api/payments/:id/refund
```
Geef geld terug aan klant.

## Status Flow

```
PENDING → HELD → RELEASED (bij goedkeuring)
              ↓
          REFUNDED (bij refund)
```

## Transactie Referenties

Transactie referenties worden automatisch gegenereerd:
- Format: `ESCROW-{timestamp}-{uuid}`
- Voorbeeld: `ESCROW-1708000000-A1B2C3D4`
- Uniek per betaling

## Validatie

### Fund Milestone
- Alleen klanten kunnen financieren
- Bedrag moet overeenkomen met milestone bedrag
- Geen dubbele financiering (geen actieve HELD betaling)

### Approve Milestone
- Alleen klanten kunnen goedkeuren
- Milestone moet status SUBMITTED hebben
- Betaling moet status HELD hebben
- Geen dubbele goedkeuring

### Refund
- Alleen klanten kunnen refunds aanvragen
- Betaling moet status HELD hebben
- Milestone mag nog niet goedgekeurd zijn

## Security

- Rol-gebaseerde toegang (klanten vs aannemers)
- Validatie van project eigendom
- Transactie integriteit (database transactions)
- Unieke transactie referenties

## Simulatie Details

**Geen echte betalingen:**
- Geen externe payment providers
- Geen bank integraties
- Geen creditcard verwerking
- Alle "betalingen" zijn database records

**Wat wordt gesimuleerd:**
- Geld in escrow zetten (HELD status)
- Geld vrijgeven (RELEASED status)
- Geld terugbetalen (REFUNDED status)
- Transactie tracking met referenties
- Timestamps voor audit trail

## Gebruik in Productie

Voor productie gebruik:
1. Vervang deze service met echte payment provider (Stripe, Mollie, etc.)
2. Integreer webhook handlers voor payment events
3. Voeg payment method selection toe
4. Implementeer echte refund logica
5. Voeg payment history en reporting toe

## Testing

Test de escrow service met:

```bash
# Fund milestone
curl -X POST http://localhost:5000/api/milestones/{id}/fund \
  -H "Authorization: Bearer <token>"

# Check payment status
curl -X GET http://localhost:5000/api/milestones/{id}/payments \
  -H "Authorization: Bearer <token>"

# Approve (releases payment)
curl -X POST http://localhost:5000/api/milestones/{id}/approve \
  -H "Authorization: Bearer <token>"
```

