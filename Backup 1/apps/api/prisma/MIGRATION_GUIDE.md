# Prisma Migratie Gids - Eerste Setup

Deze gids helpt je bij het uitvoeren van je eerste Prisma migratie met PostgreSQL.

## Stap 1: Database Starten

Start de PostgreSQL database met Docker Compose:

```bash
# Vanuit de root directory
docker-compose up -d
```

Controleer of de database draait:
```bash
docker ps | grep vertrouwdbouwen-postgres
```

## Stap 2: Environment Variables Instellen

Zorg dat je een `.env` bestand hebt in `apps/api/` met de juiste DATABASE_URL:

```env
DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen?schema=public
```

De connection string format:
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

Voor Docker Compose:
- USER: `vertrouwdbouwen`
- PASSWORD: `password`
- HOST: `localhost`
- PORT: `5432`
- DATABASE: `vertrouwdbouwen`

## Stap 3: Dependencies Installeren

Zorg dat alle dependencies geïnstalleerd zijn:

```bash
# Vanuit root directory
npm install

# Of specifiek voor de API
cd apps/api
npm install
```

## Stap 4: Prisma Client Genereren

Genereer de Prisma Client (dit moet altijd eerst):

```bash
cd apps/api
npx prisma generate
```

## Stap 5: Eerste Migratie Uitvoeren

### Optie A: Development Migratie (Aanbevolen)

Dit maakt een nieuwe migratie aan en past deze direct toe:

```bash
cd apps/api
npx prisma migrate dev --name init
```

Dit doet:
1. Maakt een nieuwe migratie aan in `prisma/migrations/`
2. Past de migratie toe op de database
3. Genereert de Prisma Client opnieuw

### Optie B: Production Migratie

Als je alleen de migratie wilt toepassen zonder nieuwe aan te maken:

```bash
cd apps/api
npx prisma migrate deploy
```

## Stap 6: Verificatie

### Controleer Migraties

```bash
cd apps/api
npx prisma migrate status
```

Dit toont welke migraties zijn toegepast.

### Open Prisma Studio

Bekijk je database visueel:

```bash
cd apps/api
npx prisma studio
```

Dit opent een web interface op http://localhost:5555

### Test Database Connectie

```bash
cd apps/api
npx prisma db execute --stdin
```

Of gebruik een PostgreSQL client:
```bash
psql -U vertrouwdbouwen -d vertrouwdbouwen -h localhost
```

## Troubleshooting

### Error: Database bestaat niet

Als de database nog niet bestaat, maak deze aan:

```bash
# Via Docker
docker exec -it vertrouwdbouwen-postgres psql -U vertrouwdbouwen -c "CREATE DATABASE vertrouwdbouwen;"

# Of via psql
psql -U postgres -c "CREATE DATABASE vertrouwdbouwen;"
```

### Error: Connection refused

Controleer of PostgreSQL draait:
```bash
docker ps | grep postgres
docker-compose ps
```

Start opnieuw indien nodig:
```bash
docker-compose up -d
```

### Error: Authentication failed

Controleer je DATABASE_URL in `.env`:
- Username moet overeenkomen met POSTGRES_USER in docker-compose.yml
- Password moet overeenkomen met POSTGRES_PASSWORD

### Error: Schema bestaat al

Als je de migratie opnieuw wilt uitvoeren:

```bash
# Reset database (⚠️ Verwijdert alle data!)
npx prisma migrate reset

# Of verwijder alleen de migratie history
npx prisma migrate resolve --applied "migration_name"
```

### Migratie Status Resetten

Als je de database handmatig hebt aangepast:

```bash
# Markeer alle migraties als toegepast (zonder ze uit te voeren)
npx prisma migrate resolve --applied "init"

# Of reset alles
npx prisma migrate reset
```

## Handige Commands

### Nieuwe Migratie Na Schema Wijziging

```bash
cd apps/api
npx prisma migrate dev --name description_of_change
```

### Migratie Geschiedenis Bekijken

```bash
cd apps/api
ls -la prisma/migrations/
```

### Database Schema Bekijken

```bash
cd apps/api
npx prisma db pull  # Haalt schema op van database
npx prisma db push  # Pusht schema naar database (zonder migratie)
```

### Prisma Client Opnieuw Genereren

```bash
cd apps/api
npx prisma generate
```

## Volgende Stappen

Na de eerste migratie:

1. **Seed Database** (optioneel):
   ```bash
   npx prisma db seed
   ```

2. **Gebruik Prisma Client** in je code:
   ```typescript
   import { prisma } from './config/database';
   
   const users = await prisma.user.findMany();
   ```

3. **Maak nieuwe migraties** bij schema wijzigingen:
   ```bash
   npx prisma migrate dev --name add_new_field
   ```

## Production Deployment

Voor productie:

```bash
# Pas migraties toe zonder interactie
npx prisma migrate deploy

# Genereer Prisma Client
npx prisma generate
```

## Best Practices

1. **Altijd migraties gebruiken** - Nooit handmatig schema aanpassen
2. **Descriptive namen** - Gebruik duidelijke migratie namen
3. **Test lokaal eerst** - Test migraties altijd in development
4. **Backup voor productie** - Maak altijd backup voor productie migraties
5. **Version control** - Commit migraties naar git

