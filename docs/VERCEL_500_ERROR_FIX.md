# 🔧 Vercel 500 Error Fix - Auth Endpoints

## 📋 Probleem

De `/api/auth/register` en `/api/auth/me` endpoints gaven 500 errors met **lege response body** op Vercel, terwijl ze lokaal werkten.

## 🔍 Oorzaak

De 500 errors met lege response werden veroorzaakt door:

1. **Environment variable validatie bij module load**: `env.ts` gooide een error bij het laden van de module als `DATABASE_URL` of `JWT_SECRET` ontbraken. In Vercel serverless omgevingen resulteert dit in een lege 500 error voordat de error handler kan ingrijpen.

2. **Prisma client initialisatie**: Als `DATABASE_URL` ontbrak, faalde Prisma client initialisatie bij module load, wat ook tot lege errors leidde.

3. **Onvoldoende error handling**: Er was geen catch-all voor unhandled promise rejections en uncaught exceptions in de serverless context.

## ✅ Oplossingen

### 1. Environment Variable Validatie (Runtime i.p.v. Module Load)

**Bestand**: `apps/api/src/config/env.ts`

- Verplaatst validatie van module load tijd naar runtime
- Nieuwe `validateEnv()` functie die wordt aangeroepen bij eerste request
- Voorkomt dat serverless functions crashen bij ontbrekende env vars

```typescript
// Voor: Validatie bij module load (crasht serverless)
for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Na: Validatie bij runtime (graceful error handling)
export function validateEnv(): void {
  // Validatie gebeurt nu in middleware
}
```

### 2. Environment Validatie Middleware

**Bestand**: `apps/api/src/app.ts`

- Toegevoegd middleware die `validateEnv()` aanroept bij eerste request
- Retourneert nette JSON error response als env vars ontbreken
- Voorkomt lege 500 errors

### 3. Verbeterde Prisma Client Initialisatie

**Bestand**: `apps/api/src/config/database.ts`

- Lazy initialization met betere error handling
- Validatie dat `DATABASE_URL` bestaat voordat Prisma client wordt aangemaakt
- Duidelijke error messages bij initialisatie fouten

### 4. Process-Level Error Handlers

**Bestand**: `apps/api/api/index.ts`

- Toegevoegd handlers voor `unhandledRejection` en `uncaughtException`
- Logging van errors zonder serverless function te crashen
- Safety net voor onverwachte errors

### 5. Verbeterde Error Handler

**Bestand**: `apps/api/src/middleware/errorHandler.ts`

- Fix voor syntax error (ontbrekende `||` operator)
- Zorgt ervoor dat **altijd** een JSON response wordt teruggestuurd
- Geen lege responses meer, zelfs bij kritieke fouten

## 📝 Wijzigingen Overzicht

### Aangepaste Bestanden

1. **`apps/api/src/config/env.ts`**
   - Validatie verplaatst naar runtime functie `validateEnv()`
   - Geen module load crashes meer

2. **`apps/api/src/app.ts`**
   - Toegevoegd environment validatie middleware
   - Valideert env vars bij eerste request

3. **`apps/api/src/config/database.ts`**
   - Verbeterde Prisma client initialisatie met error handling
   - Lazy initialization pattern
   - Validatie van `DATABASE_URL` voor initialisatie

4. **`apps/api/api/index.ts`**
   - Process-level error handlers toegevoegd
   - Betere logging voor debugging

5. **`apps/api/src/middleware/errorHandler.ts`**
   - Syntax fix (ontbrekende `||` operator)
   - Zorgt voor altijd JSON responses

## 🚀 Vercel Environment Variables

Zorg dat de volgende environment variables zijn ingesteld in Vercel:

### Voor de API (Express backend)

1. **`DATABASE_URL`** (verplicht)
   - Neon PostgreSQL connection string
   - Format: `postgres://USER:PASSWORD@HOST/DB?sslmode=require`

2. **`JWT_SECRET`** (verplicht)
   - Secret key voor JWT token signing
   - Gebruik een lange, willekeurige string

3. **`NODE_ENV`** (optioneel, default: `development`)
   - `production` voor productie

4. **`CORS_ORIGIN`** (optioneel)
   - Frontend URL voor CORS
   - Default: `http://localhost:3000`

### Voor de Web App (Next.js frontend)

1. **`NEXT_PUBLIC_API_URL`** (verplicht in productie)
   - URL naar de Express API backend
   - Bijvoorbeeld: `https://your-api.vercel.app`

2. **`API_BASE_URL`** (optioneel, server-side only)
   - Alternatief voor `NEXT_PUBLIC_API_URL`
   - Wordt gebruikt door Next.js API routes

## 🧪 Testen

### Lokaal Testen

1. **Start de API server**:
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Start de Next.js app**:
   ```bash
   cd apps/web
   npm run dev
   ```

3. **Test registratie**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test1234",
       "role": "CUSTOMER",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

4. **Test auth check**:
   ```bash
   curl http://localhost:3000/api/auth/me \
     -H "Cookie: token=YOUR_TOKEN"
   ```

### Vercel Deployment Testen

1. **Deploy naar Vercel**:
   ```bash
   vercel --prod
   ```

2. **Controleer environment variables** in Vercel dashboard:
   - Project → Settings → Environment Variables

3. **Test endpoints**:
   - `POST https://your-app.vercel.app/api/auth/register`
   - `GET https://your-app.vercel.app/api/auth/me`

4. **Controleer logs**:
   - Vercel Dashboard → Functions → Logs
   - Zoek naar error messages en stack traces

## ✅ Verificatie

Na de fixes zou je moeten zien:

1. ✅ **Geen lege 500 responses meer**
   - Alle errors retourneren JSON met `{ success: false, error: { message: "..." } }`

2. ✅ **Duidelijke error messages**
   - Bij ontbrekende env vars: "Missing required environment variables: DATABASE_URL, JWT_SECRET"
   - Bij database errors: "Database verbindingsfout. Controleer of PostgreSQL draait..."

3. ✅ **Registratie werkt**
   - `POST /api/auth/register` retourneert `201` met user data
   - Geen crashes meer bij database connectie problemen

4. ✅ **Auth check werkt**
   - `GET /api/auth/me` retourneert `200` met user data (als ingelogd)
   - Of `401` met nette error message (als niet ingelogd)

## 🔮 Toekomstige Verbeteringen

1. **Health check endpoint**: Voeg `/api/health` toe om database connectie te testen
2. **Better logging**: Structured logging met correlation IDs voor debugging
3. **Rate limiting**: Voeg rate limiting toe aan auth endpoints
4. **Monitoring**: Integreer error tracking (Sentry, etc.) voor productie

## 📚 Gerelateerde Documentatie

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Prisma Setup](./NEON_PRISMA_SETUP.md)
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_QUICKSTART.md)

