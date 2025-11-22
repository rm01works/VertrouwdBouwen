# Dev Server Fix - 404 Errors Oplossing

## Probleem
- Landingpage geeft 404
- Chunks worden niet gevonden (404 errors)
- `GET http://localhost:3000/_next/static/chunks/main-app.js 404`

## Root Cause
**Meerdere Next.js dev servers draaien tegelijkertijd op verschillende poorten:**
- Poort 3000: Oude/corrupte server
- Poort 3001: Nieuwe server probeert te starten
- Poort 3002: Nog een server

Dit veroorzaakt:
- Conflicterende chunk generation
- Verkeerde routing
- 404 errors voor chunks

## Oplossing

### Stap 1: Stop alle Next.js processen
```bash
# Stop alle Next.js dev servers
pkill -9 -f "next dev"

# Of specifiek per poort:
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### Stap 2: Clean build directory
```bash
cd apps/web
rm -rf .next
```

### Stap 3: Start schone dev server
```bash
npm run dev
```

### Stap 4: Verifieer
- Check dat server draait op poort 3000
- Test http://localhost:3000/ in browser
- Check browser console voor errors

## Preventie

### Script om altijd schoon te starten:
```bash
#!/bin/bash
# clean-dev.sh
cd apps/web
pkill -9 -f "next dev" 2>/dev/null
rm -rf .next
npm run dev
```

### Of voeg toe aan package.json:
```json
{
  "scripts": {
    "dev:clean": "rm -rf .next && npm run dev"
  }
}
```

## Troubleshooting

### Als poort nog steeds bezet is:
```bash
# Check welke processen poort 3000 gebruiken
lsof -i:3000

# Kill specifiek proces
kill -9 <PID>
```

### Als chunks nog steeds 404 geven:
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Check dat er maar 1 Next.js proces draait
4. Restart dev server

### Als problemen blijven:
```bash
# Volledige clean
cd apps/web
rm -rf .next node_modules/.cache
npm run dev
```

