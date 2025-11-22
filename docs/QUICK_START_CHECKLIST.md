# Quick Start Checklist - Vercel + Neon Setup

Use this checklist to quickly set up your production environment after the architecture cleanup.

---

## ✅ Pre-Deployment Checklist

### 0. Clean Slate: Disconnect Neon Integration (If Needed)

If you have many auto-generated environment variables that are locked:
- [ ] **Disconnect Neon Integration** (see [DISCONNECT_NEON_INTEGRATION.md](./DISCONNECT_NEON_INTEGRATION.md))
- [ ] Delete all unused variables
- [ ] Start with clean slate

**Quick steps:**
1. Go to Vercel → **Settings** → **Integrations**
2. Find "Neon" integration → **Disconnect**
3. Go to **Settings** → **Environment Variables**
4. Delete all unused variables (they'll be unlocked after disconnecting)

### 1. Environment Variables in Vercel

- [ ] **DATABASE_URL** (Secret)
  - Value: Neon PostgreSQL connection string
  - Format: `postgres://user:pass@host.neon.tech/db?sslmode=require`
  - Set for: Production, Preview, Development

- [ ] **JWT_SECRET** (Secret)
  - Value: Generated with `openssl rand -base64 32`
  - Set for: Production, Preview, Development

- [ ] **NEXT_PUBLIC_API_URL** (Plain Text)
  - Value: Your backend API URL (e.g., `https://your-api.vercel.app`)
  - Set for: Production, Preview

- [ ] **NODE_ENV** (Plain Text)
  - Value: `production`
  - Set for: Production, Preview

### 2. Remove Unused Variables

Delete these from Vercel (they're not used in code):
- [ ] `DATABASE_URL_UNPOOLED`
- [ ] `NEON_PROJECT_ID`
- [ ] `PGDATABASE`, `PGHOST`, `PGHOST_UNPOOLED`, `PGPASSWORD`, `PGUSER`
- [ ] `POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`
- [ ] `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`
- [ ] `POSTGRES_URL_NO_SSL`, `POSTGRES_USER`
- [ ] `VERCEL_OIDC_TOKEN` (if not used elsewhere)

### 3. Neon Database

- [ ] Neon database created and accessible
- [ ] Connection string copied
- [ ] Database is not paused (wake it up if needed)

### 4. Database Migrations

- [ ] Run migrations: `cd apps/api && npx prisma migrate deploy`
- [ ] Verify schema: `npx prisma db pull` (should succeed)
- [ ] Optional: View database: `npx prisma studio`

---

## 🚀 Deployment Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "chore: architecture cleanup and registration hardening"
   git push
   ```

2. **Vercel will auto-deploy** (if connected to Git)

3. **Or deploy manually:**
   ```bash
   vercel --prod
   ```

---

## 🧪 Post-Deployment Testing

### Test Registration Endpoint

1. **Via Frontend:**
   - Go to registration page
   - Fill in form and submit
   - Should succeed and redirect

2. **Via API (curl):**
   ```bash
   curl -X POST https://your-api.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123",
       "role": "CUSTOMER",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Registratie succesvol",
     "data": {
       "user": {
         "id": "...",
         "email": "test@example.com",
         ...
       }
     }
   }
   ```

### Verify Error Handling

1. **Test duplicate email:**
   - Try registering same email twice
   - Should return 409 with JSON error message

2. **Test missing fields:**
   - Submit incomplete form
   - Should return 400 with JSON error message

3. **Check Vercel Logs:**
   - Go to Vercel → Your Project → Functions → Logs
   - Should see detailed error logs (no empty 500s)

---

## 🔍 Verification Checklist

- [ ] Registration endpoint returns JSON (never empty)
- [ ] Error responses are proper JSON with helpful messages
- [ ] Users are created in database
- [ ] JWT tokens are set in cookies
- [ ] No 500 errors with empty body
- [ ] Vercel logs show detailed error messages
- [ ] Database connection is stable

---

## 📚 Documentation

For detailed instructions, see:

- [Disconnect Neon Integration](./DISCONNECT_NEON_INTEGRATION.md) - **Start here if variables are locked**
- [Environment Variables Setup](./ENV_SETUP.md)
- [Neon Clean Slate Setup](./NEON_CLEAN_SLATE_SETUP.md)
- [Architecture Cleanup Summary](./ARCHITECTURE_CLEANUP_SUMMARY.md)

---

## 🆘 Troubleshooting

### Registration returns empty 500

1. Check Vercel function logs
2. Verify `DATABASE_URL` is set correctly
3. Verify `JWT_SECRET` is set
4. Check Neon database is not paused

### "DATABASE_URL is not set"

1. Go to Vercel → Settings → Environment Variables
2. Verify `DATABASE_URL` is set for correct environment
3. Redeploy after adding variable

### Database connection fails

1. Verify connection string format
2. Check Neon dashboard for database status
3. Test connection: `npx prisma db pull`

---

## ✨ Success Criteria

You're done when:

- ✅ Registration works in production
- ✅ All errors return JSON (never empty)
- ✅ Environment variables are minimal and clean
- ✅ Database migrations are applied
- ✅ No unused env vars in Vercel
- ✅ Vercel logs show clear error messages

