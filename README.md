# VertrouwdBouwen - Escrow Platform

Een Nederlands escrow platform voor het verbinden van klanten met aannemers voor bouwprojecten.

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
- Docker & Docker Compose (voor PostgreSQL)

### Installatie

1. Clone het project en installeer dependencies:
```bash
npm install
```

2. Kopieer `.env.example` naar `.env.local`:
```bash
cp .env.example .env.local
```

3. Start PostgreSQL database:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. (Optioneel) Seed de database:
```bash
npm run db:seed
```

6. Start development servers:
```bash
npm run dev
```

Dit start zowel de frontend (http://localhost:3000) als backend (http://localhost:5000).

## Scripts

- `npm run dev` - Start frontend en backend in development mode
- `npm run build` - Build alle packages en apps
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed de database met test data
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run linter op alle packages
- `npm run clean` - Clean alle build artifacts en node_modules

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

Zie [ARCHITECTURE.md](./ARCHITECTURE.md) voor gedetailleerde architectuur documentatie.

## Licentie

Private project

