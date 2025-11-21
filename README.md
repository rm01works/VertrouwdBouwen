# VertrouwdBouwen - Escrow Platform

Een Nederlands escrow platform voor het verbinden van klanten met aannemers voor bouwprojecten.

![gemaakt door ruben!!!](Bouwzeker.png)

## 📋 Project Overview

VertrouwdBouwen is een monorepo applicatie die een escrow-platform biedt voor bouwprojecten. Het platform faciliteert de verbinding tussen klanten (die projecten willen uitvoeren) en aannemers (die projecten kunnen accepteren en uitvoeren). Het systeem beheert projecten, milestones, escrow-betalingen en goedkeuringsworkflows.

### High-Level Architectuur

```
┌─────────────────┐
│   Next.js App   │  (Frontend - Port 3000)
│   (Client)      │
└────────┬────────┘
         │ HTTP/REST (via Next.js API proxy)
         │
┌────────▼────────┐
│  Express API    │  (Backend - Port 5001)
│  (Server)       │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │  (Database - Port 5432)
│   (Database)    │
└─────────────────┘
```

**Componenten:**
- **Frontend**: Next.js 14+ App Router applicatie (`apps/web`)
- **Backend**: Express.js REST API (`apps/api`)
- **Database**: PostgreSQL met Prisma ORM
- **Shared**: Gedeelde TypeScript types en constanten (`packages/shared`)

---

## 📁 Monorepo Structuur

```
vertrouwdbouwen/
├── apps/
│   ├── web/                    # Next.js frontend applicatie
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Authenticatie routes (login, register)
│   │   │   ├── (dashboard)/    # Dashboard routes (beschermd)
│   │   │   └── api/            # Next.js API proxy routes
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts (Auth, Theme)
│   │   ├── lib/                # Frontend utilities en API clients
│   │   └── middleware.ts       # Next.js middleware voor auth
│   │
│   └── api/                    # Express.js backend API
│       ├── src/
│       │   ├── app.ts          # Express app setup
│       │   ├── server.ts       # Server entry point
│       │   ├── config/         # Configuratie (env, database)
│       │   ├── controllers/    # Request handlers
│       │   ├── services/       # Business logic
│       │   ├── routes/         # API route definities
│       │   ├── middleware/     # Express middleware (auth, error handling)
│       │   └── utils/          # Utilities (JWT, bcrypt, logger)
│       └── prisma/             # Prisma schema en migraties
│
├── packages/
│   └── shared/                 # Gedeelde code tussen frontend en backend
│       └── src/
│           ├── types/          # TypeScript types
│           ├── constants/      # Gedeelde constanten (roles, statuses)
│           └── utils/          # Gedeelde utilities
│
├── scripts/                    # Utility scripts
│   ├── setup-db-improved.sh    # Database setup script
│   ├── test-escrow-flow.sh     # Escrow flow test script
│   └── reset-and-test.sh       # Reset en test script
│
├── docs/                        # Documentatie
│   ├── ARCHITECTURE.md         # Gedetailleerde architectuur
│   ├── _outdated/              # Verouderde documentatie (niet meer leidend)
│   └── ...
│
├── docker-compose.yml          # PostgreSQL container configuratie
├── helm/                       # Kubernetes Helm charts
└── package.json                # Root workspace configuratie
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: React 18, Tailwind CSS
- **State Management**: React Context API (Auth, Theme)
- **API Client**: Custom fetch wrapper met JWT token handling

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit

### Database
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate

### Infrastructure & Tooling
- **Monorepo**: npm workspaces
- **Containerization**: Docker, Docker Compose
- **Deployment**: 
  - Frontend: Netlify (via `netlify.toml`)
  - Backend: Kubernetes (via Helm charts in `helm/`)
- **Package Manager**: npm

---

## 🚀 Getting Started (Development)

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Docker Desktop**: Voor PostgreSQL container (of lokale PostgreSQL installatie)
- **OpenSSL**: Voor secret generatie in setup scripts

### 1. Installeer Dependencies

```bash
# Vanuit root directory
npm install
```

Dit installeert dependencies voor alle workspaces (apps/web, apps/api, packages/shared).

### 2. Stel Environment Variables In

#### Backend (`apps/api/.env`)

Maak een `.env` bestand in `apps/api/` met de volgende variabelen:

```env
# Database
DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen?schema=public

# JWT Authentication
JWT_SECRET=<veilige-random-string>
JWT_EXPIRES_IN=7d

# Server
PORT=5001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

> **Tip**: Je kunt `./scripts/setup-db-improved.sh` gebruiken om automatisch een `.env` bestand te genereren inclusief een random `JWT_SECRET`.

#### Frontend (`apps/web/.env.local`)

Maak een `.env.local` bestand in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

**Let op**: De frontend gebruikt `NEXT_PUBLIC_API_URL` om te verbinden met de backend. In development is dit `http://localhost:5001`.

### 3. Database Setup

#### Optie A: Automatische Setup (Aanbevolen)

```bash
./scripts/setup-db-improved.sh
```

Dit script:
- Controleert of Docker draait
- Start de PostgreSQL container (`vertrouwdbouwen-postgres`)
- Maakt (indien nodig) `apps/api/.env` met random `JWT_SECRET`
- Installeert API dependencies
- Genereert Prisma Client
- Voert database migraties uit

#### Optie B: Handmatige Setup

```bash
# 1. Start PostgreSQL container
docker-compose up -d postgres

# 2. Wacht tot database klaar is (10 seconden)
sleep 10

# 3. Voer migraties uit
cd apps/api
npm run db:migrate
```

### 4. (Optioneel) Seed Database

```bash
cd apps/api
npm run db:seed
```

Dit voegt test gebruikers en projecten toe aan de database.

### 5. Start Development Servers

#### Optie A: Start Alles Tegelijk (Aanbevolen)

```bash
# Vanuit root directory
npm run dev
```

Dit start zowel frontend als backend met `concurrently`.

#### Optie B: Start Apart

**Terminal 1 - Backend:**
```bash
npm run dev:api
# Of: cd apps/api && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:web
# Of: cd apps/web && npm run dev
```

### 6. Verifieer Setup

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/api/health
- **Prisma Studio**: `cd apps/api && npm run db:studio` (opent op http://localhost:5555)

---

## 🔧 Development Scripts

### Root Level Scripts

```bash
# Development
npm run dev              # Start frontend + backend (concurrently)
npm run dev:web         # Start alleen frontend
npm run dev:api         # Start alleen backend

# Build
npm run build           # Build alle packages en apps
npm run build:web       # Build alleen frontend
npm run build:api       # Build alleen backend

# Database (via API workspace)
npm run db:migrate      # Voer Prisma migraties uit
npm run db:seed         # Seed database met test data
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Lint alle workspaces
npm run type-check      # Type check alle workspaces

# Cleanup
npm run clean           # Verwijder node_modules en build artifacts
```

### API Scripts (`apps/api`)

```bash
cd apps/api

# Database
npm run db:migrate              # Nieuwe migratie maken
npm run db:migrate:status       # Status bekijken
npm run db:migrate:reset        # Reset database (⚠️ verwijdert data)
npm run db:generate             # Genereer Prisma Client
npm run db:studio               # Open database GUI
npm run db:seed                 # Seed database

# Development
npm run dev                     # Start dev server (tsx watch)
npm run build                   # Build TypeScript
npm run start                   # Start production server
```

### Frontend Scripts (`apps/web`)

```bash
cd apps/web

npm run dev                     # Start Next.js dev server
npm run build                   # Build voor productie
npm run start                   # Start production server
npm run lint                    # Lint code
npm run type-check              # TypeScript type check
```

---

## 🌐 Environment Variables

### Backend (`apps/api/.env`)

| Variabele | Beschrijving | Voorbeeld | Verplicht |
|-----------|--------------|-----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db?schema=public` | ✅ Ja |
| `JWT_SECRET` | Secret voor JWT token signing | `random-secure-string` | ✅ Ja |
| `JWT_EXPIRES_IN` | JWT token expiry tijd | `7d` | ❌ Nee (default: `7d`) |
| `PORT` | Server poort | `5001` | ❌ Nee (default: `5001`) |
| `NODE_ENV` | Environment mode | `development` / `production` | ❌ Nee (default: `development`) |
| `CORS_ORIGIN` | Toegestane CORS origins (comma-separated) | `http://localhost:3000` | ❌ Nee (default: `http://localhost:3000`) |

**Database URL Alternatief**: De backend ondersteunt ook losse `DB_*` variabelen voor Kubernetes deployments:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SCHEMA`

### Frontend (`apps/web/.env.local`)

| Variabele | Beschrijving | Voorbeeld | Verplicht |
|-----------|--------------|-----------|-----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5001` | ✅ Ja (productie) |

**Let op**: `NEXT_PUBLIC_*` variabelen zijn zichtbaar in de browser. Gebruik geen secrets hierin.

---

## 🏗️ Architectuur & Domein

### Belangrijkste Domein-Entiteiten

1. **User** (Gebruiker)
   - Rollen: `CUSTOMER`, `CONTRACTOR`, `ADMIN`
   - Authenticatie via JWT tokens
   - Klanten kunnen projecten aanmaken, aannemers kunnen projecten accepteren

2. **Project** (Project)
   - Verbindt een klant met een aannemer
   - Status flow: `DRAFT` → `PENDING_CONTRACTOR` → `ACTIVE` → `IN_PROGRESS` → `COMPLETED`
   - Bevat meerdere milestones

3. **Milestone** (Mijlpaal)
   - Project fase met specifiek bedrag en deadline
   - Status flow: `PENDING` → `IN_PROGRESS` → `SUBMITTED` → `APPROVED` → `PAID`
   - Elke milestone heeft een volgorde (`order`) binnen het project

4. **EscrowPayment** (Escrow Betaling)
   - Geld dat in escrow wordt gehouden voor een milestone
   - Status: `PENDING` → `HELD` → `RELEASED` (of `REFUNDED`)
   - Gesimuleerd (geen echte betalingen)

5. **Approval** (Goedkeuring)
   - Klant goedkeurt/afwijst een milestone
   - Status: `PENDING` → `APPROVED` / `REJECTED`

6. **Message** (Bericht)
   - Communicatie tussen klant en aannemer binnen een project

7. **Dispute** (Geschil)
   - Geschillen over projecten of milestones
   - Status: `OPEN` → `RESOLVED` → `CLOSED`

### Globale Flow

```
1. Registratie/Login
   ↓
2. Klant maakt Project aan met Milestones
   ↓
3. Aannemer accepteert Project
   ↓
4. Klant stort geld in Escrow voor Milestones
   ↓
5. Aannemer werkt aan Milestone (status: IN_PROGRESS)
   ↓
6. Aannemer dient Milestone in (status: SUBMITTED)
   ↓
7. Klant keurt goed/af (status: APPROVED/REJECTED)
   ↓
8. Bij goedkeuring: Betaling vrijgegeven aan aannemer (status: RELEASED)
```

Zie [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) voor gedetailleerde architectuur documentatie.

---

## 🧪 Testing

### Test Scripts

```bash
# Test escrow flow
./scripts/test-escrow-flow.sh

# Reset database en run basistests
./scripts/reset-and-test.sh
```

### Test Frameworks

- **Backend**: Geen formele test framework geconfigureerd (TODO)
- **Frontend**: Geen formele test framework geconfigureerd (TODO)

**Aanbeveling**: Overweeg Jest/Vitest voor unit tests en Playwright voor E2E tests.

---

## 🚢 Deployment

### Frontend (Netlify)

De frontend is geconfigureerd voor deployment naar Netlify:

- **Config**: `netlify.toml`
- **Build Command**: `npm run build:web`
- **Publish Directory**: `apps/web/.next`

**Environment Variables in Netlify:**
- `NEXT_PUBLIC_API_URL`: URL naar backend API (bijv. `https://api.vertrouwdbouwen.nl`)

Zie [docs/NETLIFY_DEPLOY.md](./docs/NETLIFY_DEPLOY.md) voor details.

### Backend (Kubernetes)

De backend is geconfigureerd voor deployment naar Kubernetes via Helm:

- **Helm Charts**: `helm/`
- **Config**: `helm/values.yaml` (development), `helm/values-prod.yaml` (productie)

**Environment Variables in Kubernetes:**
- `DATABASE_URL`: PostgreSQL connection string (of losse `DB_*` variabelen)
- `JWT_SECRET`: Secret voor JWT signing
- `CORS_ORIGIN`: Toegestane frontend origins

Zie [docs/KUBERNETES-ENV-SETUP.md](./docs/KUBERNETES-ENV-SETUP.md) voor details.

### Database

PostgreSQL wordt gedeployed via Kubernetes (zie `helm/templates/database.yaml`).

---

## 📚 Documentatie

### Actuele Documentatie

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: Gedetailleerde architectuur documentatie
- **[API_DOCUMENTATION.md](./apps/api/API_DOCUMENTATION.md)**: Volledige API endpoint documentatie
- **[NETLIFY_DEPLOY.md](./docs/NETLIFY_DEPLOY.md)**: Frontend deployment naar Netlify
- **[KUBERNETES-ENV-SETUP.md](./docs/KUBERNETES-ENV-SETUP.md)**: Backend deployment naar Kubernetes

### Verouderde Documentatie

Alle verouderde, dubbele of tegenstrijdige documentatie is verplaatst naar **[docs/_outdated/](./docs/_outdated/)**.

**Belangrijk**: De root `README.md` (dit bestand) is altijd de bron van waarheid. Documentatie in `docs/_outdated/` is niet meer leidend en wordt alleen bewaard voor referentie.

---

## 🔍 Troubleshooting

### Database Verbindingsproblemen

```bash
# Check of PostgreSQL container draait
docker ps | grep postgres

# Check database logs
docker-compose logs postgres

# Test database verbinding
cd apps/api
npm run db:migrate:status
```

### Frontend kan backend niet bereiken

1. Check of backend draait: `curl http://localhost:5001/api/health`
2. Check `NEXT_PUBLIC_API_URL` in `apps/web/.env.local`
3. Check CORS configuratie in backend (`CORS_ORIGIN`)

### Prisma Migratie Problemen

```bash
cd apps/api

# Reset database (⚠️ verwijdert alle data)
npm run db:migrate:reset

# Of force push schema
npm run db:push
```

---

## 📝 Licentie

Private project

---

## 🤝 Contributing

Dit is een privé project. Voor vragen of suggesties, neem contact op met het development team.

---

**Laatste update**: December 2024  
**Project Status**: In actieve ontwikkeling
