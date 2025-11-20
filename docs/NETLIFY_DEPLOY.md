# Netlify Deployment Guide - VertrouwdBouwen

Dit document beschrijft hoe je het VertrouwdBouwen-project deployt op Netlify.

## 🎯 Architectuurkeuze: Optie A - Externe Backend

**Beslissing**: De Express backend blijft **extern gehost** (bijv. Render, Railway, Fly.io) en de Next.js frontend draait op Netlify.

**Redenen**:
- ✅ Minimale code-wijzigingen nodig
- ✅ Bestaande Express/Prisma setup blijft intact
- ✅ Geen risico op breaking changes in auth/logic
- ✅ Backend kan onafhankelijk schalen
- ✅ PostgreSQL kan direct verbonden worden met backend (geen Netlify Functions limitations)

**Alternatief (niet geïmplementeerd)**: Backend omzetten naar Netlify Functions zou mogelijk zijn, maar vereist significante refactoring van Express routes naar serverless functions.

---

## 📋 Overzicht van Wijzigingen

### Aangepaste Bestanden

1. **`apps/web/app/api/[...path]/route.ts`**
   - Gebruikt nu `API_BASE_URL` (server-side) of `NEXT_PUBLIC_API_URL` (client-side)
   - Fallback naar `localhost:5001` voor lokale development
   - Geen hardcoded URLs meer

2. **`apps/web/contexts/AuthContext.tsx`**
   - Hardcoded localhost error message verwijderd
   - Gebruikt nu generieke error message

3. **`netlify.toml`** (nieuw)
   - Build configuratie voor monorepo
   - Netlify Next.js plugin configuratie
   - Build command: `npm run build:web`

4. **`package.json`** (root)
   - `@netlify/plugin-nextjs` toegevoegd als devDependency
   - `build:web` script aangepast om eerst shared package te builden

### Nieuwe Bestanden

- `netlify.toml` - Netlify build configuratie

---

## 🔧 Environment Variables

### Voor Netlify (Frontend)

Stel deze in in de Netlify UI onder **Site settings > Environment variables**:

| Variable | Beschrijving | Voorbeeld |
|----------|--------------|-----------|
| `NEXT_PUBLIC_API_URL` | URL van de externe backend API (exposed aan client) | `https://vertrouwdbouwen-api.onrender.com` |
| `API_BASE_URL` | Server-side API URL (niet exposed aan client) | `https://vertrouwdbouwen-api.onrender.com` |

**Let op**: 
- `NEXT_PUBLIC_API_URL` wordt gebruikt door de Next.js API proxy route
- Zorg dat de backend URL eindigt **zonder** trailing slash
- Voor production: gebruik HTTPS URLs

### Voor Externe Backend Host (bijv. Render/Railway)

Stel deze in op je backend hosting platform:

| Variable | Beschrijving | Voorbeeld |
|----------|--------------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `JWT_SECRET` | Secret voor JWT tokens | (random string) |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `PORT` | Server port | `5001` (of automatisch door host) |
| `NODE_ENV` | Environment | `production` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://your-site.netlify.app` |

**Belangrijk**: 
- `CORS_ORIGIN` moet de Netlify URL bevatten waar je frontend draait
- Voor meerdere origins (dev + prod): gebruik comma-separated list of wildcard (minder veilig)

---

## 🚀 Stappen om te Deployen

### Stap 1: Backend Deployen (Extern)

1. **Kies een hosting platform**:
   - [Render](https://render.com) (aanbevolen - gratis tier beschikbaar)
   - [Railway](https://railway.app)
   - [Fly.io](https://fly.io)
   - [Heroku](https://heroku.com) (betaald)

2. **Backend deployen**:
   - Push je code naar GitHub
   - Maak een nieuwe service op je hosting platform
   - Kies de `apps/api` directory als root (of pas build command aan)
   - Stel environment variables in (zie boven)
   - Deploy!

3. **PostgreSQL database**:
   - Maak een PostgreSQL database aan op je hosting platform
   - Of gebruik een externe service zoals:
     - [Supabase](https://supabase.com) (gratis tier)
     - [Neon](https://neon.tech) (gratis tier)
     - [Railway PostgreSQL](https://railway.app/templates/postgresql)
   - Kopieer de `DATABASE_URL` naar je backend environment variables
   - Run migrations: `npm run db:migrate:deploy` (of via hosting platform)

4. **Noteer de backend URL**:
   - Bijvoorbeeld: `https://vertrouwdbouwen-api.onrender.com`
   - Deze heb je nodig voor de Netlify environment variables

### Stap 2: Frontend Deployen op Netlify

1. **Push code naar GitHub**:
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Netlify setup**:
   - Ga naar [Netlify](https://app.netlify.com)
   - Klik op **"Add new site" > "Import an existing project"**
   - Kies **GitHub** en selecteer je repository
   - Kies de branch (meestal `main`)

3. **Build settings** (Netlify detecteert deze automatisch via `netlify.toml`, maar controleer):
   - **Base directory**: (leeg - root van repo)
   - **Build command**: `npm run build:web`
   - **Publish directory**: `apps/web/.next` (wordt automatisch door plugin overruled)

4. **Environment variables instellen**:
   - Ga naar **Site settings > Environment variables**
   - Voeg toe:
     - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com` (zonder trailing slash)
     - `API_BASE_URL` = `https://your-backend-url.com` (zelfde als boven)

5. **Deploy**:
   - Klik op **"Deploy site"**
   - Wacht tot de build klaar is
   - Test de site!

### Stap 3: CORS Configuratie

Zorg dat je backend CORS correct is geconfigureerd:

In `apps/api/src/server.ts` (of waar CORS is geconfigureerd):
```typescript
app.use(cors({
  origin: env.CORS_ORIGIN, // Moet je Netlify URL bevatten
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

Voor meerdere origins (development + production):
```typescript
const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  // ...
}));
```

---

## ✅ Checklist voor Deployment

### Pre-deployment
- [ ] Code is gepusht naar GitHub
- [ ] `netlify.toml` is aanwezig in root
- [ ] `@netlify/plugin-nextjs` is geïnstalleerd (via `npm install`)
- [ ] Geen hardcoded localhost URLs meer in code

### Backend
- [ ] Backend is gedeployed op externe host
- [ ] PostgreSQL database is aangemaakt en bereikbaar
- [ ] `DATABASE_URL` is correct geconfigureerd
- [ ] Migrations zijn uitgevoerd (`npm run db:migrate:deploy`)
- [ ] `CORS_ORIGIN` bevat de Netlify URL
- [ ] Backend URL is bekend (voor Netlify env vars)

### Frontend (Netlify)
- [ ] Repository is gekoppeld aan Netlify
- [ ] Build settings zijn correct (automatisch via `netlify.toml`)
- [ ] `NEXT_PUBLIC_API_URL` is ingesteld in Netlify UI
- [ ] `API_BASE_URL` is ingesteld in Netlify UI
- [ ] Eerste deploy is succesvol

### Post-deployment
- [ ] Frontend laadt correct op Netlify URL
- [ ] Login werkt (test met bestaande gebruiker)
- [ ] Registratie werkt
- [ ] API calls gaan naar externe backend (check Network tab)
- [ ] Cookies worden correct doorgestuurd
- [ ] Geen CORS errors in browser console

---

## 🧪 Lokale Test (Netlify CLI)

Je kunt lokaal testen of de Netlify build werkt:

```bash
# Installeer Netlify CLI (optioneel)
npm install -g netlify-cli

# Test de build
npx netlify build

# Of test lokaal met Netlify Dev (simuleert Netlify environment)
npx netlify dev
```

**Let op**: Voor `netlify dev` moet je eerst environment variables instellen in een `.env` file of via `netlify env:set`.

---

## 🔍 Troubleshooting

### Build faalt op Netlify

**Probleem**: Build command faalt
- **Oplossing**: Check of `build:web` script correct is in `package.json`
- Check Netlify build logs voor specifieke errors

**Probleem**: Shared package niet gevonden
- **Oplossing**: Zorg dat `build:web` eerst `packages/shared` buildt (is al geconfigureerd)

### API calls werken niet

**Probleem**: 503 Service Unavailable
- **Oplossing**: Check of `NEXT_PUBLIC_API_URL` correct is ingesteld in Netlify
- Check of backend daadwerkelijk draait en bereikbaar is

**Probleem**: CORS errors
- **Oplossing**: Check of `CORS_ORIGIN` in backend de Netlify URL bevat
- Check of `credentials: true` is ingesteld in CORS config

**Probleem**: Cookies worden niet doorgestuurd
- **Oplossing**: Check of `credentials: 'include'` is gebruikt in fetch calls (is al geconfigureerd)
- Check of backend `Set-Cookie` headers correct verzendt

### Database connectie problemen

**Probleem**: Backend kan niet verbinden met database
- **Oplossing**: Check `DATABASE_URL` in backend environment variables
- Check of database publiek bereikbaar is (niet alleen localhost)
- Check firewall/security groups van database host

---

## 📚 Aanbevolen Hosting Opties

### Backend + Database

1. **Render** (aanbevolen)
   - Gratis tier voor backend (Web Service)
   - Gratis PostgreSQL database
   - Automatische deploys vanuit GitHub
   - URL: `https://render.com`

2. **Railway**
   - Eenvoudige setup
   - PostgreSQL addon beschikbaar
   - URL: `https://railway.app`

3. **Fly.io**
   - Goed voor Node.js apps
   - PostgreSQL beschikbaar
   - URL: `https://fly.io`

### Alleen Database (als backend ergens anders draait)

1. **Supabase**
   - Gratis PostgreSQL tier
   - Goede performance
   - URL: `https://supabase.com`

2. **Neon**
   - Serverless PostgreSQL
   - Gratis tier
   - URL: `https://neon.tech`

---

## 🔐 Security Best Practices

1. **Environment Variables**:
   - Gebruik nooit `NEXT_PUBLIC_*` voor secrets (worden exposed aan client)
   - Gebruik `API_BASE_URL` voor server-side code (niet exposed)

2. **CORS**:
   - Beperk `CORS_ORIGIN` tot specifieke URLs (geen wildcards in production)
   - Gebruik HTTPS in production

3. **Database**:
   - Gebruik connection pooling (Prisma doet dit automatisch)
   - Beperk database toegang tot alleen je backend IP (indien mogelijk)

---

## 📝 Notities

- De backend blijft een standalone Express app - geen wijzigingen nodig voor Netlify
- De Next.js app gebruikt een API proxy route (`app/api/[...path]/route.ts`) die requests doorstuurt naar de externe backend
- Alle API calls gaan via deze proxy, waardoor cookies automatisch worden doorgestuurd
- De `apiClient` in `lib/api/client.ts` gebruikt relatieve URLs (`/api`), wat perfect werkt met de proxy

---

## 🆘 Support

Als je problemen tegenkomt:
1. Check de Netlify build logs
2. Check de browser console voor errors
3. Check de Network tab om te zien waar API calls naartoe gaan
4. Check of backend logs errors tonen

Voor vragen over deze deployment setup, raadpleeg de [Netlify Next.js documentation](https://docs.netlify.com/integrations/frameworks/nextjs/).

