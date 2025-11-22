# Vercel Deployment Quickstart Guide

**Voor**: VertrouwdBouwen - Vercel + Neon PostgreSQL + Prisma

## 🚀 Snelle Setup (5 minuten)

### Stap 1: Neon Database Aanmaken

1. Ga naar [console.neon.tech](https://console.neon.tech)
2. Maak een nieuw project aan
3. Kopieer de connection string (format: `postgresql://user:pass@host/db?sslmode=require`)

### Stap 2: Vercel Project Aanmaken

#### Frontend (Next.js)

1. **Import Project**:
   - Ga naar [vercel.com](https://vercel.com)
   - Klik "Add New Project"
   - Import je Git repository
   - **Root Directory**: `apps/web`

2. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app
   API_BASE_URL=https://your-api.vercel.app
   DATABASE_URL=postgresql://... (alleen voor comments feature)
   ```

3. **Build Settings** (automatisch):
   - Framework: Next.js
   - Build Command: `npm run build` (automatisch)
   - Output Directory: `.next` (automatisch)

#### Backend (Express API)

1. **Import Project**:
   - Maak een nieuw Vercel project
   - **Root Directory**: `apps/api`

2. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://... (VERPLICHT)
   JWT_SECRET=<genereer-met-openssl-rand-base64-32> (VERPLICHT)
   CORS_ORIGIN=https://your-frontend.vercel.app
   PORT=5001
   ```

3. **Build Settings**:
   - Build Command: `cd apps/api && npm run build`
   - Install Command: `npm install` (voert automatisch `prisma generate` uit)

4. **Migrations** (optioneel - automatisch tijdens build):
   - Voeg toe aan build command: `cd apps/api && prisma generate && prisma migrate deploy && tsc`
   - Of handmatig: `vercel env pull && cd apps/api && npx prisma migrate deploy`

### Stap 3: Deploy

1. **Deploy Backend eerst** (om API URL te krijgen)
2. **Update Frontend Environment Variables** met backend URL
3. **Deploy Frontend**

## ✅ Verificatie

### Test Database Connectie

```bash
# Via Vercel CLI
vercel env pull
cd apps/api
npx prisma db pull
```

### Test API Endpoints

```bash
# Health check
curl https://your-api.vercel.app/api/health

# Test auth (moet 401 geven zonder token)
curl https://your-api.vercel.app/api/auth/me
```

### Test Frontend

- Open: `https://your-frontend.vercel.app`
- Test login/registratie
- Test dashboard functionaliteit

## 🔧 Troubleshooting

### Database Connectie Fout

**Symptoom**: `P1001` of `Can't reach database server`

**Oplossing**:
1. Check `DATABASE_URL` in Vercel Environment Variables
2. Verifieer dat connection string `?sslmode=require` bevat
3. Test connectie lokaal: `npx prisma db pull`

### Build Fout: Prisma Client niet gevonden

**Symptoom**: `Cannot find module '@prisma/client'`

**Oplossing**:
1. Check dat `postinstall` script in `package.json` staat: `"postinstall": "prisma generate"`
2. Check build logs in Vercel - `prisma generate` moet uitgevoerd zijn

### Migraties niet uitgevoerd

**Symptoom**: Database schema niet up-to-date

**Oplossing**:
1. Voeg toe aan build command: `prisma migrate deploy`
2. Of handmatig: `vercel env pull && cd apps/api && npx prisma migrate deploy`

### CORS Errors

**Symptoom**: Frontend kan API niet bereiken

**Oplossing**:
1. Check `CORS_ORIGIN` in backend environment variables
2. Moet exacte frontend URL bevatten (bijv. `https://your-frontend.vercel.app`)

## 📚 Volledige Documentatie

- **[VERCEL_NEON_PRISMA_AUDIT.md](./VERCEL_NEON_PRISMA_AUDIT.md)**: Volledige audit en configuratie details
- **[NEON_PRISMA_SETUP.md](./NEON_PRISMA_SETUP.md)**: Gedetailleerde Neon setup

## 🆘 Hulp Nodig?

Check de volledige audit documentatie voor alle details: [VERCEL_NEON_PRISMA_AUDIT.md](./VERCEL_NEON_PRISMA_AUDIT.md)

