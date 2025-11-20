# Feedbackrichtlijnen

- **Toast**: gebruik voor lichte, niet-blokkerende statusupdates (bijv. formulier opgeslagen, project aangemaakt, API-fout die geen directe actie vereist). Toasts verdwijnen automatisch en mogen nooit extra input verlangen.
- **Modal/Dialog**: gebruik wanneer een actie expliciete bevestiging vereist of extra context toont (goedkeuring, indienen, destructieve acties). Een modal blokkeert de achtergrond, heeft een duidelijke titel, beschrijving en twee acties (primair/secondair).
- **Loading/Skeleton**: gebruik skeletons voor pagina’s met veel content (dashboard, projectdetail) zodat de lay-out stabiel blijft; gebruik spinners alleen voor inline acties (knoppen).
- **Empty state**: toon altijd icoon + uitleg + CTA wanneer geen data beschikbaar is.

Deze richtlijnen gelden voor alle dashboard-schermen en vormen samen met `Modal`, `Toast` en `EmptyState` het feedbacksysteem.

