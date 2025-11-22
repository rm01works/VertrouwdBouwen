# Environment Variables Documentatie

## Overzicht

Dit document beschrijft alle environment variables die gebruikt worden in het VertrouwdBouwen platform.

---

## Backend API (`apps/api`)

### Verplichte Variabelen

| Variabele | Type | Beschrijving | Voorbeeld |
|-----------|------|--------------|-----------|
| `DATABASE_URL` | Secret | PostgreSQL connection string (Neon) | `postgres://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret | Secret key voor JWT token signing | `random-secure-string` |

### Optionele Variabelen

| Variabele | Type | Default | Beschrijving |
|-----------|------|---------|--------------|
| `SHADOW_DATABASE_URL` | Secret | - | Shadow database voor Prisma migraties (optioneel) |
| `JWT_EXPIRES_IN` | Public | `7d` | JWT token expiration tijd (7d, 24h, etc.) |
| `PORT` | Public | `5001` | Server poort |
| `NODE_ENV` | Public | `development` | Environment mode (development/production) |
| `CORS_ORIGIN` | Public | `http://localhost:3000` | Toegestane CORS origins (comma-separated) |

### DATABASE_URL Format

Voor **Neon PostgreSQL**:
```
postgres://USER:PASSWORD@HOST/DB?sslmode=require
```

Voor **lokale PostgreSQL**:
```
postgresql://user:password@localhost:5432/dbname?schema=public
```

**Belangrijk:**
- Verwijder `channel_binding=require` uit Neon connection strings (Prisma ondersteunt dit niet)
- Gebruik altijd `sslmode=require` voor Neon
- Voor lokale development: gebruik `postgresql://` (met `ql`)

### JWT_SECRET Genereren

```bash
# Genereer een veilige random string
openssl rand -base64 32
```

---

## Frontend Web (`apps/web`)

### Verplichte Variabelen (Productie)

| Variabele | Type | Beschrijving | Voorbeeld |
|-----------|------|--------------|-----------|
| `NEXT_PUBLIC_API_URL` | Public | URL naar Express API backend | `https://your-api.vercel.app` |

### Optionele Variabelen

| Variabele | Type | Beschrijving | Voorbeeld |
|-----------|------|--------------|-----------|
| `API_BASE_URL` | Secret | Server-side only API URL (alternatief voor NEXT_PUBLIC_API_URL) | `https://your-api.vercel.app` |

**Belangrijk:**
- `NEXT_PUBLIC_*` variabelen zijn **publiek toegankelijk** in de browser
- Gebruik `API_BASE_URL` voor server-side code als je de URL niet publiek wilt maken
- Zonder trailing slash in de URL

---

## Environment Setup

### Lokale Development

1. **Backend**:
   ```bash
   cd apps/api
   cp .env.example .env.local
   # Edit .env.local en vul de waarden in
   ```

2. **Frontend**:
   ```bash
   cd apps/web
   cp .env.example .env.local
   # Edit .env.local en vul de waarden in
   ```

### Automatisch Reset Scripts

**Backend:**
```bash
cd apps/api
npm run env:reset
# Edit .env.local en vul de waarden in
```

**Frontend:**
```bash
cd apps/web
npm run env:reset
# Edit .env.local en vul de waarden in
```

---

## Vercel Deployment

Zie [env-vercel-setup.md](./env-vercel-setup.md) voor gedetailleerde instructies voor Vercel environment variables.

### Quick Checklist

**Voor API (Express backend op Vercel):**
- [ ] `DATABASE_URL` (Neon connection string)
- [ ] `JWT_SECRET` (veilige random string)
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` (frontend URL)

**Voor Web (Next.js frontend op Vercel):**
- [ ] `NEXT_PUBLIC_API_URL` (API backend URL)
- [ ] Optioneel: `API_BASE_URL` (server-side only)

---

## Veiligheid

### Secrets vs Public Variables

- **Secrets** (`DATABASE_URL`, `JWT_SECRET`): Nooit committen naar Git
- **Public** (`NEXT_PUBLIC_*`): Kunnen veilig in code worden gebruikt (maar zijn zichtbaar in browser)

### Best Practices

1. ✅ Gebruik `.env.local` voor lokale development (staat in `.gitignore`)
2. ✅ Gebruik `.env.example` als template (mag wel in Git)
3. ✅ Genereer unieke secrets voor elke omgeving (dev/staging/prod)
4. ✅ Rotate secrets regelmatig in productie
5. ❌ Commit nooit `.env` of `.env.local` bestanden
6. ❌ Deel secrets nooit in chat/email/documentatie

---

## Troubleshooting

### "DATABASE_URL is not set"

**Oplossing:**
1. Controleer of `.env.local` bestaat in `apps/api/`
2. Controleer of `DATABASE_URL` is ingesteld in Vercel (voor productie)
3. Gebruik `npm run env:reset` om een nieuwe `.env.local` te genereren

### "JWT_SECRET is not set"

**Oplossing:**
1. Genereer een nieuwe secret: `openssl rand -base64 32`
2. Voeg toe aan `.env.local` of Vercel environment variables

### "NEXT_PUBLIC_API_URL is required in production"

**Oplossing:**
1. Voeg `NEXT_PUBLIC_API_URL` toe aan Vercel environment variables
2. Zorg dat de URL correct is (zonder trailing slash)
3. Redeploy de applicatie

---

## Gerelateerde Documentatie

- [Vercel ENV Setup](./env-vercel-setup.md)
- [Database Reset Guide](./db-reset.md)
- [Neon Prisma Setup](./NEON_PRISMA_SETUP.md)

