# 🔧 Fix: Next.js Chunk 404 Errors

## Probleem
Browser probeert chunks te laden maar krijgt 404:
- `main-app.js`
- `app-pages-internals.js`  
- `app/(auth)/login/page.js`
- `app/error.js`

## Oorzaak
Next.js genereert chunks dynamisch in dev mode. De `.next` map is incompleet of de dev server heeft de chunks niet correct gegenereerd.

## ✅ Oplossing (Stap voor Stap)

### Stap 1: Stop de dev server
In de terminal waar `next dev` draait:
- Druk op `Ctrl+C` (of `Cmd+C` op Mac)
- Wacht tot het proces volledig is gestopt

### Stap 2: Verwijder build cache
```bash
cd /Users/rubenmertz/Documents/Bouwzeker/apps/web
rm -rf .next
rm -rf node_modules/.cache
```

### Stap 3: Herstart dev server
```bash
npm run dev
```

**BELANGRIJK**: Wacht tot je ziet:
```
✓ Ready in X.Xs
○ Compiling / ...
✓ Compiled / in X.Xs
```

### Stap 4: Test in browser
1. Open `http://localhost:3000`
2. **Hard refresh**: 
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`
3. Open DevTools (F12) → Network tab
4. Controleer of chunks nu succesvol laden (status 200)

### Stap 5: Test login/register flow
1. Ga naar `/login`
2. Controleer console voor errors
3. Test registratie flow
4. Test login flow

## Verificatie

Na herstart zou je moeten zien:
- ✅ Geen 404 errors in Network tab
- ✅ Chunks laden met status 200
- ✅ Homepage laadt correct
- ✅ Login pagina laadt correct
- ✅ Geen "Missing required error components" melding

## Als het nog steeds niet werkt

### Optie 1: Production build testen
```bash
cd apps/web
rm -rf .next
npm run build
npm run start
```
Als dit werkt, is het probleem specifiek aan dev mode.

### Optie 2: Check Next.js versie
```bash
cd apps/web
npm list next
```
Zorg dat je Next.js 14.0.4 of hoger hebt.

### Optie 3: Reinstall dependencies
```bash
cd apps/web
rm -rf node_modules .next
npm install
npm run dev
```

## Debug Info

**Huidige status:**
- ✅ Alle App Router bestanden aanwezig
- ✅ Error component correct geconfigureerd
- ✅ Layout correct geconfigureerd
- ⚠️ Chunks worden niet gegenereerd door dev server

**Volgende actie:**
Herstart de dev server na het verwijderen van `.next` map.

