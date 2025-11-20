# 🗄️ Database Setup Guide - VertrouwdBouwen

Deze guide helpt je om de PostgreSQL database lokaal op te zetten voor het VertrouwdBouwen project.

## 📋 Vereisten

Je hebt **twee opties** om PostgreSQL te draaien:

### Optie 1: Docker (Aanbevolen) 🐳
- Docker Desktop geïnstalleerd
- Docker Compose beschikbaar

### Optie 2: Lokale PostgreSQL
- PostgreSQL 15+ geïnstalleerd
- PostgreSQL service draait

---

## 🚀 Optie 1: Setup met Docker (Aanbevolen)

### Stap 1: Installeer Docker Desktop

**macOS:**
```bash
# Download en installeer Docker Desktop van:
# https://www.docker.com/products/docker-desktop/
```

Na installatie, start Docker Desktop en wacht tot het volledig opgestart is.

### Stap 2: Start PostgreSQL Container

```bash
# Vanuit de root directory van het project
cd /Users/rubenmertz/Documents/Bouwzeker
docker-compose up -d postgres
```

Dit start een PostgreSQL container met:
- **Database naam**: `vertrouwdbouwen`
- **Gebruiker**: `vertrouwdbouwen`
- **Wachtwoord**: `password`
- **Port**: `5432`

### Stap 3: Verifieer dat Database Draait

```bash
# Check of container draait
docker ps | grep postgres

# Of test de verbinding
docker exec -it vertrouwdbouwen-postgres psql -U vertrouwdbouwen -d vertrouwdbouwen -c "SELECT version();"
```

### Stap 4: Setup Prisma

```bash
# Ga naar de API directory
cd apps/api

# Installeer dependencies (als nog niet gedaan)
npm install

# Genereer Prisma Client
npm run db:generate

# Voer database migraties uit
npm run db:migrate
```

### Stap 5: Verifieer Setup

```bash
# Open Prisma Studio om de database te bekijken
npm run db:studio
```

Dit opent een web interface op http://localhost:5555

---

## 🖥️ Optie 2: Lokale PostgreSQL Setup

### Stap 1: Installeer PostgreSQL

**macOS (met Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Of download van:**
https://www.postgresql.org/download/macosx/

### Stap 2: Maak Database en Gebruiker

```bash
# Start PostgreSQL CLI
psql postgres

# In de PostgreSQL CLI, voer uit:
CREATE DATABASE vertrouwdbouwen;
CREATE USER vertrouwdbouwen WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE vertrouwdbouwen TO vertrouwdbouwen;
\q
```

### Stap 3: Update .env Bestand

Pas het `.env` bestand aan in `apps/api/.env`:

```env
DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen?schema=public
```

### Stap 4: Setup Prisma

```bash
# Ga naar de API directory
cd apps/api

# Installeer dependencies (als nog niet gedaan)
npm install

# Genereer Prisma Client
npm run db:generate

# Voer database migraties uit
npm run db:migrate
```

---

## ✅ Verificatie

### Test Database Verbinding

```bash
cd apps/api

# Check migratie status
npm run db:migrate:status

# Open Prisma Studio
npm run db:studio
```

### Test API Server

```bash
cd apps/api
npm run dev
```

De server zou moeten starten op http://localhost:5000 zonder database errors.

---

## 🔧 Troubleshooting

### Probleem: "Connection refused" of "Database does not exist"

**Oplossing:**
1. Check of PostgreSQL draait:
   ```bash
   # Docker
   docker ps | grep postgres
   
   # Lokaal
   brew services list | grep postgresql
   ```

2. Check of de database bestaat:
   ```bash
   # Docker
   docker exec -it vertrouwdbouwen-postgres psql -U vertrouwdbouwen -l
   
   # Lokaal
   psql -U vertrouwdbouwen -l
   ```

### Probleem: "Missing required environment variable: DATABASE_URL"

**Oplossing:**
- Zorg dat `.env` bestand bestaat in `apps/api/`
- Check of `DATABASE_URL` correct is ingesteld
- Herstart de server na wijzigingen

### Probleem: "Migration failed" of "Schema out of sync"

**Oplossing:**
```bash
cd apps/api

# Reset database (⚠️ verwijdert alle data!)
npm run db:migrate:reset

# Of force push schema
npm run db:push
```

### Probleem: Docker niet beschikbaar

**Oplossing:**
- Installeer Docker Desktop: https://www.docker.com/products/docker-desktop/
- Of gebruik lokale PostgreSQL (Optie 2)

---

## 📝 Handige Commands

```bash
# Vanuit apps/api directory

# Database migraties
npm run db:migrate              # Nieuwe migratie maken
npm run db:migrate:status       # Status bekijken
npm run db:migrate:reset        # Reset database (⚠️ verwijdert data)

# Prisma
npm run db:generate             # Genereer Prisma Client
npm run db:studio               # Open database GUI
npm run db:push                 # Push schema zonder migratie

# Docker
docker-compose up -d postgres   # Start database
docker-compose down             # Stop database
docker-compose logs postgres    # Bekijk logs
```

---

## 🎯 Volgende Stappen

Na succesvolle database setup:

1. ✅ Database draait
2. ✅ Prisma Client gegenereerd
3. ✅ Migraties uitgevoerd
4. 🔄 Test login/registratie in de frontend
5. 🔄 Maak test gebruikers (optioneel): `npm run create-test-users`

---

## 📚 Meer Informatie

- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

