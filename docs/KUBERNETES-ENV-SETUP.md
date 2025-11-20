# Kubernetes Environment Variables Setup

## Huidige .env vs Kubernetes Configuratie

Je huidige `.env` in `apps/api/.env` is geconfigureerd voor **lokale ontwikkeling**:
```env
DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen?schema=public
```

Voor **Kubernetes** moet je dit aanpassen naar de Kubernetes service name.

## ✅ Configuratie Check: Alles is Correct Gekoppeld!

De codebase ondersteunt beide configuratie methoden:

### Methode 1: DATABASE_URL (aanbevolen)

Voor Kubernetes, pas `DATABASE_URL` aan naar je service name:

```env
# In Kubernetes backend pod
DATABASE_URL=postgresql://vertrouwdbouwen:password@postgres-service.default.svc.cluster.local:5432/vertrouwdbouwen?schema=public
```

**Waar**:
- `postgres-service` = naam van je PostgreSQL service in Kubernetes
- `default` = namespace (pas aan als je een andere namespace gebruikt)
- `svc.cluster.local` = Kubernetes internal DNS suffix

### Methode 2: Losse DB_* Variabelen

Alternatief, gebruik losse variabelen:

```env
# In Kubernetes backend pod
DB_HOST=postgres-service.default.svc.cluster.local
DB_PORT=5432
DB_USER=vertrouwdbouwen
DB_PASSWORD=password
DB_NAME=vertrouwdbouwen
DB_SCHEMA=public
```

## Hoe de Configuratie Werkt

De backend code (`apps/api/src/config/database.ts`) doet het volgende:

1. **Checkt eerst op `DATABASE_URL`**: Als deze gezet is, gebruikt het die
2. **Anders bouwt het `DATABASE_URL` uit losse variabelen**: Als `DB_HOST`, `DB_USER`, etc. gezet zijn
3. **Valideert in productie**: Gooit een error als benodigde variabelen ontbreken
4. **Gebruikt Prisma met de gegenereerde URL**: Prisma verbindt met de database

## Kubernetes Deployment Setup

### Stap 1: Maak Secrets

```bash
# Maak secret voor database credentials
kubectl create secret generic postgres-secret \
  --from-literal=username=vertrouwdbouwen \
  --from-literal=password=your-secure-password \
  --from-literal=database-url=postgresql://vertrouwdbouwen:password@postgres-service.default.svc.cluster.local:5432/vertrouwdbouwen?schema=public

# Maak secret voor JWT
kubectl create secret generic api-secrets \
  --from-literal=jwt-secret=$(openssl rand -base64 32)
```

### Stap 2: Update Deployment YAML

**Optie A: Gebruik DATABASE_URL uit Secret**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  template:
    spec:
      containers:
      - name: api
        image: your-registry/backend-api:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: jwt-secret
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5001"
        - name: JWT_EXPIRES_IN
          value: "7d"
        - name: CORS_ORIGIN
          value: "https://your-site.netlify.app"
```

**Optie B: Gebruik Losse DB_* Variabelen**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  template:
    spec:
      containers:
      - name: api
        image: your-registry/backend-api:latest
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
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: jwt-secret
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5001"
        - name: JWT_EXPIRES_IN
          value: "7d"
        - name: CORS_ORIGIN
          value: "https://your-site.netlify.app"
```

## Test de Configuratie

### 1. Check Database Service Name

```bash
# Vind je PostgreSQL service
kubectl get svc | grep postgres

# Output zal iets zijn als:
# postgres-service   ClusterIP   10.96.xxx.xxx   5432/TCP
```

De service name is wat je gebruikt in `DB_HOST` of `DATABASE_URL`.

### 2. Test Database Connectie vanuit Backend Pod

```bash
# Exec in backend pod
kubectl exec -it <backend-pod-name> -- sh

# Test Prisma connectie
cd /app
node -e "
const { prisma } = require('./dist/config/database');
prisma.\$queryRaw\`SELECT 1\`
  .then(() => console.log('✅ Database connectie OK'))
  .catch(e => console.error('❌ Database error:', e.message));
"
```

### 3. Check Environment Variables in Pod

```bash
# Check of alle vars gezet zijn
kubectl exec <backend-pod-name> -- env | grep -E "DB_|DATABASE_URL|JWT|CORS"
```

## Complete Flow Check

```
✅ Netlify Frontend
   └─> NEXT_PUBLIC_API_URL=https://your-backend-api.com
       └─> Kubernetes Backend API Pod
           └─> DATABASE_URL of DB_* vars
               └─> postgres-service.default.svc.cluster.local
                   └─> Kubernetes PostgreSQL Database
```

## Samenvatting

✅ **Code is correct gekoppeld**: De backend code ondersteunt beide configuratie methoden  
✅ **Kubernetes service names worden ondersteund**: Gebruik service name in `DB_HOST` of `DATABASE_URL`  
✅ **Validatie werkt**: Productie gooit errors als configuratie ontbreekt  
✅ **Flexibel**: Kies tussen `DATABASE_URL` of losse `DB_*` variabelen  

**Wat je moet doen**:
1. Vervang `localhost` in je `.env` met de Kubernetes service name (voor Kubernetes deployment)
2. Of gebruik losse `DB_*` variabelen in je Kubernetes deployment YAML
3. Zorg dat `CORS_ORIGIN` je Netlify URL bevat
4. Gebruik Kubernetes Secrets voor gevoelige data

De configuratie is **volledig klaar** voor Kubernetes! 🚀

