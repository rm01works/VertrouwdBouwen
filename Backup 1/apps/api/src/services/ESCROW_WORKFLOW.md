# Escrow Workflow - Volledige Simulatie

Dit document beschrijft de volledige escrow workflow van begin tot eind.

## Workflow Stappen

### Stap 1: Klant Stort Bedrag (Fund Milestone)

**Endpoint:** `POST /api/milestones/:id/fund`

**Actie:** Klant zet geld in escrow voor een milestone.

**Status Changes:**
- EscrowPayment: `PENDING` → `HELD`
- `heldAt` timestamp wordt gezet
- Unieke `transactionRef` wordt gegenereerd

**Voorwaarden:**
- Alleen klanten kunnen financieren
- Milestone moet bestaan
- Geen actieve HELD betaling voor deze milestone

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "milestoneId": "uuid",
      "amount": 5000.00,
      "status": "HELD",
      "heldAt": "2024-02-01T10:00:00.000Z",
      "transactionRef": "ESCROW-1708000000-A1B2C3D4"
    },
    "message": "€5,000.00 is in escrow gezet voor milestone \"...\""
  }
}
```

---

### Stap 2: Aannemer Start Werk

**Endpoint:** `POST /api/milestones/:id/start`

**Actie:** Aannemer start werk aan milestone.

**Status Changes:**
- Milestone: `PENDING` → `IN_PROGRESS`

**Voorwaarden:**
- Alleen aannemers kunnen starten
- Milestone moet status `PENDING` hebben
- Aannemer moet geaccepteerd zijn op project

**Response:**
```json
{
  "success": true,
  "data": {
    "milestone": {
      "id": "uuid",
      "status": "IN_PROGRESS",
      ...
    },
    "message": "Milestone gestart - werk kan beginnen"
  }
}
```

---

### Stap 3: Aannemer Dient Milestone In (Voltooid)

**Endpoint:** `POST /api/milestones/:id/submit`

**Actie:** Aannemer markeert milestone als voltooid en dient in voor goedkeuring.

**Status Changes:**
- Milestone: `IN_PROGRESS` → `SUBMITTED`

**Voorwaarden:**
- Alleen aannemers kunnen indienen
- Milestone moet status `IN_PROGRESS` hebben
- Betaling moet in escrow staan (HELD)

**Response:**
```json
{
  "success": true,
  "data": {
    "milestone": {
      "id": "uuid",
      "status": "SUBMITTED",
      ...
    },
    "message": "Milestone ingediend voor goedkeuring"
  }
}
```

---

### Stap 4: Klant Keurt Goed

**Endpoint:** `POST /api/milestones/:id/approve`

**Actie:** Klant keurt milestone goed en betaling wordt vrijgegeven aan aannemer.

**Status Changes:**
- Approval: Nieuw record met status `APPROVED`
- Milestone: `SUBMITTED` → `APPROVED` → `PAID`
- EscrowPayment: `HELD` → `RELEASED`
- `releasedAt` timestamp wordt gezet
- Nieuwe `transactionRef` wordt gegenereerd voor release

**Voorwaarden:**
- Alleen klanten kunnen goedkeuren
- Milestone moet status `SUBMITTED` hebben
- EscrowPayment moet status `HELD` hebben
- Geen eerdere goedkeuring

**Response:**
```json
{
  "success": true,
  "data": {
    "milestone": {
      "id": "uuid",
      "status": "PAID",
      ...
    },
    "approval": {
      "id": "uuid",
      "status": "APPROVED",
      ...
    },
    "payment": {
      "id": "uuid",
      "status": "RELEASED",
      "releasedAt": "2024-02-15T14:30:00.000Z",
      "transactionRef": "TXN-1708000000-B2C3D4E5"
    },
    "message": "Milestone goedgekeurd en betaling vrijgegeven"
  }
}
```

---

## Volledige Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ESCROW WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

1. KLANT STORT BEDRAG
   POST /api/milestones/:id/fund
   └─> EscrowPayment aangemaakt
   └─> Status: HELD
   └─> heldAt: nu
   └─> transactionRef: ESCROW-{timestamp}-{uuid}

2. AANNEMER START WERK
   POST /api/milestones/:id/start
   └─> Milestone status: PENDING → IN_PROGRESS

3. AANNEMER WERKT AAN MILESTONE
   (Werk wordt uitgevoerd)

4. AANNEMER DIENT IN (VOLTOOID)
   POST /api/milestones/:id/submit
   └─> Milestone status: IN_PROGRESS → SUBMITTED
   └─> Betaling blijft in escrow (HELD)

5. KLANT KEURT GOED
   POST /api/milestones/:id/approve
   └─> Approval aangemaakt: APPROVED
   └─> Milestone status: SUBMITTED → APPROVED → PAID
   └─> EscrowPayment status: HELD → RELEASED
   └─> releasedAt: nu
   └─> transactionRef: TXN-{timestamp}-{uuid}
   └─> ✅ AANNEMER ONTVANGT BETALING (gesimuleerd)
```

## Status Transitions

### Milestone Status Flow
```
PENDING → IN_PROGRESS → SUBMITTED → APPROVED → PAID
```

### EscrowPayment Status Flow
```
PENDING → HELD → RELEASED (bij goedkeuring)
              ↓
          REFUNDED (bij refund)
```

## Test Script

Zie `scripts/test-escrow-flow.sh` voor een volledig test script.

## cURL Voorbeelden

### 1. Fund Milestone (Klant)
```bash
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/fund \
  -H "Authorization: Bearer {customerToken}" \
  -H "Content-Type: application/json"
```

### 2. Start Milestone (Aannemer)
```bash
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/start \
  -H "Authorization: Bearer {contractorToken}" \
  -H "Content-Type: application/json"
```

### 3. Submit Milestone (Aannemer)
```bash
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/submit \
  -H "Authorization: Bearer {contractorToken}" \
  -H "Content-Type: application/json"
```

### 4. Approve Milestone (Klant)
```bash
curl -X POST http://localhost:5000/api/milestones/{milestoneId}/approve \
  -H "Authorization: Bearer {customerToken}" \
  -H "Content-Type: application/json" \
  -d '{"comments": "Goedgekeurd!"}'
```

## Database State na Elke Stap

### Na Stap 1 (Fund)
```sql
escrow_payments:
  - status: HELD
  - heldAt: 2024-02-01 10:00:00
  - releasedAt: NULL
  - transactionRef: ESCROW-1708000000-A1B2C3D4

milestones:
  - status: PENDING
```

### Na Stap 2 (Start)
```sql
milestones:
  - status: IN_PROGRESS
```

### Na Stap 3 (Submit)
```sql
milestones:
  - status: SUBMITTED

escrow_payments:
  - status: HELD (blijft hetzelfde)
```

### Na Stap 4 (Approve)
```sql
milestones:
  - status: PAID

escrow_payments:
  - status: RELEASED
  - releasedAt: 2024-02-15 14:30:00
  - transactionRef: TXN-1708000000-B2C3D4E5

approvals:
  - status: APPROVED
  - approverId: {customerId}
```

## Validatie Checklist

Voor elke stap wordt gecontroleerd:
- ✅ Gebruiker is geauthenticeerd
- ✅ Gebruiker heeft juiste rol (CUSTOMER of CONTRACTOR)
- ✅ Gebruiker is eigenaar van project/milestone
- ✅ Status is correct voor de actie
- ✅ Geen dubbele acties
- ✅ Betaling staat in escrow (waar nodig)

## Error Scenarios

### Geen Betaling in Escrow
- **Fout:** "Geen escrow betaling gevonden. Milestone moet eerst gefinancierd worden."
- **Oplossing:** Fund milestone eerst

### Verkeerde Status
- **Fout:** "Milestone moet status X hebben om actie Y uit te voeren"
- **Oplossing:** Volg de juiste workflow volgorde

### Geen Toegang
- **Fout:** "Alleen de klant/aannemer kan deze actie uitvoeren"
- **Oplossing:** Gebruik juiste gebruiker token

## Success Criteria

Workflow is succesvol als:
1. ✅ Geld wordt in escrow gezet (HELD)
2. ✅ Milestone wordt gestart (IN_PROGRESS)
3. ✅ Milestone wordt ingediend (SUBMITTED)
4. ✅ Klant keurt goed (APPROVED)
5. ✅ Betaling wordt vrijgegeven (RELEASED)
6. ✅ Milestone wordt betaald (PAID)
7. ✅ Aannemer ontvangt betaling (gesimuleerd)

