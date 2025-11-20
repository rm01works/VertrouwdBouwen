# VertrouwdBouwen - Escrow Platform

Een Nederlands escrow platform voor het verbinden van klanten met aannemers voor bouwprojecten.

![gemaakt door ruben!!!](Bouwzeker.png)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Monorepo**: npm workspaces

## Project Structuur

```
vertrouwdbouwen/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend
├── packages/
│   └── shared/       # Gedeelde types en utilities
└── scripts/          # Utility scripts
```

## Setup

### Vereisten

- Node.js 18+
- npm 9+
- Docker Desktop + Docker Compose (voor PostgreSQL)
- OpenSSL (wordt gebruikt door het setup script om secrets te genereren)

### 1. Installeer dependencies

```bash
npm install
```

### 2. Stel environment variables in

**Backend (`apps/api/.env`):**

```
DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen?schema=public
JWT_SECRET=vervang_met_een_veilige_random_string
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend (`apps/web/.env.local`):**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> Tip: je kunt `./scripts/setup-db-improved.sh` draaien om automatisch een `.env` voor `apps/api` te genereren (inclusief een random `JWT_SECRET`).

### 3. Start en initialiseert de database

**Optie A – snelle setup (aanbevolen):**

```bash
./scripts/setup-db-improved.sh
```

Het script:
- checkt of Docker draait
- start de PostgreSQL container (`vertrouwdbouwen-postgres`)
- maakt (indien nodig) `apps/api/.env`
- installeert API dependencies
- draait `prisma generate` en `prisma migrate dev`

**Optie B – handmatig:**

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Voer migraties uit vanuit de API app
cd apps/api
npm install         # alleen nodig bij de eerste keer
npm run db:migrate
```

### 4. (Optioneel) Seed data en check status

```bash
cd apps/api
npm run db:seed             # voeg test users/projecten toe
npm run db:migrate:status   # controleer migratie status
npm run db:studio           # open Prisma Studio (http://localhost:5555)
```

### 5. Start de development servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000 (via Express)

Gebruik `npm run dev:web` of `npm run dev:api` als je slechts één van de apps wilt draaien.

## Scripts

- `npm run dev` - Start frontend en backend (concurrently)
- `npm run dev:web` / `npm run dev:api` - Start slechts één van de apps
- `npm run build` - Build alle packages en apps
- `npm run db:migrate` - Run Prisma migraties (API workspace)
- `npm run db:seed` - Seed de database met test data
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` / `npm run type-check` - Code kwaliteit
- `npm run clean` - Verwijder node_modules en build artifacts
- `./scripts/setup-db-improved.sh` - Volledige database setup
- `./scripts/test-escrow-flow.sh` - Simuleer een escrow happy-path
- `./scripts/reset-and-test.sh` - Reset database en draaien van basistests

## Development

### Frontend (apps/web)
- Next.js app op http://localhost:3000
- Hot reload enabled

### Backend (apps/api)
- Express API op http://localhost:5000
- TypeScript met hot reload

### Database
- PostgreSQL op localhost:5432
- Gebruik Prisma Studio voor database management: `npm run db:studio`

## Architectuur

Zie [ARCHITECTURE.md](./ARCHITECTURE.md) voor gedetailleerde architectuur documentatie en [DATABASE_SETUP.md](./DATABASE_SETUP.md) + [QUICK_DATABASE_SETUP.md](./QUICK_DATABASE_SETUP.md) voor uitgebreidere instructies rond PostgreSQL/Prisma.

## Licentie

Private project

