# VertrouwdBouwen Frontend

Next.js frontend voor het VertrouwdBouwen escrow platform.

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **React 18**
- **Tailwind CSS**
- **API Client** (custom fetch wrapper)

## Structuur

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authenticatie routes
│   ├── (dashboard)/       # Dashboard routes (beschermd)
│   └── api/               # API proxy routes
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── projects/          # Project gerelateerde components
│   └── layout/            # Layout components
├── lib/                   # Utilities en helpers
│   ├── api/              # API client en endpoints
│   ├── utils/            # Utility functies
│   └── auth/             # Auth utilities
└── public/               # Static assets
```

## Development

### Installeren

```bash
cd apps/web
npm install
```

### Development Server

```bash
npm run dev
```

De app draait op http://localhost:3000

### Build

```bash
npm run build
npm start
```

## Environment Variables

Maak een `.env.local` bestand aan:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Componenten

### UI Components

- `Button` - Herbruikbare button component met variants
- `Card` - Card component met header, body, footer
- `Badge` - Status badges met kleuren
- `Loading` - Loading spinner

### Project Components

- `ProjectCard` - Card voor project weergave
  - Toont project details
  - Status badges
  - Actie buttons

## API Integration

De frontend gebruikt een custom API client (`lib/api/client.ts`) die:
- Automatisch JWT tokens toevoegt
- Error handling doet
- Type-safe responses geeft

### Voorbeeld Gebruik

```typescript
import { getProjects } from '@/lib/api/projects';

const response = await getProjects();
if (response.success && response.data) {
  // Gebruik response.data
}
```

## Styling

Tailwind CSS wordt gebruikt voor styling. Primary kleuren zijn geconfigureerd in `tailwind.config.js`.

## Routes

- `/` - Homepage
- `/login` - Login pagina
- `/register` - Registratie pagina
- `/dashboard` - Aannemer dashboard
- `/projects` - Project overzicht
- `/projects/[id]` - Project details

## Features

### Aannemer Dashboard

Het dashboard toont:
- **Beschikbare Projecten**: Projecten zonder aannemer (klaar voor acceptatie)
- **Mijn Projecten**: Geaccepteerde projecten door de aannemer

Elk project card toont:
- Titel en beschrijving
- Totaal budget
- Aantal milestones
- Klant informatie
- Status badge
- Actie buttons

## Toekomstige Features

- [ ] Project acceptatie functionaliteit
- [ ] Milestone indiening
- [ ] Betaling overzicht
- [ ] Berichten systeem
- [ ] Notificaties
- [ ] Filters en zoeken

## TypeScript

Het project gebruikt strikte TypeScript configuratie. Alle API responses zijn getypeerd.

## Best Practices

1. Gebruik `'use client'` voor client-side interactie
2. API calls in `useEffect` of event handlers
3. Error states altijd afhandelen
4. Loading states tonen tijdens API calls
5. Type-safe code met TypeScript

