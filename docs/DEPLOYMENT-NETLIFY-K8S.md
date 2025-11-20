# Deployment Guide: Netlify Frontend + Kubernetes Backend

Dit document beschrijft de volledige setup voor productie deployment:
- **Frontend**: Next.js app op Netlify
- **Backend**: Express API in Kubernetes
- **Database**: PostgreSQL in Kubernetes

## Overzicht

```
┌─────────────────┐
│  Netlify        │
│  (Frontend)     │ ──┐
└─────────────────┘   │
                       │ HTTPS
                       ▼
              ┌─────────────────┐
              │  Kubernetes      │
              │  (Backend API)   │
              └─────────────────┘
                       │
                       │ PostgreSQL
                       ▼
              ┌─────────────────┐
              │  Kubernetes      │
              │  (PostgreSQL)   │
              └─────────────────┘
```

## Wat is er veranderd?

### Backend Wijzigingen

1. **Database Configuratie** (`apps/api/src/config/database.ts`)
   - Ondersteunt nu zowel `DATABASE_URL` als losse `DB_*` variabelen
   - Automatische validatie in productie
   - Ondersteunt Kubernetes service names als host

2. **CORS Configuratie** (`apps/api/src/config/env.ts`)
   - Ondersteunt meerdere origins (comma-separated)
   - Automatische defaults voor lokale ontwikkeling
   - Validatie in productie (geen wildcards)

3. **Environment Variables**
   - Flexibele database configuratie
   - Verbeterde error messages bij ontbrekende configuratie

### Frontend Wijzigingen

1. **API Proxy Route** (`apps/web/app/api/[...path]/route.ts`)
   - Verbeterde error handling
   - Duidelijke foutmeldingen als `NEXT_PUBLIC_API_URL` ontbreekt in productie
   - Betere logging voor debugging

2. **Geen hardcoded localhost meer**
   - Alle API calls gaan via de Next.js proxy route
   - Proxy gebruikt `NEXT_PUBLIC_API_URL` voor backend URL

## Environment Variables Setup

### 1. Kubernetes Backend

Stel deze environment variables in in je Kubernetes deployment (via ConfigMap/Secrets):

#### Database Configuratie

**Optie A: DATABASE_URL (aanbevolen)**
```yaml
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: postgres-secret
        key: database-url
```

**Optie B: Losse DB_* variabelen**
```yaml
env:
  - name: DB_HOST
    value: "postgres-service.default.svc.cluster.local"
  - name: DB_PORT
    value: "5432"
  - name: DB_USER
    valueFrom:
      secretKeyRef:
        name: postgres-secret
        key: username
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: postgres-secret
        key: password
  - name: DB_NAME
    value: "vertrouwdbouwen"
  - name: DB_SCHEMA
    value: "public"
```

#### Overige Backend Variabelen

```yaml
env:
  - name: NODE_ENV
    value: "production"
  - name: PORT
    value: "5001"
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: api-secrets
        key: jwt-secret
  - name: JWT_EXPIRES_IN
    value: "7d"
  - name: CORS_ORIGIN
    value: "https://your-site.netlify.app"
```

**Belangrijk voor CORS_ORIGIN**:
- Gebruik de exacte Netlify URL waar je frontend draait
- Voor meerdere environments: `https://prod.netlify.app,https://staging.netlify.app`
- Geen trailing slash

### 2. Netlify Frontend

Stel deze environment variables in in Netlify UI (Site settings > Environment variables):

| Variable | Waarde | Beschrijving |
|----------|--------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.example.com` | Publieke URL van je Kubernetes backend API (zonder trailing slash) |

**Belangrijk**:
- Deze variabele is **verplicht** in productie
- Gebruik HTTPS URL (niet HTTP)
- Geen trailing slash
- Deze variabele wordt ingebouwd in de client bundle (is publiek)

### 3. Kubernetes Database (PostgreSQL)

Zorg dat je PostgreSQL service:
- Bereikbaar is vanuit de backend pod via service name
- Juiste credentials heeft
- Migraties zijn uitgevoerd

**Service Name Voorbeeld**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: default
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
```

Backend gebruikt dan: `DB_HOST=postgres-service.default.svc.cluster.local`

## Deployment Stappen

### Stap 1: Database Setup in Kubernetes

1. **Deploy PostgreSQL**:
   ```bash
   # Gebruik Helm chart of kubectl apply
   kubectl apply -f postgres-deployment.yaml
   ```

2. **Maak Secrets**:
   ```bash
   kubectl create secret generic postgres-secret \
     --from-literal=username=vertrouwdbouwen \
     --from-literal=password=your-secure-password \
     --from-literal=database-url=postgresql://vertrouwdbouwen:password@postgres-service.default.svc.cluster.local:5432/vertrouwdbouwen?schema=public
   ```

3. **Run Migraties**:
   ```bash
   # Via kubectl exec in backend pod
   kubectl exec -it backend-pod -- npm run db:migrate:deploy
   ```

### Stap 2: Backend Deployment in Kubernetes

1. **Build Docker Image** (als je Docker gebruikt):
   ```bash
   cd apps/api
   docker build -t your-registry/vertrouwdbouwen-api:latest .
   docker push your-registry/vertrouwdbouwen-api:latest
   ```

2. **Deploy Backend**:
   ```bash
   kubectl apply -f backend-deployment.yaml
   ```

3. **Expose Backend** (via LoadBalancer of Ingress):
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: api-service
   spec:
     type: LoadBalancer
     ports:
       - port: 80
         targetPort: 5001
     selector:
       app: backend-api
   ```

4. **Noteer de publieke URL**:
   - LoadBalancer: gebruik het externe IP
   - Ingress: gebruik je Ingress domain
   - Bijvoorbeeld: `https://api.yourdomain.com`

### Stap 3: Frontend Deployment op Netlify

1. **Push code naar GitHub**

2. **Netlify Setup**:
   - Import project vanuit GitHub
   - Build settings (automatisch via `netlify.toml`):
     - Base directory: `.` (root)
     - Build command: `npm run build:web`
     - Publish directory: `apps/web/.next`

3. **Environment Variables**:
   - Ga naar Site settings > Environment variables
   - Voeg toe: `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com` (of je LoadBalancer URL)

4. **Deploy**:
   - Klik "Deploy site"
   - Wacht tot build klaar is

### Stap 4: CORS Configuratie

Zorg dat `CORS_ORIGIN` in je backend de Netlify URL bevat:

```yaml
env:
  - name: CORS_ORIGIN
    value: "https://your-site.netlify.app"
```

Update de backend deployment en restart:
```bash
kubectl rollout restart deployment/backend-api
```

## Verificatie

### Test Checklist

- [ ] Frontend laadt op Netlify URL
- [ ] Login werkt (test met bestaande gebruiker)
- [ ] Registratie werkt
- [ ] API calls gaan naar Kubernetes backend (check Network tab)
- [ ] Geen CORS errors in browser console
- [ ] Cookies worden correct doorgestuurd
- [ ] Database queries werken (test project aanmaken)

### Debugging

**503 Service Unavailable**:
- Check of `NEXT_PUBLIC_API_URL` correct is ingesteld in Netlify
- Check of backend pod draait: `kubectl get pods`
- Check backend logs: `kubectl logs <pod-name>`
- Test backend URL handmatig: `curl https://your-api.example.com/api/health`

**CORS Errors**:
- Check of `CORS_ORIGIN` de Netlify URL bevat
- Check browser console voor specifieke CORS error
- Verifieer dat backend `Access-Control-Allow-Origin` header stuurt

**Database Connectie Problemen**:
- Check of PostgreSQL service bereikbaar is: `kubectl get svc postgres-service`
- Test connectie vanuit backend pod: `kubectl exec -it <pod> -- psql -h postgres-service -U user -d database`
- Check backend logs voor database errors

## Lokale Ontwikkeling

De setup blijft **volledig backwards compatible** voor lokale ontwikkeling:

### Backend
```bash
cd apps/api
# Gebruik lokale .env met DATABASE_URL of DB_* variabelen
npm run dev
```

### Frontend
```bash
cd apps/web
# Gebruik .env.local met NEXT_PUBLIC_API_URL=http://localhost:5001
npm run dev
```

Alles werkt nog steeds lokaal zoals voorheen!

## Samenvatting van Wijzigingen

### Gewijzigde Bestanden

**Backend**:
- `apps/api/src/config/database.ts` - Database configuratie met Kubernetes support
- `apps/api/src/config/env.ts` - CORS configuratie met meerdere origins
- `apps/api/src/server.ts` - CORS logging verbeterd

**Frontend**:
- `apps/web/app/api/[...path]/route.ts` - Verbeterde error handling en validatie

**Documentatie**:
- `apps/api/README-ARCHITECTURE.md` - Nieuwe architectuur documentatie
- `docs/DEPLOYMENT-NETLIFY-K8S.md` - Deze deployment guide
- `README.md` - Updated met nieuwe configuratie
- `apps/web/README.md` - Updated met environment variables info

### Nieuwe Environment Variables

**Backend (Kubernetes)**:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SCHEMA` (optioneel, als alternatief voor `DATABASE_URL`)
- `CORS_ORIGIN` (verplicht in productie)

**Frontend (Netlify)**:
- `NEXT_PUBLIC_API_URL` (verplicht in productie)

## Handmatige Stappen voor Deployment

### Kubernetes

1. **Maak Secrets**:
   ```bash
   kubectl create secret generic api-secrets \
     --from-literal=jwt-secret=$(openssl rand -base64 32)
   
   kubectl create secret generic postgres-secret \
     --from-literal=username=vertrouwdbouwen \
     --from-literal=password=your-password \
     --from-literal=database-url=postgresql://...
   ```

2. **Update Deployment YAML** met environment variables (zie boven)

3. **Deploy**:
   ```bash
   kubectl apply -f backend-deployment.yaml
   kubectl apply -f backend-service.yaml
   ```

4. **Run Migraties**:
   ```bash
   kubectl exec -it <backend-pod> -- npm run db:migrate:deploy
   ```

### Netlify

1. **Ga naar Netlify UI** > Site settings > Environment variables

2. **Voeg toe**:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-url.com`

3. **Redeploy** site (of wacht op volgende commit)

## Troubleshooting

Zie ook `docs/NETLIFY_DEPLOY.md` voor algemene troubleshooting tips.

### Veelvoorkomende Problemen

1. **Backend kan niet verbinden met database**:
   - Check service name en namespace
   - Verifieer dat PostgreSQL service draait
   - Test connectie vanuit pod

2. **Frontend krijgt 503 errors**:
   - Check `NEXT_PUBLIC_API_URL` in Netlify
   - Verifieer dat backend publiek bereikbaar is
   - Check backend pod status

3. **CORS errors**:
   - Check `CORS_ORIGIN` bevat Netlify URL
   - Verifieer geen trailing slash in URL
   - Check backend logs voor CORS configuratie

## Best Practices

1. **Security**:
   - Gebruik Secrets voor gevoelige data (JWT_SECRET, DB_PASSWORD)
   - Gebruik HTTPS in productie
   - Beperk CORS_ORIGIN tot specifieke URLs

2. **Monitoring**:
   - Monitor backend pod logs
   - Monitor database connecties
   - Set up health checks voor backend en database

3. **Backups**:
   - Regelmatige database backups
   - Backup van Kubernetes Secrets

4. **Updates**:
   - Test wijzigingen eerst lokaal
   - Deploy naar staging environment eerst
   - Gebruik rolling updates voor zero-downtime deployments

