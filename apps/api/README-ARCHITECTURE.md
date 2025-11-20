# Backend API - Architectuur Documentatie

## Overzicht

De backend API is een Express.js applicatie geschreven in TypeScript die:
- PostgreSQL database gebruikt via Prisma ORM
- JWT-gebaseerde authenticatie implementeert
- RESTful API endpoints aanbiedt voor het VertrouwdBouwen escrow platform

## Project Structuur

```
apps/api/
├── src/
│   ├── config/          # Configuratie modules
│   │   ├── database.ts  # Database configuratie (Prisma client)
│   │   └── env.ts       # Environment variables configuratie
│   ├── controllers/     # Request handlers (business logic)
│   ├── middleware/      # Express middleware (auth, error handling, validation)
│   ├── routes/          # API route definities
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functies
│   ├── app.ts           # Express app configuratie
│   └── server.ts        # Server startup en database connectie
├── prisma/
│   ├── schema.prisma    # Database schema definitie
│   └── migrations/      # Database migraties
└── scripts/             # Utility scripts (test users, etc.)
```

## Database Configuratie

### Lokale Ontwikkeling

De database configuratie ondersteunt twee methoden:

**Methode 1: DATABASE_URL (aanbevolen)**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/vertrouwdbouwen?schema=public
```

**Methode 2: Losse DB_* variabelen**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=vertrouwdbouwen
DB_SCHEMA=public
```

### Kubernetes/Productie

Voor productie in Kubernetes, gebruik de service name als host:

```env
# Optie 1: DATABASE_URL met service name
DATABASE_URL=postgresql://user:password@my-database-service.default.svc.cluster.local:5432/vertrouwdbouwen?schema=public

# Optie 2: Losse variabelen
DB_HOST=my-database-service.default.svc.cluster.local
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=vertrouwdbouwen
DB_SCHEMA=public
```

De configuratie module (`src/config/database.ts`) bouwt automatisch de `DATABASE_URL` uit losse variabelen als `DATABASE_URL` niet gezet is.

## CORS Configuratie

CORS is geconfigureerd om meerdere origins te ondersteunen:

### Lokale Ontwikkeling

Standaard toegestane origins (als `CORS_ORIGIN` niet gezet is):
- `http://localhost:3000` (Next.js default)
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternatief)

### Productie

In productie MOET `CORS_ORIGIN` gezet zijn:

```env
# Enkele origin
CORS_ORIGIN=https://your-site.netlify.app

# Meerdere origins (comma-separated)
CORS_ORIGIN=https://your-site.netlify.app,https://staging.your-site.netlify.app
```

**Belangrijk**: Wildcard (`*`) is niet toegestaan in productie voor veiligheidsredenen.

## Environment Variables

### Verplichte Variabelen

- `JWT_SECRET`: Secret voor JWT token signing (genereer met `openssl rand -base64 32`)
- Database configuratie: `DATABASE_URL` OF alle `DB_*` variabelen

### Optionele Variabelen

- `PORT`: Server port (default: `5001`)
- `NODE_ENV`: Environment mode (default: `development`)
- `JWT_EXPIRES_IN`: JWT expiration tijd (default: `7d`)
- `CORS_ORIGIN`: Toegestane CORS origins (default: lokale dev origins)

## Server Startup

De server:
1. Laadt environment variables via `dotenv`
2. Initialiseert Prisma client met database configuratie
3. Test database connectie
4. Start Express server op geconfigureerde port
5. Configureert CORS voor toegestane origins

## API Routes

Alle routes zijn geprefixed met `/api`:

- `/api/auth/*` - Authenticatie endpoints (login, register, me)
- `/api/projects/*` - Project management
- `/api/milestones/*` - Milestone management
- `/api/payments/*` - Escrow payment endpoints
- `/api/users/*` - User management

## Authenticatie

Authenticatie gebruikt JWT tokens die worden opgeslagen in httpOnly cookies:
- Tokens worden automatisch meegestuurd met requests (via cookies)
- `auth` middleware valideert tokens voor beschermde routes
- Tokens verlopen na `JWT_EXPIRES_IN` (default: 7 dagen)

## Database Migraties

Gebruik Prisma Migrate voor database schema wijzigingen:

```bash
# Development: maak nieuwe migratie en pas toe
npm run db:migrate

# Production: pas bestaande migraties toe
npm run db:migrate:deploy

# Status checken
npm run db:migrate:status
```

## Best Practices

1. **Database**: Gebruik altijd Prisma Client, nooit direct SQL queries
2. **Error Handling**: Gebruik de `errorHandler` middleware voor consistente error responses
3. **Validation**: Gebruik `express-validator` voor request validatie
4. **Security**: Valideer altijd user input, gebruik parameterized queries (Prisma doet dit automatisch)
5. **Logging**: Log errors en belangrijke events, maar geen gevoelige data

## Troubleshooting

### Database Connectie Problemen

1. Check of PostgreSQL draait: `psql -U postgres -c "\l"`
2. Verifieer `DATABASE_URL` of `DB_*` variabelen
3. Test connectie handmatig: `psql -U USER -d DATABASE -h HOST`
4. Check firewall/network toegang (voor Kubernetes)

### CORS Errors

1. Verifieer dat `CORS_ORIGIN` de juiste frontend URL bevat
2. Check of `credentials: true` is ingesteld (is al geconfigureerd)
3. Controleer browser console voor specifieke CORS errors

### JWT Errors

1. Verifieer dat `JWT_SECRET` is ingesteld en consistent is
2. Check token expiration tijd
3. Verifieer dat cookies correct worden doorgestuurd (httpOnly, sameSite)

