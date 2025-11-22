# Vercel Environment Variables Setup

## ⚠️ Belangrijke Veiligheidswaarschuwing

**VOER NOOIT AUTOMATISCH DESTRUCTIEVE ACTIES UIT IN PRODUCTIE!**

Dit document bevat instructies voor het beheren van environment variables in Vercel. Alle acties die bestaande variabelen kunnen verwijderen of wijzigen zijn **expliciet gemarkeerd** en moeten **handmatig worden uitgevoerd** na review.

---

## 📋 Huidige State Ophalen

Voordat je wijzigingen maakt, bekijk eerst de huidige environment variables:

```bash
# Via Vercel CLI
vercel env ls

# Of via Vercel Dashboard
# Project → Settings → Environment Variables
```

---

## 🔧 Environment Variables Setup

### Voor API (Express Backend)

De Express API backend heeft de volgende environment variables nodig:

#### Verplichte Variabelen

1. **`DATABASE_URL`**
   - **Type**: Secret
   - **Waarde**: Neon PostgreSQL connection string
   - **Format**: `postgres://USER:PASSWORD@HOST/DB?sslmode=require`
   - **Waar te vinden**: Neon Dashboard → Connection String
   - **Belangrijk**: Verwijder `channel_binding=require` als die aanwezig is

2. **`JWT_SECRET`**
   - **Type**: Secret
   - **Waarde**: Veilige random string (minimaal 32 karakters)
   - **Genereren**: `openssl rand -base64 32`
   - **Belangrijk**: Gebruik een unieke waarde voor productie

#### Optionele Variabelen

3. **`NODE_ENV`**
   - **Type**: Plain Text
   - **Waarde**: `production`
   - **Default**: `development` (als niet ingesteld)

4. **`CORS_ORIGIN`**
   - **Type**: Plain Text
   - **Waarde**: Frontend URL (bijv. `https://your-app.vercel.app`)
   - **Default**: `http://localhost:3000` (als niet ingesteld)

5. **`JWT_EXPIRES_IN`**
   - **Type**: Plain Text
   - **Waarde**: Token expiration tijd (bijv. `7d`, `24h`)
   - **Default**: `7d` (als niet ingesteld)

6. **`SHADOW_DATABASE_URL`** (optioneel)
   - **Type**: Secret
   - **Waarde**: Shadow database voor Prisma migraties
   - **Notitie**: Meestal niet nodig voor Neon

### Voor Web (Next.js Frontend)

#### Verplichte Variabelen (Productie)

1. **`NEXT_PUBLIC_API_URL`**
   - **Type**: Plain Text (publiek toegankelijk)
   - **Waarde**: URL naar Express API backend
   - **Format**: `https://your-api.vercel.app` (zonder trailing slash)
   - **Belangrijk**: Dit is zichtbaar in de browser, gebruik HTTPS

#### Optionele Variabelen

2. **`API_BASE_URL`** (server-side only)
   - **Type**: Secret
   - **Waarde**: Alternatief voor `NEXT_PUBLIC_API_URL` (server-side only)
   - **Notitie**: Wordt gebruikt door Next.js API routes (proxy)

---

## 🚀 Environment Variables Toevoegen

### Via Vercel CLI

**⚠️ Alleen uitvoeren na handmatige review!**

```bash
# Navigeer naar de juiste directory
cd apps/api  # of apps/web

# Voeg environment variable toe
vercel env add DATABASE_URL production
# Volg de prompts om de waarde in te voeren

# Voor preview/development environments
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

### Via Vercel Dashboard

1. Ga naar je Vercel project
2. Klik op **Settings** → **Environment Variables**
3. Klik op **Add New**
4. Vul de variabele naam en waarde in
5. Selecteer de environments (Production, Preview, Development)
6. Klik op **Save**

---

## 🧹 Environment Variables Opschonen (STAGING/DEV ONLY)

**⚠️ WAARSCHUWING: Dit verwijdert environment variables!**

**ALLEEN UITVOEREN VOOR:**
- Development/Preview environments
- Staging/test omgevingen
- **NOOIT** voor productie zonder backup!

### Stap 1: Backup Maken

```bash
# Export huidige environment variables
vercel env ls > vercel-env-backup-$(date +%Y%m%d).txt
```

### Stap 2: Verwijderen (STAGING/DEV ONLY)

```bash
# ⚠️ ALLEEN VOOR STAGING/DEV - NOOIT PRODUCTIE!
# Verwijder variabelen voor development/preview environments

vercel env rm DATABASE_URL development
vercel env rm DATABASE_URL preview
vercel env rm JWT_SECRET development
vercel env rm JWT_SECRET preview
# etc.
```

### Stap 3: Opnieuw Toevoegen

Na het verwijderen, voeg de variabelen opnieuw toe met de correcte waarden:

```bash
vercel env add DATABASE_URL development
vercel env add DATABASE_URL preview
# etc.
```

---

## 📝 Complete Setup Script (Voorbereiding)

**⚠️ Dit script genereert alleen de commands, voer ze NIET automatisch uit!**

Hieronder staan de commands die je **handmatig** moet uitvoeren na review:

### Voor API Backend

```bash
# 1. DATABASE_URL (vervang met je Neon connection string)
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# 2. JWT_SECRET (genereer eerst: openssl rand -base64 32)
vercel env add JWT_SECRET production
vercel env add JWT_SECRET preview
vercel env add JWT_SECRET development

# 3. NODE_ENV (optioneel)
vercel env add NODE_ENV production
# Waarde: production

# 4. CORS_ORIGIN (optioneel, vervang met je frontend URL)
vercel env add CORS_ORIGIN production
# Waarde: https://your-frontend.vercel.app
```

### Voor Web Frontend

```bash
# 1. NEXT_PUBLIC_API_URL (vervang met je API backend URL)
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL preview
vercel env add NEXT_PUBLIC_API_URL development
# Waarde: https://your-api.vercel.app (zonder trailing slash)
```

---

## ✅ Verificatie

Na het toevoegen van environment variables:

1. **Redeploy de applicatie**:
   ```bash
   vercel --prod
   ```

2. **Test de endpoints**:
   ```bash
   # Test health check
   curl https://your-api.vercel.app/api/health

   # Test database health check
   curl https://your-api.vercel.app/api/health/db
   ```

3. **Controleer logs**:
   - Vercel Dashboard → Functions → Logs
   - Zoek naar errors gerelateerd aan environment variables

---

## 🔍 Troubleshooting

### "Missing required environment variables"

**Oplossing:**
1. Controleer of alle verplichte variabelen zijn ingesteld
2. Controleer of de variabelen zijn ingesteld voor de juiste environment (production/preview/development)
3. Redeploy de applicatie na het toevoegen van variabelen

### "Database connection failed"

**Oplossing:**
1. Controleer of `DATABASE_URL` correct is (zonder `channel_binding=require`)
2. Test de connection string lokaal met `npx prisma db pull`
3. Controleer Neon dashboard voor database status

### "JWT_SECRET is not set"

**Oplossing:**
1. Controleer of `JWT_SECRET` is ingesteld in Vercel
2. Genereer een nieuwe secret: `openssl rand -base64 32`
3. Voeg toe aan Vercel en redeploy

---

## 📚 Gerelateerde Documentatie

- [Environment Variables Overzicht](./env.md)
- [Database Reset Guide](./db-reset.md)
- [Neon Prisma Setup](./NEON_PRISMA_SETUP.md)
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_QUICKSTART.md)

