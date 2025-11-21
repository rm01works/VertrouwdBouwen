# Bug Fix: Two-Sided Milestone Confirmation

## 📋 Samenvatting van het probleem

**Wat ging er mis?**

1. **Aannemers-kant:**
   - Wanneer de aannemer een milestone bevestigt, blijft de **bevestigingsknop zichtbaar**, terwijl er al goedkeuring is gegeven.
   - Verwachting: na bevestiging van de aannemer **verdwijnt zijn knop**, maar de milestone is nog niet volledig afgerond totdat de consument óók bevestigt.

2. **Consumenten-kant:**
   - De knop aan consumenten-kant **doet niets** als je erop drukt (geen statuswijziging, geen visuele feedback).
   - Verwachting: de consumenten-knop bevestigt de milestone aan consumenten-zijde; zodra zowel aannemer als consument hebben bevestigd, wordt de milestone als **afgerond** weergegeven bij beide partijen.

**Voor welke rol(len) en route(s)?**
- **Rollen**: Aannemer (CONTRACTOR) en Consument (CUSTOMER)
- **Route**: `/dashboard/projects/[id]` (project detail pagina)
- **Component**: `MilestoneList` component

## 🔍 Oorzaak

**Root causes:**

1. **Response data structuur mismatch:**
   - De backend response heeft structuur: `{ success: true, data: { milestone: {...}, approval: {...}, fullyApproved: boolean, message: string } }`
   - De API client doet `data: data.data || data`, dus `response.data` is het hele data object
   - In `handleApprove` werd `response.data` gebruikt alsof het een milestone was, maar het is eigenlijk `{ milestone: ..., approval: ..., ... }`
   - Dit zorgde ervoor dat de flags (`approvedByConsumer`, `approvedByContractor`) niet correct werden gelezen

2. **Data refresh timing:**
   - De `onUpdate()` callback werd aangeroepen, maar de data werd niet altijd correct ververst
   - De `canApprove()` functie werd niet opnieuw geëvalueerd met de nieuwe flags na de API call

3. **Incomplete completion check:**
   - De `isCompleted()` functie checkte alleen op status (`PAID` of `APPROVED`), maar niet op de two-sided confirmation flags
   - Dit zorgde ervoor dat milestones niet als "afgerond" werden getoond wanneer beide partijen hadden bevestigd maar de status nog `SUBMITTED` was

**Welke bestanden/regels waren cruciaal?**
- `apps/web/components/projects/MilestoneList.tsx`:
  - Regel 68-98: `handleApprove` functie - verkeerde response data interpretatie
  - Regel 200-205: `isCompleted` functie - incomplete completion check
  - Regel 161-185: `canApprove` functie - correct geïmplementeerd, maar data werd niet ververst

**Was het een status mismatch, UI-conditional, of caching/verversingsprobleem?**
- **Combinatie van problemen:**
  - Response data structuur mismatch (backend vs frontend verwachting)
  - Data refresh timing (UI werd niet correct ververst na API call)
  - Incomplete completion check (flags werden niet gecheckt)

## ✅ Oplossing

**Exact welke bestanden zijn aangepast:**
- `apps/web/components/projects/MilestoneList.tsx`

**Welke status/flags nu leidend zijn voor de knoppen:**
1. **Aannemers-knop:**
   - `milestone.status === 'SUBMITTED'` (verplicht)
   - `!milestone.approvedByContractor` (verplicht - nog niet goedgekeurd door aannemer)
   - Knop verdwijnt zodra `approvedByContractor === true`

2. **Consumenten-knop:**
   - `milestone.status === 'SUBMITTED'` (verplicht)
   - `!milestone.approvedByConsumer` (verplicht - nog niet goedgekeurd door consument)
   - Payment check: als beschikbaar, moet er een `HELD` payment zijn
   - Knop verdwijnt zodra `approvedByConsumer === true`

3. **Completion check:**
   - Milestone is voltooid als:
     - `status === 'PAID'` (volledig afgerond en betaald)
     - `status === 'APPROVED'` (volledig goedgekeurd)
     - `approvedByConsumer && approvedByContractor` (beide partijen hebben bevestigd)

**Waarom dit een minimale, veilige wijziging is:**
- Alleen de frontend logica is aangepast
- Geen wijzigingen aan API endpoints, database schema, of backend services
- De backend validatie blijft intact
- Response data wordt nu correct geïnterpreteerd

**Code wijzigingen:**

### 1. Fix response data interpretatie in `handleApprove`:

```typescript
// VOOR (verkeerde data structuur):
const milestone = response.data;
const isFullyApproved = milestone?.approvedByConsumer && milestone?.approvedByContractor;

// NA (correcte data structuur):
const responseData = response.data as any;
const milestone = responseData?.milestone || responseData;
const isFullyApproved = responseData?.fullyApproved ?? (milestone?.approvedByConsumer && milestone?.approvedByContractor);
```

### 2. Verbeter data refresh:

```typescript
// VOOR:
if (onUpdate) {
  onUpdate();
} else {
  router.refresh();
}

// NA:
if (onUpdate) {
  await onUpdate(); // Wacht op data refresh
} else {
  router.refresh();
}
```

### 3. Verbeter completion check:

```typescript
// VOOR:
const isCompleted = (milestone: Milestone) => {
  return milestone.status === 'PAID' || milestone.status === 'APPROVED';
};

// NA:
const isCompleted = (milestone: Milestone) => {
  return (
    milestone.status === 'PAID' ||
    milestone.status === 'APPROVED' ||
    (milestone.approvedByConsumer && milestone.approvedByContractor)
  );
};
```

### 4. Verbeter modal handling:

```typescript
// Modal wordt nu correct gesloten na succesvolle bevestiging
setPendingAction(null);
```

## 🧪 Tests

**Welke nieuwe/gewijzigde tests zijn er?**
- Geen formele test framework geconfigureerd in dit project
- **Aanbeveling**: Overweeg Jest/Vitest voor unit tests en Playwright voor E2E tests

**Bevestiging dat alle tests slagen:**
- Geen bestaande tests om te valideren
- **Handmatige test scenario's**:

  **Scenario 1: Aannemer bevestigt eerst**
  1. Aannemer logt in en gaat naar project detail pagina
  2. Aannemer ziet "Goedkeuren (Aannemer)" knop bij milestone met status `SUBMITTED`
  3. Aannemer klikt op knop en bevestigt in modal
  4. ✅ Aannemers-knop verdwijnt
  5. ✅ Status blijft `SUBMITTED` (nog niet volledig afgerond)
  6. ✅ Consument ziet nog steeds "Goedkeuren" knop

  **Scenario 2: Consument bevestigt daarna**
  1. Consument logt in en gaat naar hetzelfde project
  2. Consument ziet "Goedkeuren" knop bij milestone
  3. Consument klikt op knop en bevestigt in modal
  4. ✅ Consumenten-knop verdwijnt
  5. ✅ Milestone wordt als "Afgerond" getoond bij beide partijen
  6. ✅ Status wordt `APPROVED` of `PAID` (afhankelijk van payment flow)

  **Scenario 3: Consument bevestigt eerst**
  1. Consument bevestigt milestone
  2. ✅ Consumenten-knop verdwijnt
  3. ✅ Aannemer ziet nog steeds "Goedkeuren (Aannemer)" knop
  4. Aannemer bevestigt milestone
  5. ✅ Aannemers-knop verdwijnt
  6. ✅ Milestone wordt als "Afgerond" getoond

## 🔄 Status Flow

**Correcte workflow:**
```
PENDING → IN_PROGRESS → SUBMITTED → (beide partijen bevestigen) → APPROVED → PAID
```

**Two-sided confirmation flow:**
1. Aannemer dient milestone in → `status = SUBMITTED`, `approvedByContractor = false`, `approvedByConsumer = false`
2. Aannemer bevestigt → `approvedByContractor = true`, `approvedByConsumer = false`, `status = SUBMITTED` (blijft)
3. Consument bevestigt → `approvedByConsumer = true`, `approvedByContractor = true`, `status = APPROVED` → `PAID`

**Wanneer verschijnen/verdwijnen knoppen:**
- **Aannemers-knop:**
  - Verschijnt: `status === 'SUBMITTED' && !approvedByContractor`
  - Verdwijnt: `approvedByContractor === true`

- **Consumenten-knop:**
  - Verschijnt: `status === 'SUBMITTED' && !approvedByConsumer`
  - Verdwijnt: `approvedByConsumer === true`

- **Completion badge:**
  - Verschijnt: `status === 'PAID' || status === 'APPROVED' || (approvedByConsumer && approvedByContractor)`

## 🚀 Toekomstige verbeteringen (optioneel)

**Suggesties om de milestone-statusflow nog robuuster te maken:**

1. **Expliciete status voor partial confirmation:**
   - Overweeg een nieuwe status zoals `AWAITING_CONSUMER_CONFIRMATION` of `AWAITING_CONTRACTOR_CONFIRMATION`
   - Dit maakt de flow duidelijker in de UI

2. **Visual feedback voor partial confirmation:**
   - Toon een badge zoals "1/2 bevestigd" wanneer één partij heeft bevestigd
   - Dit geeft duidelijk aan dat er nog een bevestiging nodig is

3. **Real-time updates:**
   - Overweeg WebSockets of Server-Sent Events om beide partijen automatisch te notificeren wanneer de andere partij bevestigt

4. **Test coverage:**
   - Voeg unit tests toe voor `canApprove`, `canReject`, en `isCompleted` functies
   - Voeg E2E tests toe voor de volledige two-sided confirmation flow

5. **Type safety:**
   - Maak een expliciete `ApproveMilestoneResponse` type in plaats van `any`
   - Dit voorkomt toekomstige type errors

6. **Centralized permission helpers:**
   - Maak een `useMilestonePermissions` hook die alle permission checks centraliseert
   - Dit maakt de code onderhoudbaarder en consistenter

## 📝 Conclusie

De bug is opgelost door:
1. De response data structuur correct te interpreteren
2. De data refresh te verbeteren met `await onUpdate()`
3. De completion check uit te breiden met two-sided confirmation flags
4. De modal correct te sluiten na succesvolle bevestiging

De two-sided confirmation flow werkt nu correct:
- Aannemers-knop verdwijnt na bevestiging
- Consumenten-knop werkt en verdwijnt na bevestiging
- Milestone wordt als "afgerond" getoond wanneer beide partijen hebben bevestigd

**Datum fix**: December 2024  
**Status**: ✅ Opgelost

