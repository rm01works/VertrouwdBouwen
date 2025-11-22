# Neon + Prisma Setup - VertrouwdBouwen

Deze documentatie beschrijft de volledige setup van Neon PostgreSQL database met Prisma voor het VertrouwdBouwen platform.

## 📋 Overzicht

- **Database Provider**: Neon PostgreSQL (serverless)
- **ORM**: Prisma
- **Deployment**: Vercel (web) + Express API
- **Auth**: Custom auth (geen Neon Auth)

## 🗄️ Database Setup

### Neon Database Aanmaken

1. **Log in op Neon**
   - Ga naar [console.neon.tech](https://console.neon.tech)
   - Maak een account aan of log in

2. **Nieuwe Database Aanmaken**
   - Klik op "Create Project"
   - Kies een projectnaam (bijv. "vertrouwdbouwen")
   - Selecteer regio: **EU (Frankfurt)** of dichtbij Vercel
   - Plan: **Free tier** (voor development) of **Pro** (voor productie)
   - **Belangrijk**: Laat **Neon Auth UIT** staan - we gebruiken alleen de database

3. **Connection String Kopiëren**
   - Na het aanmaken, ga naar "Connection Details"
   - Kopieer de connection string (ziet eruit als):
     ```
     postgres://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```
   - Dit is je `DATABASE_URL`

## 🔧 Environment Variables

### Vercel Setup

1. **Ga naar Vercel Console**
   - Open je project in [vercel.com](https://vercel.com)
   - Ga naar **Settings** → **Environment Variables**

2. **Voeg DATABASE_URL toe**
   - **Name**: `DATABASE_URL`
   - **Value**: De Neon connection string uit stap 3 hierboven
   - **Environment**: Selecteer alle environments (Production, Preview, Development)

3. **Optioneel: SHADOW_DATABASE_URL**
   - Voor Prisma migraties kan een shadow database handig zijn
   - Neon ondersteunt dit automatisch, maar je kunt ook een aparte database aanmaken
   - **Name**: `SHADOW_DATABASE_URL`
   - **Value**: Connection string naar shadow database (of leeg laten voor auto)

4. **Verwijder Oude Database Vars** (indien aanwezig)
   - Verwijder of markeer als deprecated:
     - `DB_HOST`
     - `DB_USER`
     - `DB_PASSWORD`
     - `DB_NAME`
     - Oude `DATABASE_URL` die naar andere database wijst

### Lokale Setup

1. **Synchroniseer Environment Variables**
   ```bash
   cd /path/to/vertrouwdbouwen
   vercel env pull .env.development.local
   ```

2. **Of Maak Handmatig `.env` Bestand**
   Maak een `.env` bestand in `apps/api/`:
   ```env
   DATABASE_URL=postgres://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   SHADOW_DATABASE_URL=  # Optioneel
   ```

3. **Verifieer DATABASE_URL**
   - Controleer dat `DATABASE_URL` correct is ingesteld
   - Test de connectie:
     ```bash
     cd apps/api
     npx prisma db pull
     ```

## 📦 Prisma Configuratie

### Schema Setup

Het Prisma schema (`apps/api/prisma/schema.prisma`) is al geconfigureerd voor Neon:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-arm64-openssl-1.1.x"]
}
```

### Prisma Client Genereren

```bash
cd apps/api
npx prisma generate
```

Dit genereert de Prisma Client op basis van het schema.

## 🚀 Database Migraties

### Eerste Setup (Nieuwe Database)

Als je een nieuwe Neon database hebt zonder schema:

```bash
cd apps/api
npx prisma migrate dev --name init
```

Dit:
- Maakt migratie files aan in `prisma/migrations/`
- Past het schema toe op de Neon database
- Genereert Prisma Client

### Bestaande Migraties Toepassen

Als je al migraties hebt en deze op Neon wilt toepassen:

```bash
cd apps/api
npx prisma migrate deploy
```

Dit past alle migraties toe zonder development-only stappen.

### Nieuwe Migraties Aanmaken

Na schema wijzigingen:

```bash
cd apps/api
npx prisma migrate dev --name description_of_change
```

Bijvoorbeeld:
```bash
npx prisma migrate dev --name add_user_avatar_field
```

## 🔌 Prisma Client Gebruik

### Standaard Prisma Client (Node.js)

Voor Express API routes en server-side code:

```typescript
import { prisma } from '@/config/database';

// Gebruik in services, controllers, etc.
const users = await prisma.user.findMany();
```

**Locatie**: `apps/api/src/config/database.ts`

### Prisma Edge Client (Edge Runtime)

Voor Next.js Edge routes (optioneel, voor toekomstig gebruik):

```typescript
import { prismaEdge } from '@/config/prisma-edge';

// Gebruik alleen in Edge routes
export const runtime = 'edge';

export async function GET() {
  const users = await prismaEdge.user.findMany();
  return Response.json(users);
}
```

**Locatie**: `apps/api/src/config/prisma-edge.ts`

**Belangrijk**: 
- Gebruik `prismaEdge` alleen in Edge runtime context
- Gebruik standaard `prisma` voor alle Express API routes

## 📁 Project Structuur

```
apps/api/
├── prisma/
│   ├── schema.prisma          # Prisma schema definitie
│   ├── migrations/            # Database migraties
│   └── README.md              # Prisma documentatie
├── src/
│   ├── config/
│   │   ├── database.ts        # Standaard Prisma Client (Node.js)
│   │   └── prisma-edge.ts     # Prisma Edge Client (Edge runtime)
│   ├── services/              # Business logic met Prisma queries
│   ├── controllers/           # Request handlers
│   └── routes/                # Express routes
└── scripts/
    ├── create-test-users.ts   # Gebruikt prisma singleton
    └── check-users.ts         # Gebruikt prisma singleton
```

## 🧪 Testing & Verificatie

### 1. Database Connectie Testen

```bash
cd apps/api
npx prisma db pull
```

Als dit werkt, is de connectie succesvol.

### 2. Prisma Studio (Database GUI)

```bash
cd apps/api
npx prisma studio
```

Opent een web interface op http://localhost:5555 om de database te bekijken.

### 3. Test Scripts

```bash
# Testgebruikers aanmaken
cd apps/api
npm run create-test-users

# Controleren of gebruikers bestaan
npm run check-users
```

### 4. API Health Check

Start de API server:

```bash
cd apps/api
npm run dev
```

Test de health endpoint:
```bash
curl http://localhost:5001/api/health
```

Verwacht antwoord:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "database": "connected"
}
```

## 🏗️ Development Workflow

### Nieuwe Feature Toevoegen

1. **Schema Aanpassen**
   - Bewerk `apps/api/prisma/schema.prisma`
   - Voeg nieuwe models/velden toe

2. **Migratie Aanmaken**
   ```bash
   cd apps/api
   npx prisma migrate dev --name add_new_feature
   ```

3. **Prisma Client Regenereren** (automatisch bij migrate dev)
   ```bash
   npx prisma generate
   ```

4. **Code Schrijven**
   - Gebruik `prisma` uit `config/database.ts` in services
   - TypeScript types zijn automatisch beschikbaar

### Bestaande Code Controleren

Alle Prisma-gebruik moet via de singleton gaan:

```typescript
// ✅ GOED
import { prisma } from '@/config/database';

// ❌ FOUT (direct PrismaClient instantie)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

## 🚢 Deployment

### Vercel Deployment

1. **Environment Variables Instellen**
   - Zorg dat `DATABASE_URL` is ingesteld in Vercel
   - Zie sectie "Environment Variables" hierboven

2. **Build Process**
   - Vercel voert automatisch `prisma generate` uit (via postinstall script)
   - Migraties moeten handmatig worden uitgevoerd (zie hieronder)

3. **Migraties in Productie**

   **Optie A: Via Vercel Build Command** (aanbevolen)
   
   Voeg toe aan `package.json` in `apps/api/`:
   ```json
   {
     "scripts": {
       "vercel-build": "prisma generate && prisma migrate deploy && tsc"
     }
   }
   ```

   **Optie B: Handmatig via CLI**
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

4. **Verificatie na Deployment**
   - Test de health endpoint: `https://your-api.vercel.app/api/health`
   - Controleer logs in Vercel dashboard
   - Test auth flows en database operaties

## 🔍 Troubleshooting

### Database Connectie Fouten

**Fout**: `Can't reach database server`

**Oplossing**:
1. Controleer `DATABASE_URL` in environment variables
2. Verifieer dat Neon database actief is
3. Check firewall/network settings
4. Test connectie met `npx prisma db pull`

### Migratie Fouten

**Fout**: `Migration failed` of `Shadow database error`

**Oplossing**:
1. Zorg dat `SHADOW_DATABASE_URL` is ingesteld (of leeg voor auto)
2. Probeer: `npx prisma migrate reset` (⚠️ verwijdert alle data)
3. Of: `npx prisma db push` (voor development, geen migraties)

### Prisma Client Errors

**Fout**: `PrismaClient is not configured`

**Oplossing**:
```bash
cd apps/api
npx prisma generate
```

### Edge Runtime Errors

**Fout**: `Module not found: @neondatabase/serverless`

**Oplossing**:
```bash
cd apps/api
npm install @neondatabase/serverless @prisma/adapter-neon
```

## 📚 Belangrijke Notities

### Neon Auth

- **Neon Auth staat UIT** en wordt bewust niet gebruikt
- Alle authenticatie gebeurt in de applicatie (custom auth systeem)
- Database authenticatie verloopt uitsluitend via `DATABASE_URL` + Prisma

### Shadow Database

- Neon ondersteunt automatisch shadow database voor migraties
- Je kunt `SHADOW_DATABASE_URL` leeg laten
- Of een aparte database aanmaken voor shadow operaties

### Connection Pooling

- Neon biedt automatisch connection pooling
- Gebruik de connection string zoals geleverd door Neon
- Voor hoge traffic, overweeg Neon Pro plan met dedicated pooler

### Security

- **Nooit commit `DATABASE_URL` naar Git**
- Gebruik environment variables altijd
- Rotate database passwords regelmatig
- Gebruik SSL (`sslmode=require`) in connection string

## 🔗 Handige Links

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-neon)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Checklist

- [ ] Neon database aangemaakt (zonder Auth)
- [ ] `DATABASE_URL` ingesteld in Vercel
- [ ] `DATABASE_URL` ingesteld lokaal
- [ ] Prisma schema gecontroleerd
- [ ] `npx prisma generate` uitgevoerd
- [ ] Migraties toegepast (`npx prisma migrate deploy`)
- [ ] Database connectie getest
- [ ] Test scripts werken
- [ ] API health check werkt
- [ ] Deployment naar Vercel succesvol
- [ ] Productie flows getest

---

**Laatste update**: 2024-01-XX
**Versie**: 1.0.0

