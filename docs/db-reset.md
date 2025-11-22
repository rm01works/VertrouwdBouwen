# Database Reset & Migratie Guide

## ⚠️ Belangrijke Veiligheidswaarschuwing

**VOER NOOIT AUTOMATISCH DESTRUCTIEVE ACTIES UIT IN PRODUCTIE!**

Dit document beschrijft hoe je de database kunt resetten en migreren. Alle reset-acties zijn **expliciet gemarkeerd** als:
- ✅ **Veilig voor development/staging**
- ❌ **NOOIT uitvoeren op productie zonder backup**

---

## 📋 Database Reset Scripts

### Development/Staging Reset

**✅ Veilig voor:**
- Lokale PostgreSQL database
- Neon test/staging database
- Development omgevingen

**❌ NOOIT gebruiken voor:**
- Productie database
- Database met belangrijke data

#### Script: `db:reset:dev`

```bash
cd apps/api
npm run db:reset:dev
```

**Wat doet dit:**
- Verwijdert alle data uit de database
- Verwijdert alle tabellen
- Voert alle migraties opnieuw uit
- Genereert Prisma Client opnieuw
- **Slaat seeding over** (gebruik `db:seed` apart)

**⚠️ Waarschuwing:**
- Dit verwijdert **alle data** in de database
- Gebruik alleen op development/staging databases
- Maak een backup voordat je dit uitvoert op een database met data

---

## 🗄️ Database Migraties

### Migraties Status Bekijken

```bash
cd apps/api
npm run db:migrate:status
```

Toont welke migraties zijn toegepast en welke nog pending zijn.

### Nieuwe Migratie Aanmaken

Na schema wijzigingen:

```bash
cd apps/api
npm run db:migrate
# Volg de prompts om een naam te geven aan de migratie
```

Dit:
- Maakt een nieuwe migratie file aan in `prisma/migrations/`
- Past het schema toe op de database
- Genereert Prisma Client

### Migraties Toepassen (Productie)

**Voor productie (Vercel/Neon):**

```bash
cd apps/api
npm run db:migrate:deploy
```

**Wat doet dit:**
- Past alle pending migraties toe zonder development-only stappen
- **Verwijdert geen data**
- Veilig voor productie

**Belangrijk voor Vercel:**
- Voeg dit toe aan je build script of voer handmatig uit na deploy
- Zie [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_QUICKSTART.md)

---

## 🔄 Database Schema Synchroniseren

### Schema Push (Development Only)

**⚠️ Alleen voor development, niet voor productie!**

```bash
cd apps/api
npm run db:push
```

**Wat doet dit:**
- Past schema direct toe zonder migraties
- Handig voor snelle development iteraties
- **Gebruik migraties voor productie**

### Schema Pull (Van Database naar Prisma)

```bash
cd apps/api
npm run db:pull
```

**Wat doet dit:**
- Haalt het huidige database schema op
- Update `schema.prisma` op basis van de database
- Handig als je schema wijzigingen direct in de database hebt gemaakt

---

## 🧪 Database Setup (Eerste Keer)

### Nieuwe Database Setup

```bash
cd apps/api
npm run db:setup
```

**Wat doet dit:**
- Genereert Prisma Client
- Maakt eerste migratie aan (`init`)
- Past schema toe op de database

### Database Seeden (Test Data)

```bash
cd apps/api
npm run db:seed
```

**Notitie:** Zorg dat er een `prisma/seed.ts` bestand bestaat.

---

## 🗄️ Neon Database Reset (STAGING/DEV ONLY)

**⚠️ WAARSCHUWING: Dit verwijdert alle data!**

**ALLEEN UITVOEREN VOOR:**
- Neon test/staging database
- Development databases
- **NOOIT** voor productie zonder backup!

### Stap 1: Backup Maken

**Belangrijk:** Maak altijd eerst een backup!

#### Via Neon Dashboard:
1. Ga naar Neon Dashboard
2. Selecteer je database
3. Klik op **Backup** of gebruik **Export** functionaliteit

#### Via pg_dump (Command Line):
```bash
# Export database naar SQL file
pg_dump "postgres://USER:PASSWORD@HOST/DB?sslmode=require" > backup-$(date +%Y%m%d).sql
```

### Stap 2: Reset Database

```bash
cd apps/api

# ⚠️ ALLEEN VOOR STAGING/DEV - NOOIT PRODUCTIE!
npm run db:reset:dev
```

**Wat gebeurt er:**
1. Alle tabellen worden verwijderd
2. Alle data wordt verwijderd
3. Migraties worden opnieuw uitgevoerd
4. Database is weer in initiële staat

### Stap 3: Verificatie

```bash
# Test database connectie
npm run check-users

# Of test via Prisma Studio
npm run db:studio
```

---

## 🔍 Database Health Check

### Via API Endpoint

```bash
# Test database connectie
curl https://your-api.vercel.app/api/health/db
```

**Response (success):**
```json
{
  "ok": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "urlConfigured": true,
    "queryResult": "success"
  }
}
```

**Response (error):**
```json
{
  "ok": false,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": false,
    "urlConfigured": true,
    "error": {
      "name": "PrismaClientInitializationError",
      "message": "Can't reach database server",
      "type": "connection_error"
    }
  }
}
```

### Via Prisma Studio

```bash
cd apps/api
npm run db:studio
```

Opent een web interface op http://localhost:5555 om de database te bekijken.

---

## 📝 Migratie Best Practices

### 1. Gebruik Migraties voor Productie

✅ **Goed:**
```bash
npm run db:migrate        # Development
npm run db:migrate:deploy # Productie
```

❌ **Slecht:**
```bash
npm run db:push  # Alleen voor development!
```

### 2. Test Migraties Lokaal

Voordat je migraties naar productie deployt:

1. Test lokaal:
   ```bash
   npm run db:migrate
   ```

2. Test met test data:
   ```bash
   npm run db:seed
   ```

3. Verifieer dat alles werkt

### 3. Backup voor Grote Wijzigingen

Voor grote schema wijzigingen:
- Maak een backup van de productie database
- Test de migratie op een staging database
- Deploy pas naar productie na verificatie

---

## 🔧 Troubleshooting

### "Migration failed"

**Oplossing:**
1. Controleer de migratie file in `prisma/migrations/`
2. Test de SQL query handmatig
3. Check voor conflicterende migraties
4. Gebruik `db:migrate:status` om te zien welke migraties zijn toegepast

### "Database connection failed"

**Oplossing:**
1. Controleer `DATABASE_URL` in `.env.local` of Vercel
2. Test connectie met `npm run db:studio`
3. Check Neon dashboard voor database status

### "Schema drift detected"

**Oplossing:**
1. Gebruik `db:pull` om schema te synchroniseren
2. Of gebruik `db:push` (alleen development) om schema direct toe te passen
3. Maak een nieuwe migratie met `db:migrate`

---

## 📚 Gerelateerde Documentatie

- [Environment Variables](./env.md)
- [Neon Prisma Setup](./NEON_PRISMA_SETUP.md)
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_QUICKSTART.md)

