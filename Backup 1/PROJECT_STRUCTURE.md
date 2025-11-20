# VertrouwdBouwen - Project Bestandsstructuur

## Monorepo Structuur

```
vertrouwdbouwen/
├── package.json                 # Root package.json (workspace manager)
├── pnpm-workspace.yaml          # pnpm workspace config (of npm/yarn equivalent)
├── .gitignore
├── .env.example
├── .env.local                   # Local environment variables
├── docker-compose.yml           # PostgreSQL + development services
├── README.md
│
├── apps/
│   ├── web/                     # Next.js Frontend
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   │
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── (auth)/          # Auth routes (group)
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   │   ├── layout.tsx   # Dashboard layout with navigation
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx # Main dashboard page
│   │   │   │   └── projects/
│   │   │   │       ├── new/
│   │   │   │       │   └── page.tsx # Create new project
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx # Project detail page
│   │   │   │
│   │   │   └── api/             # Next.js API Routes (proxy to Express)
│   │   │       └── [...path]/
│   │   │           └── route.ts # Catch-all proxy
│   │   │
│   │   ├── components/          # React Components
│   │   │   ├── ui/              # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── Toast.tsx
│   │   │   │
│   │   │   ├── projects/        # Project-related components
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   ├── MilestoneForm.tsx
│   │   │   │   └── MilestoneList.tsx
│   │   │   │
│   │   │   ├── providers/       # Context providers
│   │   │   │   └── ToastProvider.tsx
│   │   │   │
│   │   │   └── contexts/        # React contexts
│   │   │       └── AuthContext.tsx
│   │   │
│   │   ├── lib/                 # Frontend utilities
│   │   │   ├── api/
│   │   │   │   ├── client.ts    # API client setup
│   │   │   │   ├── projects.ts  # Project API calls
│   │   │   │   └── milestones.ts # Milestone API calls
│   │   │   │
│   │   │   └── utils/
│   │   │       └── format.ts    # Formatting utilities (currency, dates)
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useToast.ts      # Toast notification hook
│   │   │
│   │   └── public/              # Static assets
│   │       ├── images/
│   │       └── favicon.ico
│   │
│   └── api/                     # Express.js Backend
│       ├── package.json
│       ├── tsconfig.json
│       ├── server.ts            # Express server entry point
│       │
│       ├── src/
│       │   ├── app.ts           # Express app setup
│       │   ├── config/
│       │   │   ├── database.ts  # Prisma client
│       │   │   ├── env.ts       # Environment validation
│       │   │   └── cors.ts      # CORS config
│       │   │
│       │   ├── middleware/
│       │   │   ├── auth.ts      # JWT authentication
│       │   │   ├── errorHandler.ts
│       │   │   ├── validator.ts
│       │   │   └── rateLimiter.ts
│       │   │
│       │   ├── routes/
│       │   │   ├── index.ts     # Route aggregator
│       │   │   ├── auth.routes.ts
│       │   │   ├── projects.routes.ts
│       │   │   ├── milestones.routes.ts
│       │   │   └── payments.routes.ts
│       │   │
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── projects.controller.ts
│       │   │   ├── milestones.controller.ts
│       │   │   └── payments.controller.ts
│       │   │
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── projects.service.ts
│       │   │   ├── milestones.service.ts
│       │   │   └── payments.service.ts    # Escrow logic
│       │   │
│       │   ├── models/          # Database models (Prisma schema)
│       │   │   └── (handled by Prisma)
│       │   │
│       │   └── utils/
│       │       ├── jwt.ts
│       │       ├── bcrypt.ts
│       │       ├── errors.ts    # Custom error classes
│       │       └── logger.ts
│       │
│       └── prisma/
│           ├── schema.prisma    # Prisma schema
│           ├── migrations/      # Database migrations
│           └── seed.ts          # Database seed script
│
├── packages/                    # Shared packages
│   └── shared/                 # Shared types & utilities
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.ts
│       │   │   ├── project.ts
│       │   │   ├── milestone.ts
│       │   │   ├── payment.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── constants/
│       │   │   ├── roles.ts
│       │   │   ├── statuses.ts
│       │   │   └── index.ts
│       │   │
│       │   └── utils/
│       │       ├── validation.ts
│       │       └── format.ts
│       │
│       └── dist/               # Compiled output
│
└── scripts/                    # Utility scripts
    ├── setup.sh               # Initial setup script
    ├── db:migrate.sh
    └── db:seed.sh
```

## Belangrijke Bestanden

### Root Level
- `package.json` - Workspace manager, scripts voor alle apps
- `docker-compose.yml` - PostgreSQL container
- `.env.example` - Environment variable template

### Frontend (apps/web)
- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Frontend utilities en API clients

### Backend (apps/api)
- `src/app.ts` - Express app configuratie
- `src/routes/` - API route definities
- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `prisma/schema.prisma` - Database schema

### Shared (packages/shared)
- Gedeelde TypeScript types
- Gedeelde constanten
- Gedeelde utilities

## Package Manager Setup

Gebruik **pnpm workspaces** of **npm workspaces** voor monorepo management:

```json
{
  "name": "bouwzeker",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

## Development Workflow

1. **Database**: Docker Compose start PostgreSQL
2. **Backend**: Express API op port 5000
3. **Frontend**: Next.js dev server op port 3000
4. **Shared**: TypeScript package gedeeld tussen frontend/backend

