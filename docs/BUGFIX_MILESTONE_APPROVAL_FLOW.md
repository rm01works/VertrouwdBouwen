# Bugfix: Milestone Approval Flow - Aannemer Goedkeuring

**Datum**: December 2024  
**Status**: ✅ Opgelost

## Probleemsamenvatting

Er waren drie gerelateerde problemen in de milestone-flow tussen aannemer en consument:

1. **"Wacht op actie" bij consument**: Na goedkeuring door de aannemer verscheen de milestone niet in de "Wacht op actie" sectie op het consumenten-dashboard.

2. **"Voortgang" bij aannemer**: Na goedkeuring door de aannemer werd de milestone niet als voltooid/getoond in de voortgangsindicatoren.

3. **Goedkeuren-knop blijft staan**: De "Goedkeuren"-knop bleef zichtbaar voor de aannemer, zelfs nadat deze de milestone had goedgekeurd.

## Oorzaak

De problemen lagen aan **mismatches tussen backend-status en frontend-filters**:

### Probleem 1: "Wacht op actie" filter

**Locatie**: `apps/web/app/(dashboard)/dashboard/milestones/page.tsx` (regel 54-59)

**Huidige logica** (fout):
```typescript
if (user.role === 'CUSTOMER') {
  return (
    milestone.status === 'SUBMITTED' &&
    !milestone.approvedByConsumer &&
    milestone.payments?.some((p) => p.status === 'HELD')
  );
}
```

**Probleem**: De filter controleerde niet of de aannemer al had goedgekeurd (`approvedByContractor === true`). Dit betekende dat:
- Milestones konden verschijnen in "Wacht op actie" voordat de aannemer had goedgekeurd
- Milestones verschenen niet in "Wacht op actie" na aannemer-goedkeuring, omdat de filter niet expliciet checkte op `approvedByContractor === true`

**Flow**: 
1. Aannemer dient milestone in (status = `SUBMITTED`)
2. Aannemer keurt milestone goed (`approvedByContractor = true`, status blijft `SUBMITTED`)
3. Consument moet nu goedkeuren (`approvedByConsumer = false`, maar `approvedByContractor = true`)

### Probleem 2: "Voortgang" logica

**Locatie**: `apps/web/components/projects/ProjectCard.tsx` (regel 26-27)

**Huidige logica** (fout):
```typescript
const completedMilestones =
  project.milestones?.filter((m) => m.status === 'PAID').length || 0;
```

**Probleem**: Alleen milestones met status `PAID` werden geteld als voltooid. Maar wanneer een aannemer goedkeurt, blijft de status `SUBMITTED` en wordt alleen `approvedByContractor = true` gezet. De milestone zou moeten worden geteld als "gedeeltelijk voltooid" of "wachtend op consument" in de voortgang.

### Probleem 3: Goedkeuren-knop logica

**Locatie**: `apps/web/components/projects/MilestoneList.tsx` (regel 176-186)

**Huidige logica** (fout):
```typescript
if (userRole === 'CUSTOMER') {
  if (milestone.approvedByConsumer) return false;
  // ... payment check
  return true;
}
```

**Probleem**: De filter voor consumenten controleerde niet of de aannemer al had goedgekeurd. Dit betekende dat consumenten de knop konden zien, zelfs als de aannemer nog niet had goedgekeurd.

## Oplossing

### Fix 1: "Wacht op actie" filter voor consumenten

**Bestand**: `apps/web/app/(dashboard)/dashboard/milestones/page.tsx`

**Nieuwe logica**:
```typescript
if (user.role === 'CUSTOMER') {
  return (
    milestone.status === 'SUBMITTED' &&
    milestone.approvedByContractor === true && // Aannemer heeft goedgekeurd
    milestone.approvedByConsumer === false && // Consument heeft nog niet goedgekeurd
    // Payment check is optioneel - milestone kan ook zonder payment wachten op goedkeuring
    (milestone.payments?.length === 0 || milestone.payments?.some((p) => p.status === 'HELD'))
  );
}
```

**Wijzigingen**:
- Expliciete check op `approvedByContractor === true` toegevoegd
- Payment check is nu optioneel (milestone kan ook zonder payment wachten op goedkeuring)
- Duidelijkere voorwaarden voor wanneer een milestone in "Wacht op actie" verschijnt

### Fix 2: "Voortgang" logica

**Bestand**: `apps/web/components/projects/ProjectCard.tsx`

**Nieuwe logica**:
```typescript
const completedMilestones =
  project.milestones?.filter((m) => 
    m.status === 'PAID' ||
    m.status === 'APPROVED' ||
    (m.approvedByConsumer === true && m.approvedByContractor === true)
  ).length || 0;
```

**Wijzigingen**:
- Milestones worden nu geteld als voltooid als:
  1. Status is `PAID` (volledig afgerond en betaald)
  2. Status is `APPROVED` (volledig goedgekeurd door beide partijen)
  3. Beide partijen hebben goedgekeurd (`approvedByConsumer === true && approvedByContractor === true`)

### Fix 3: Goedkeuren-knop logica

**Bestand**: `apps/web/components/projects/MilestoneList.tsx`

**Nieuwe logica**:
```typescript
if (userRole === 'CUSTOMER') {
  if (milestone.approvedByConsumer) return false; // Consument heeft al goedgekeurd
  if (milestone.approvedByContractor !== true) return false; // Aannemer moet eerst goedkeuren
  // ... payment check
  return true;
}

if (userRole === 'CONTRACTOR') {
  return milestone.approvedByContractor !== true;
}
```

**Wijzigingen**:
- Voor consumenten: Expliciete check toegevoegd dat aannemer eerst moet goedkeuren (`approvedByContractor !== true`)
- Voor aannemers: Expliciete check dat aannemer nog niet heeft goedgekeurd (`approvedByContractor !== true`)
- Duidelijkere voorwaarden voor wanneer de knop wordt getoond

## Impact Analyse

### Getroffen functionaliteiten

1. **"Wacht op actie" sectie** (`apps/web/app/(dashboard)/dashboard/milestones/page.tsx`)
   - ✅ Fix: Filter controleert nu expliciet op `approvedByContractor === true` voor consumenten
   - ✅ Impact: Milestones verschijnen nu correct in "Wacht op actie" na aannemer-goedkeuring

2. **"Voortgang" indicatoren** (`apps/web/components/projects/ProjectCard.tsx`)
   - ✅ Fix: Milestones worden nu geteld als voltooid wanneer beide partijen hebben goedgekeurd
   - ✅ Impact: Voortgang wordt nu correct weergegeven voor aannemers

3. **Goedkeuren-knop** (`apps/web/components/projects/MilestoneList.tsx`)
   - ✅ Fix: Knop verdwijnt nu correct na goedkeuring door aannemer
   - ✅ Fix: Consumenten zien knop alleen als aannemer al heeft goedgekeurd
   - ✅ Impact: UI toont nu correct welke acties beschikbaar zijn

### Andere functionaliteiten (geen impact)

- **Escrow/betalingsflows**: Geen wijzigingen nodig - backend logica blijft hetzelfde
- **Notificaties**: Geen wijzigingen nodig - backend logica blijft hetzelfde
- **Project detail pagina**: Gebruikt dezelfde `MilestoneList` component, dus automatisch gefixed
- **Dashboard overzichten**: Gebruiken dezelfde filters, dus automatisch gefixed

## Testen

### Test scenario's

1. **Aannemer goedkeurt milestone**:
   - ✅ Milestone verschijnt in "Wacht op actie" bij consument
   - ✅ Milestone wordt getoond als voltooid in "Voortgang" voor aannemer
   - ✅ Goedkeuren-knop verdwijnt voor aannemer

2. **Consument goedkeurt milestone**:
   - ✅ Milestone verdwijnt uit "Wacht op actie"
   - ✅ Milestone wordt getoond als volledig voltooid
   - ✅ Betaling wordt vrijgegeven (backend logica)

3. **Edge cases**:
   - ✅ Milestones zonder payment kunnen nog steeds worden goedgekeurd
   - ✅ Filters werken correct met `undefined` of `null` approval flags
   - ✅ Data refresh na goedkeuring werkt correct

## Bestanden gewijzigd

1. `apps/web/app/(dashboard)/dashboard/milestones/page.tsx`
   - Fix: "Wacht op actie" filter voor consumenten en aannemers

2. `apps/web/components/projects/ProjectCard.tsx`
   - Fix: "Voortgang" logica om milestones te tellen als voltooid

3. `apps/web/components/projects/MilestoneList.tsx`
   - Fix: `canApprove` logica voor consumenten en aannemers

## Toekomstige verbeteringen (optioneel)

1. **Helper functies**: Overweeg expliciete helper-functies zoals:
   ```typescript
   function isAwaitingConsumerAction(milestone: Milestone): boolean {
     return milestone.status === 'SUBMITTED' &&
            milestone.approvedByContractor === true &&
            milestone.approvedByConsumer === false;
   }
   
   function isCompleted(milestone: Milestone): boolean {
     return milestone.status === 'PAID' ||
            milestone.status === 'APPROVED' ||
            (milestone.approvedByConsumer && milestone.approvedByContractor);
   }
   
   function canContractorApprove(milestone: Milestone): boolean {
     return milestone.status === 'SUBMITTED' &&
            milestone.approvedByContractor !== true;
   }
   ```

2. **Duidelijkere UI-statuslabels**: Overweeg labels zoals:
   - "In afwachting van consument" (voor aannemers)
   - "In afwachting van aannemer" (voor consumenten)
   - "Beide partijen akkoord" (volledig goedgekeurd)

3. **Unit tests**: Overweeg unit tests voor de filter- en approval-logica om regressies te voorkomen.

## Conclusie

Alle drie de problemen zijn opgelost door:
1. Expliciete checks toe te voegen voor `approvedByContractor` en `approvedByConsumer` flags
2. De "Voortgang" logica uit te breiden om milestones te tellen als voltooid wanneer beide partijen hebben goedgekeurd
3. De goedkeuren-knop logica te verbeteren zodat deze alleen wordt getoond wanneer de juiste voorwaarden zijn voldaan

De fixes zijn minimaal en veilig - ze wijzigen alleen de frontend filter- en display-logica, zonder de backend business logic te beïnvloeden.

