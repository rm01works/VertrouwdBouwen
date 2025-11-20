# 🧪 End-to-End Test Plan - VertrouwdBouwen

## Status Check

### ✅ Stap 1: Basis Structuur Verificatie
- [x] `app/layout.tsx` - Root layout aanwezig
- [x] `app/page.tsx` - Homepage aanwezig  
- [x] `app/error.tsx` - Error boundary aanwezig
- [x] `app/loading.tsx` - Loading component aanwezig
- [x] `app/(auth)/login/page.tsx` - Login pagina aanwezig
- [x] `app/(auth)/register/page.tsx` - Register pagina aanwezig
- [x] `app/(dashboard)/layout.tsx` - Dashboard layout aanwezig
- [x] `app/(dashboard)/dashboard/page.tsx` - Dashboard pagina aanwezig

### ✅ Stap 2: Server Status
- [x] Next.js dev server draait (poort 3000)
- [x] API server draait (poort 5002) - Health check: OK
- [x] Database verbinding: Connected

### ⚠️ Stap 3: Chunk Problemen
- [ ] Error chunk wordt niet gevonden door browser
- [ ] Login chunk wordt niet gevonden door browser
- [ ] Mogelijk probleem: Dev server moet opnieuw worden gestart

## Test Procedures

### Test 1: Homepage Load
1. Open `http://localhost:3000`
2. **Verwacht**: Homepage laadt zonder errors
3. **Controleer**: Geen 404's in console
4. **Controleer**: Semi-dark theme wordt getoond

### Test 2: Navigatie naar Login
1. Klik op "Inloggen" in header
2. **Verwacht**: Navigatie naar `/login` zonder errors
3. **Controleer**: Login formulier wordt getoond
4. **Controleer**: Geen chunk 404's in console

### Test 3: Navigatie naar Register
1. Klik op "Registreren" in header
2. **Verwacht**: Navigatie naar `/register` zonder errors
3. **Controleer**: Registratie formulier wordt getoond
4. **Controleer**: Geen chunk 404's in console

### Test 4: Registratie Flow (End-to-End)
1. Ga naar `/register`
2. Vul formulier in:
   - Email: `test@example.com`
   - Wachtwoord: `Test123!`
   - Voornaam: `Test`
   - Achternaam: `User`
   - Rol: `CUSTOMER`
3. Klik "Registreren"
4. **Verwacht**: 
   - Success toast verschijnt
   - Redirect naar `/dashboard`
   - Gebruiker is ingelogd
5. **Controleer**: API call naar `/api/auth/register` is succesvol
6. **Controleer**: Cookie wordt gezet

### Test 5: Login Flow (End-to-End)
1. Log eerst uit (als ingelogd)
2. Ga naar `/login`
3. Vul in:
   - Email: `test@example.com`
   - Wachtwoord: `Test123!`
4. Klik "Inloggen"
5. **Verwacht**:
   - Success toast verschijnt
   - Redirect naar `/dashboard`
   - Gebruiker is ingelogd
6. **Controleer**: API call naar `/api/auth/login` is succesvol
7. **Controleer**: Cookie wordt gezet

### Test 6: Dashboard Access
1. Na succesvolle login
2. **Verwacht**: Dashboard laadt
3. **Controleer**: Project overzicht wordt getoond
4. **Controleer**: Gebruiker info wordt getoond

## Probleem Oplossing

### Chunk 404 Errors
**Oorzaak**: Next.js chunks worden niet correct gegenereerd of geserveerd

**Oplossing**:
1. Stop de dev server (Ctrl+C)
2. Verwijder `.next` map: `rm -rf apps/web/.next`
3. Herstart dev server: `cd apps/web && npm run dev`
4. Hard refresh browser (Ctrl+Shift+R of Cmd+Shift+R)

### API Connectiviteit
**Test**: `curl http://localhost:5002/api/health`
**Verwacht**: `{"status":"ok","database":"connected"}`

### Error Component
**Check**: `app/error.tsx` moet `'use client'` hebben
**Check**: Component moet correct geëxporteerd worden als default

## Debug Commands

```bash
# Check dev server
ps aux | grep "next dev"

# Check API server  
ps aux | grep "node.*5002"

# Test API health
curl http://localhost:5002/api/health

# Check chunks
ls -la apps/web/.next/static/chunks/app/

# Clear cache en restart
cd apps/web && rm -rf .next && npm run dev
```

