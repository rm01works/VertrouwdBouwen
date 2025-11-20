# Refactoring Samenvatting: Netlify + Kubernetes Setup

## Overzicht

Deze refactoring heeft de codebase voorbereid voor productie deployment met:
- **Frontend op Netlify**: Next.js app met configureerbare API URL
- **Backend in Kubernetes**: Express API met flexibele database configuratie
- **Database in Kubernetes**: PostgreSQL met service name support

Alle wijzigingen zijn **backwards compatible** voor lokale ontwikkeling.

## Gewijzigde Bestanden

### Backend (`apps/api`)

1. **`src/config/database.ts`** ⭐ **Belangrijkste wijziging**
   - Ondersteunt nu zowel `DATABASE_URL` als losse `DB_*` environment variables
   - Automatische validatie in productie
   - Ondersteunt Kubernetes service names (bijv. `postgres-service.default.svc.cluster.local`)
   - Genereert `DATABASE_URL` uit losse variabelen als `DATABASE_URL` niet gezet is

2. **`src/config/env.ts`**
   - CORS configuratie ondersteunt nu meerdere origins (comma-separated)
   - Automatische defaults voor lokale ontwikkeling (`localhost:3000`, `localhost:5173`)
   - Validatie in productie (geen wildcards toegestaan)
   - Verbeterde error messages

3. **`src/server.ts`**
   - CORS logging verbeterd voor meerdere origins
   - Geen functionele wijzigingen, alleen logging

### Frontend (`apps/web`)

1. **`app/api/[...path]/route.ts`**
   - Verbeterde error handling en validatie
   - Duidelijke foutmelding als `NEXT_PUBLIC_API_URL` ontbreekt in productie
   - Betere logging voor debugging
   - Fallback naar `localhost:5001` alleen in development

### Documentatie

1. **`apps/api/README-ARCHITECTURE.md`** (nieuw)
   - Volledige architectuur documentatie
   - Database configuratie uitleg
   - CORS configuratie uitleg
   - Environment variables overzicht

2. **`docs/DEPLOYMENT-NETLIFY-K8S.md`** (nieuw)
   - Complete deployment guide voor Netlify + Kubernetes
   - Stap-voor-stap instructies
   - Environment variables setup
   - Troubleshooting guide

3. **`README.md`** (root)
   - Updated met nieuwe environment variables
   - Correcte poort nummers (5001 i.p.v. 5000)

4. **`apps/web/README.md`**
   - Updated met environment variables uitleg
   - Duidelijke instructies voor `NEXT_PUBLIC_API_URL`

5. **`docs/NETLIFY_DEPLOY.md`**
   - Updated met nieuwe database configuratie opties
   - Kubernetes-specifieke informatie toegevoegd

## Nieuwe Environment Variables

### Backend (Kubernetes)

**Database Configuratie** (kies één optie):

**Optie 1: DATABASE_URL**
```env
DATABASE_URL=postgresql://user:password@postgres-service.default.svc.cluster.local:5432/vertrouwdbouwen?schema=public
```

**Optie 2: Losse DB_* variabelen**
```env
DB_HOST=postgres-service.default.svc.cluster.local
DB_PORT=5432
DB_USER=vertrouwdbouwen
DB_PASSWORD=your-password
DB_NAME=vertrouwdbouwen
DB_SCHEMA=public
```

**Overige Backend Variabelen**:
```env
NODE_ENV=production
PORT=5001
JWT_SECRET=<genereer met: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-site.netlify.app
```

### Frontend (Netlify)

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

**Belangrijk**: Deze variabele is **verplicht** in productie en moet gezet zijn in Netlify environment variables.

## Lokale Ontwikkeling

Alles blijft werken zoals voorheen:

### Backend
```bash
cd apps/api
# Gebruik .env met DATABASE_URL of DB_* variabelen
npm run dev
```

### Frontend
```bash
cd apps/web
# Gebruik .env.local met NEXT_PUBLIC_API_URL=http://localhost:5001
npm run dev
```

## Productie Flow

```
Netlify Frontend
  ↓ (HTTPS request)
  NEXT_PUBLIC_API_URL=https://api.example.com
  ↓
Kubernetes Backend API
  ↓ (PostgreSQL connection)
  DB_HOST=postgres-service.default.svc.cluster.local
  ↓
Kubernetes PostgreSQL Database
```

## Belangrijke Punten

1. **Geen hardcoded localhost meer**: Alle API calls gebruiken `NEXT_PUBLIC_API_URL`
2. **Flexibele database configuratie**: Ondersteunt zowel `DATABASE_URL` als losse variabelen
3. **CORS ondersteunt meerdere origins**: Lokale dev + productie Netlify URL
4. **Backwards compatible**: Lokale ontwikkeling werkt nog steeds
5. **Productie validatie**: Duidelijke errors als configuratie ontbreekt

## Handmatige Stappen voor Deployment

### 1. Kubernetes Backend Setup

1. **Maak Secrets**:
   ```bash
   kubectl create secret generic api-secrets \
     --from-literal=jwt-secret=$(openssl rand -base64 32)
   
   kubectl create secret generic postgres-secret \
     --from-literal=username=vertrouwdbouwen \
     --from-literal=password=your-password \
     --from-literal=database-url=postgresql://...
   ```

2. **Update Deployment YAML** met environment variables:
   - Database configuratie (DATABASE_URL of DB_* vars)
   - JWT_SECRET
   - CORS_ORIGIN (met Netlify URL)
   - PORT, NODE_ENV

3. **Deploy Backend**:
   ```bash
   kubectl apply -f backend-deployment.yaml
   kubectl apply -f backend-service.yaml
   ```

4. **Run Migraties**:
   ```bash
   kubectl exec -it <backend-pod> -- npm run db:migrate:deploy
   ```

5. **Noteer publieke API URL** (LoadBalancer IP of Ingress domain)

### 2. Netlify Frontend Setup

1. **Ga naar Netlify UI** > Site settings > Environment variables

2. **Voeg toe**:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-url.com` (publieke backend URL)

3. **Deploy** (of redeploy als site al bestaat)

### 3. CORS Configuratie

Zorg dat `CORS_ORIGIN` in backend de Netlify URL bevat:
```yaml
env:
  - name: CORS_ORIGIN
    value: "https://your-site.netlify.app"
```

## Test Checklist

Na deployment, test:

- [ ] Frontend laadt op Netlify URL
- [ ] Login werkt
- [ ] Registratie werkt
- [ ] API calls gaan naar Kubernetes backend (check Network tab)
- [ ] Geen CORS errors
- [ ] Cookies worden doorgestuurd
- [ ] Database queries werken

## Troubleshooting

Zie `docs/DEPLOYMENT-NETLIFY-K8S.md` voor uitgebreide troubleshooting guide.

**Veelvoorkomende problemen**:

1. **503 Service Unavailable**: Check `NEXT_PUBLIC_API_URL` in Netlify
2. **CORS errors**: Check `CORS_ORIGIN` bevat Netlify URL
3. **Database connectie**: Check service name en credentials in Kubernetes

## Samenvatting

✅ **Database configuratie**: Flexibel, ondersteunt Kubernetes service names  
✅ **CORS configuratie**: Meerdere origins, automatische defaults voor dev  
✅ **Frontend API URL**: Configureerbaar via environment variable  
✅ **Backwards compatible**: Lokale ontwikkeling werkt nog steeds  
✅ **Productie-ready**: Validatie en duidelijke error messages  
✅ **Documentatie**: Volledige guides voor deployment en troubleshooting  

De codebase is nu klaar voor productie deployment op Netlify (frontend) en Kubernetes (backend + database)!

