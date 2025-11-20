# Configuratie Check: Kubernetes Database + Netlify Frontend

## ⚠️ Belangrijk: Architectuur Flow

**Netlify (frontend) praat NOOIT direct met de database!**

De correcte flow is:
```
Netlify Frontend
  ↓ (HTTPS API calls)
  NEXT_PUBLIC_API_URL → Kubernetes Backend API
  ↓ (PostgreSQL connection)
  DB_HOST/DB_* vars → Kubernetes PostgreSQL Database
```

## Configuratie Check

### ✅ Backend Database Configuratie

De backend (`apps/api/src/config/database.ts`) ondersteunt:

1. **DATABASE_URL** (optie 1):
   ```env
   DATABASE_URL=postgresql://user:password@postgres-service.default.svc.cluster.local:5432/vertrouwdbouwen?schema=public
   ```

2. **Losse DB_* variabelen** (optie 2):
   ```env
   DB_HOST=postgres-service.default.svc.cluster.local
   DB_PORT=5432
   DB_USER=vertrouwdbouwen
   DB_PASSWORD=your-password
   DB_NAME=vertrouwdbouwen
   DB_SCHEMA=public
   ```

**Status**: ✅ **Correct geïmplementeerd**
- De `buildDatabaseUrl()` functie bouwt automatisch `DATABASE_URL` uit losse variabelen
- Ondersteunt Kubernetes service names
- Validatie in productie

### ✅ Frontend API Configuratie

De frontend (`apps/web/app/api/[...path]/route.ts`) gebruikt:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

**Status**: ✅ **Correct geïmplementeerd**
- Proxy route gebruikt `NEXT_PUBLIC_API_URL` voor backend URL
- Geen hardcoded localhost in productie
- Duidelijke error messages als variabele ontbreekt

### ✅ CORS Configuratie

De backend (`apps/api/src/config/env.ts`) ondersteunt:

```env
CORS_ORIGIN=https://your-site.netlify.app
```

Of meerdere origins:
```env
CORS_ORIGIN=https://prod.netlify.app,https://staging.netlify.app
```

**Status**: ✅ **Correct geïmplementeerd**
- Ondersteunt meerdere origins (comma-separated)
- Automatische defaults voor lokale dev
- Validatie in productie

## Checklist voor Kubernetes Deployment

### Backend Pod Environment Variables

Zorg dat je backend pod deze environment variables heeft:

- [ ] **Database configuratie** (kies één):
  - [ ] `DATABASE_URL` (volledige connection string)
  - [ ] OF alle `DB_*` variabelen: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SCHEMA`
  
- [ ] **Overige backend vars**:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5001`
  - [ ] `JWT_SECRET` (genereer met `openssl rand -base64 32`)
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `CORS_ORIGIN=https://your-site.netlify.app`

### Netlify Environment Variables

- [ ] `NEXT_PUBLIC_API_URL=https://your-backend-api-url.com` (publieke URL van je Kubernetes backend)

### Database Service in Kubernetes

- [ ] PostgreSQL service is bereikbaar vanuit backend pod
- [ ] Service name is correct (bijv. `postgres-service.default.svc.cluster.local`)
- [ ] Database credentials zijn correct
- [ ] Migraties zijn uitgevoerd

## Test de Configuratie

### 1. Test Backend Database Connectie

```bash
# Exec in backend pod
kubectl exec -it <backend-pod-name> -- npm run db:migrate:status

# Of test connectie handmatig
kubectl exec -it <backend-pod-name> -- node -e "
const { prisma } = require('./dist/config/database');
prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ DB OK')).catch(e => console.error('❌ DB Error:', e));
"
```

### 2. Test Frontend → Backend Connectie

1. Open Netlify site in browser
2. Open Developer Tools > Network tab
3. Probeer in te loggen
4. Check of requests naar `NEXT_PUBLIC_API_URL` gaan (niet naar localhost)
5. Check of er geen CORS errors zijn

### 3. Test Complete Flow

1. **Frontend**: Login op Netlify site
2. **Backend**: Check backend logs voor request
3. **Database**: Check of data wordt opgehaald/opgeslagen

## Veelvoorkomende Problemen

### ❌ Backend kan niet verbinden met database

**Oorzaken**:
- Service name is incorrect
- Database credentials zijn incorrect
- Network policies blokkeren connectie
- Database pod draait niet

**Oplossing**:
```bash
# Check service
kubectl get svc postgres-service

# Test connectie vanuit backend pod
kubectl exec -it <backend-pod> -- psql -h postgres-service.default.svc.cluster.local -U user -d database
```

### ❌ Frontend krijgt 503 errors

**Oorzaken**:
- `NEXT_PUBLIC_API_URL` is niet gezet in Netlify
- Backend pod draait niet
- Backend is niet publiek bereikbaar

**Oplossing**:
1. Check Netlify environment variables
2. Check backend pod status: `kubectl get pods`
3. Check backend logs: `kubectl logs <backend-pod>`
4. Test backend URL handmatig: `curl https://your-api-url.com/api/health`

### ❌ CORS errors

**Oorzaken**:
- `CORS_ORIGIN` bevat niet de Netlify URL
- Trailing slash in URL
- Meerdere origins niet correct geformatteerd

**Oplossing**:
- Check `CORS_ORIGIN` in backend environment variables
- Gebruik exacte Netlify URL (geen trailing slash)
- Voor meerdere: `https://prod.netlify.app,https://staging.netlify.app` (comma-separated, geen spaces)

## Samenvatting

✅ **Database configuratie**: Ondersteunt Kubernetes service names  
✅ **Frontend API configuratie**: Gebruikt `NEXT_PUBLIC_API_URL`  
✅ **CORS configuratie**: Ondersteunt Netlify origin  
✅ **Flow**: Frontend → Backend → Database (correct geïmplementeerd)  

**Alles is correct gekoppeld!** Zorg alleen dat:
1. Backend pod de juiste database environment variables heeft
2. Netlify de juiste `NEXT_PUBLIC_API_URL` heeft
3. CORS_ORIGIN de Netlify URL bevat

