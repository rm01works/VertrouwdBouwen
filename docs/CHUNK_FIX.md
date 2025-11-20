# 🔧 Fix voor Next.js Chunk 404 Errors

## Probleem
Next.js chunks worden niet gevonden, resulterend in 404 errors:
- `main-app.js`
- `app-pages-internals.js`
- `app/(auth)/login/page.js`
- `app/error.js`

## Oorzaak
De `.next` build cache is incompleet of corrupt. Next.js genereert chunks dynamisch in dev mode, maar deze worden niet correct gegenereerd.

## Oplossing

### Stap 1: Stop alle Next.js processen
```bash
# Zoek en stop Next.js processen
pkill -f "next dev"
# Of stop handmatig in de terminal waar next dev draait (Ctrl+C)
```

### Stap 2: Verwijder build cache
```bash
cd apps/web
rm -rf .next
rm -rf node_modules/.cache
```

### Stap 3: Herstart dev server
```bash
cd apps/web
npm run dev
```

**WACHT** tot je ziet:
```
✓ Ready in X seconds
○ Compiling / ...
```

### Stap 4: Hard refresh browser
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Stap 5: Controleer chunks
Open browser console en controleer of er nog 404 errors zijn.

## Alternatieve Oplossing: Production Build Test

Als dev mode niet werkt, test met production build:

```bash
cd apps/web
rm -rf .next
npm run build
npm run start
```

Dit genereert alle chunks correct. Als dit werkt, is het probleem specifiek aan dev mode.

## Debugging

### Check of chunks worden gegenereerd:
```bash
cd apps/web
ls -la .next/static/chunks/app/
```

### Check Next.js logs:
Kijk in de terminal waar `next dev` draait voor compile errors.

### Check browser console:
Open DevTools → Network tab → Filter op "chunks" → Kijk welke requests falen.

## Mogelijke Oorzaken

1. **Incomplete build**: `.next` map werd onderbroken tijdens generatie
2. **Port conflict**: Andere service gebruikt poort 3000
3. **Cache probleem**: Browser cache is corrupt
4. **Next.js versie**: Mogelijk incompatibiliteit

## Verificatie

Na herstart zou je moeten zien:
- ✅ Geen 404 errors in console
- ✅ Homepage laadt correct
- ✅ Login pagina laadt correct
- ✅ Alle chunks worden succesvol geladen

