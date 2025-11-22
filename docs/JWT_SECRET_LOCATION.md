# Waar vind je de JWT_SECRET waarde?

## 📍 Locaties waar JWT_SECRET normaal gesproken staat

### 1. Vercel Dashboard (Productie/Preview/Development)

**Als je project al gedeployed is op Vercel:**

1. Ga naar [vercel.com](https://vercel.com)
2. Selecteer je project (API Backend)
3. Ga naar **Settings** → **Environment Variables**
4. Zoek naar `JWT_SECRET`
5. Klik op het oog-icoon om de waarde te bekijken

**Via Vercel CLI:**
```bash
cd apps/api
npx vercel link  # Als nog niet gelinkt
npx vercel env ls
```

### 2. Lokale .env bestanden

**Voor lokale development:**

```bash
# Check in apps/api directory
cd apps/api
cat .env.local  # Als deze bestaat
cat .env        # Fallback
```

**Let op:** 
- `.env.local` staat meestal in `.gitignore` (niet in Git)
- `.env` kan wel in Git staan, maar bevat meestal placeholders

### 3. Vercel Environment Variables Export

**Als je eerder een backup hebt gemaakt:**

```bash
# Check voor backup bestanden
ls -la vercel-env-backup-*.txt
cat vercel-env-backup-*.txt | grep JWT_SECRET
```

### 4. Als het nog niet bestaat

**Als de JWT_SECRET nog niet is ingesteld:**

Je moet een nieuwe genereren:

```bash
openssl rand -base64 32
```

## 🔍 Stap-voor-stap: JWT_SECRET vinden

### Optie A: Via Vercel Dashboard (aanbevolen)

1. **Login bij Vercel:**
   - Ga naar [vercel.com](https://vercel.com)
   - Login met je account

2. **Selecteer project:**
   - Kies je API Backend project
   - Als je niet weet welk project: check de project naam in `apps/api/vercel.json` of `.vercel/project.json`

3. **Bekijk environment variables:**
   - Settings → Environment Variables
   - Zoek `JWT_SECRET`
   - Klik op oog-icoon om waarde te zien

### Optie B: Via Vercel CLI

```bash
# 1. Zorg dat je ingelogd bent
npx vercel login

# 2. Link project (als nodig)
cd apps/api
npx vercel link

# 3. List alle environment variables
npx vercel env ls

# 4. Bekijk specifieke waarde (als mogelijk)
npx vercel env pull .env.local
cat .env.local | grep JWT_SECRET
```

### Optie C: Check lokale bestanden

```bash
# Check alle mogelijke .env bestanden
cd apps/api
for file in .env.local .env .env.production .env.development; do
  if [ -f "$file" ]; then
    echo "=== $file ==="
    grep "^JWT_SECRET=" "$file" || echo "Niet gevonden"
  fi
done
```

## ⚠️ Als JWT_SECRET niet bestaat

**Als je de JWT_SECRET nergens kunt vinden, betekent dit waarschijnlijk dat:**

1. Het project nog niet is gedeployed op Vercel
2. De environment variable nog niet is ingesteld
3. Je moet een nieuwe genereren

**Genereer een nieuwe:**

```bash
openssl rand -base64 32
```

**Voeg toe aan Vercel:**

```bash
cd apps/api
npx vercel link  # Als nodig
npx vercel env add JWT_SECRET production
# Volg de prompts en plak de gegenereerde waarde
```

## 📝 Notities

- **JWT_SECRET is een secret**: Deel deze nooit publiekelijk
- **Uniek per omgeving**: Gebruik verschillende waarden voor dev/staging/prod
- **Niet in Git**: `.env.local` met secrets staat in `.gitignore`
- **Backup**: Maak altijd een backup voordat je wijzigingen maakt

## 🔗 Gerelateerde Documentatie

- [Environment Variables Setup](./env.md)
- [Vercel ENV Setup](./env-vercel-setup.md)
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_QUICKSTART.md)

