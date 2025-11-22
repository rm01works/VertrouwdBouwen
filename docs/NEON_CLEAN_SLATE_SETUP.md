# Neon Clean Slate Setup Guide

This guide provides step-by-step instructions for setting up a fresh Neon PostgreSQL database for the VertrouwdBouwen platform.

---

## Overview

You have two options:

- **Option A**: Create a new database in your existing Neon project
- **Option B**: Create a completely new Neon project

Both options will result in a clean database with a new connection string.

---

## Option A: New Database in Existing Project

### Step 1: Access Neon Dashboard

1. Go to [console.neon.tech](https://console.neon.tech)
2. Log in to your account
3. Select your existing project

### Step 2: Create New Database

1. In your Neon project, go to **Databases** section
2. Click **Create Database**
3. Enter a name (e.g., `vertrouwdbouwen_prod` or `vertrouwdbouwen_clean`)
4. Click **Create**

### Step 3: Get Connection String

1. After creating the database, click on it
2. Go to **Connection Details** or **Connection String**
3. Copy the connection string
4. Format should be: `postgres://user:password@host.neon.tech/dbname?sslmode=require`

### Step 4: Update Environment Variables

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update `DATABASE_URL` with the new connection string
3. Set for all environments (Production, Preview, Development)

### Step 5: Run Prisma Migrations

```bash
# Navigate to API directory
cd apps/api

# Set DATABASE_URL (or use .env.local)
export DATABASE_URL="postgres://user:pass@host.neon.tech/db?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

**Or use the provided script:**

```bash
# From project root
./scripts/db-migrate.sh
```

### Step 6: Verify Setup

```bash
# Test database connection
cd apps/api
npx prisma db pull

# If successful, you should see schema information
```

---

## Option B: New Neon Project

### Step 1: Create New Neon Account/Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in
3. Click **Create Project**
4. Enter project name (e.g., `vertrouwdbouwen`)
5. Select region (choose closest to your users)
6. Click **Create Project**

### Step 2: Get Connection String

1. After project creation, you'll see the connection string
2. Copy it immediately (format: `postgres://user:password@host.neon.tech/dbname?sslmode=require`)
3. **Important**: Save this connection string securely

### Step 3: Configure Vercel Environment Variables

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL`:
   - **Type**: Secret
   - **Value**: Your new Neon connection string
   - **Environments**: Production, Preview, Development
3. Click **Save**

### Step 4: Run Prisma Migrations

```bash
# Navigate to API directory
cd apps/api

# Set DATABASE_URL
export DATABASE_URL="postgres://user:pass@host.neon.tech/db?sslmode=require"

# Run migrations to create all tables
npx prisma migrate deploy
```

**Expected output:**
```
Applying migration `20240101000000_init`
✅ Migration applied successfully
```

### Step 5: Verify Database Schema

```bash
# Check database structure
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can view your database tables.

### Step 6: Test Registration Endpoint

1. Deploy to Vercel (or test locally)
2. Try registering a new user via `/api/auth/register`
3. Check Vercel function logs for any errors
4. Verify user was created in database (via Prisma Studio or Neon dashboard)

---

## Database Migration Script

A helper script is provided to run migrations:

```bash
# From project root
./scripts/db-migrate.sh
```

**What it does:**
1. Checks if `DATABASE_URL` is set
2. Runs `npx prisma migrate deploy`
3. Provides clear error messages if something fails

**Manual alternative:**

```bash
cd apps/api
npx prisma migrate deploy
```

---

## Connection String Format

### Correct Format

```
postgres://user:password@ep-xxxxx-xxxxx.region.neon.tech/dbname?sslmode=require
```

### Common Issues

❌ **Wrong**: Includes `channel_binding=require`
```
postgres://...?sslmode=require&channel_binding=require
```
✅ **Fix**: Remove `channel_binding=require`

❌ **Wrong**: Missing `sslmode=require`
```
postgres://user:pass@host.neon.tech/db
```
✅ **Fix**: Add `?sslmode=require`

❌ **Wrong**: Uses `postgresql://` (with `ql`)
```
postgresql://user:pass@host.neon.tech/db?sslmode=require
```
✅ **Fix**: Use `postgres://` (without `ql`) for Neon

---

## Troubleshooting

### Migration Fails with "Database does not exist"

1. Check connection string is correct
2. Verify database name in connection string matches actual database name
3. Try creating database manually in Neon dashboard

### Migration Fails with "Connection timeout"

1. Check if Neon database is paused (free tier pauses after inactivity)
2. Wake up database in Neon dashboard
3. Retry migration

### Migration Fails with "Authentication failed"

1. Verify connection string credentials are correct
2. Check if database user has proper permissions
3. Try generating a new connection string in Neon dashboard

### "Prisma Client not generated"

```bash
cd apps/api
npx prisma generate
```

---

## Cleanup Old Database (Optional)

If you're replacing an old database:

1. **Backup first** (if needed):
   ```bash
   pg_dump "old-connection-string" > backup.sql
   ```

2. **Delete old database** in Neon dashboard:
   - Go to Databases section
   - Click on old database
   - Click Delete
   - Confirm deletion

3. **Remove old connection strings** from Vercel:
   - Go to Environment Variables
   - Update `DATABASE_URL` with new connection string

---

## Next Steps

After setting up the database:

1. ✅ Run migrations (`npx prisma migrate deploy`)
2. ✅ Update Vercel environment variables
3. ✅ Test registration endpoint
4. ✅ Verify database connection in Vercel logs
5. ✅ Remove unused environment variables (see [ENV_SETUP.md](./ENV_SETUP.md))

---

## Related Documentation

- [Environment Variables Setup](./ENV_SETUP.md) - Complete env var guide
- [Prisma Setup](./NEON_PRISMA_SETUP.md) - Prisma configuration
- [Vercel Deployment](./VERCEL_DEPLOYMENT_QUICKSTART.md) - Deployment guide

