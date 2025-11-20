# ⚡ Snelle Database Setup - VertrouwdBouwen

## ✅ Wat is al gedaan:

1. ✅ `.env` bestand aangemaakt in `apps/api/` met:
   - `DATABASE_URL` (voor PostgreSQL)
   - `JWT_SECRET` (veilige random string)
   - Andere benodigde variabelen

2. ✅ Dependencies geïnstalleerd
3. ✅ Prisma Client gegenereerd

## 🚀 Wat je nu moet doen:

### Stap 1: Installeer Docker (als je dat nog niet hebt)

**macOS:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Installeer en start Docker Desktop
3. Wacht tot Docker volledig opgestart is (groen icoon in menubar)

### Stap 2: Start de Database

**Optie A: Gebruik het verbeterde setup script (aanbevolen):**
```bash
cd /Users/rubenmertz/Documents/Bouwzeker
./scripts/setup-db-improved.sh
```

**Optie B: Handmatig:**
```bash
# Start PostgreSQL container
cd /Users/rubenmertz/Documents/Bouwzeker
docker-compose up -d postgres

# Wacht 10 seconden tot database klaar is
sleep 10

# Voer migraties uit
cd apps/api
npm run db:migrate
```

### Stap 3: Verifieer dat alles werkt

```bash
cd apps/api

# Check migratie status
npm run db:migrate:status

# Start de API server
npm run dev
```

Als de server start zonder errors, is alles klaar! 🎉

### Stap 4: Test Login/Registratie

1. Start de frontend (in een andere terminal):
   ```bash
   cd apps/web
   npm run dev
   ```

2. Ga naar http://localhost:3000
3. Probeer te registreren of in te loggen

---

## 🔍 Troubleshooting

### "Docker command not found"
- Installeer Docker Desktop (zie Stap 1 hierboven)
- Of gebruik lokale PostgreSQL (zie `DATABASE_SETUP.md`)

### "Connection refused" of database errors
```bash
# Check of container draait
docker ps | grep postgres

# Als niet, start opnieuw
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

### "Missing required environment variable"
- Check of `.env` bestand bestaat in `apps/api/`
- Check of `DATABASE_URL` en `JWT_SECRET` zijn ingesteld

### Migratie errors
```bash
cd apps/api

# Reset database (⚠️ verwijdert data)
npm run db:migrate:reset

# Of force push
npm run db:push
```

---

## 📚 Meer informatie

- Volledige setup guide: `DATABASE_SETUP.md`
- Prisma documentatie: `apps/api/prisma/README.md`

---

## ✨ Handige Commands

```bash
# Database beheren
docker-compose up -d postgres    # Start database
docker-compose down              # Stop database
docker-compose logs postgres     # Bekijk logs

# Prisma
cd apps/api
npm run db:studio                # Open database GUI (http://localhost:5555)
npm run db:migrate:status        # Check migratie status
npm run db:generate              # Genereer Prisma Client
```

