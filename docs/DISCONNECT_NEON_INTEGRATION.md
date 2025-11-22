# How to Disconnect Neon Integration and Clean Up Environment Variables

## Problem

When you connect a Neon project to Vercel via the integration, Vercel automatically creates and syncs many environment variables. These variables are "locked" by the integration, so you can't delete them individually.

**Error message you see:**
> "You can remove this environment variable by disconnecting the project from the connected store."

## Solution: Disconnect the Integration

### Step 1: Disconnect Neon Integration

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to **Settings** → **Integrations**

2. **Find Neon Integration**
   - Look for "Neon" in the list of connected integrations
   - Or go to: **Settings** → **Integrations** → **Browse Integrations** → Find "Neon"

3. **Disconnect**
   - Click on the Neon integration
   - Click **Disconnect** or **Remove Integration**
   - Confirm the disconnection

**Alternative path:**
- Go to **Settings** → **Environment Variables**
- Look for a notice about "Connected Store" or "Neon Integration"
- Click **Disconnect** or **Manage Integration**

### Step 2: Delete Environment Variables

After disconnecting, you can now delete the variables:

1. **Go to Environment Variables**
   - **Settings** → **Environment Variables**

2. **Delete All Unused Variables**
   
   Delete these (they're auto-generated and not used in code):
   - ❌ `POSTGRES_URL`
   - ❌ `POSTGRES_PRISMA_URL`
   - ❌ `DATABASE_URL_UNPOOLED`
   - ❌ `POSTGRES_URL_NON_POOLING`
   - ❌ `PGHOST`
   - ❌ `POSTGRES_USER`
   - ❌ `POSTGRES_PASSWORD`
   - ❌ `POSTGRES_DATABASE`
   - ❌ `PGPASSWORD`
   - ❌ `PGDATABASE`
   - ❌ `PGHOST_UNPOOLED`
   - ❌ `PGUSER`
   - ❌ `POSTGRES_URL_NO_SSL`
   - ❌ `POSTGRES_HOST`
   - ❌ `NEON_PROJECT_ID`

3. **Keep Only What You Need**
   
   For now, you can delete `DATABASE_URL` too (we'll add it back manually with the correct format).

### Step 3: Clean Slate Complete

After deleting all variables, you'll have a clean slate. Then follow the setup guide to add only the required variables manually.

---

## Alternative: Manual Cleanup (If Integration Won't Disconnect)

If you can't find the disconnect option, try this:

1. **Go to Neon Dashboard**
   - [console.neon.tech](https://console.neon.tech)
   - Find your project
   - Go to **Settings** → **Integrations** or **Vercel Integration**
   - Disconnect from Neon side

2. **Then go back to Vercel**
   - The variables should now be unlocked
   - Delete them manually

---

## After Cleanup: Fresh Setup

Once you have a clean slate:

1. **Add Required Variables Manually:**
   - `DATABASE_URL` (Secret) - Get from Neon Dashboard → Connection String
   - `JWT_SECRET` (Secret) - Generate with `openssl rand -base64 32`
   - `NEXT_PUBLIC_API_URL` (Plain Text) - Your backend API URL
   - `NODE_ENV` (Plain Text) - Set to `production`

2. **Follow Setup Guide:**
   - See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions
   - See [NEON_CLEAN_SLATE_SETUP.md](./NEON_CLEAN_SLATE_SETUP.md) for database setup

---

## Why This Happens

The Neon integration automatically syncs environment variables to make setup easier. However, it creates many variables that our codebase doesn't use (we only use `DATABASE_URL`). 

By disconnecting and manually adding only what we need, we get:
- ✅ Clean, minimal configuration
- ✅ No confusion about which variable to use
- ✅ Full control over environment variables
- ✅ Better security (only expose what's needed)

---

## Troubleshooting

### "Can't find Integration settings"

Try these paths:
- **Settings** → **Integrations** → **Browse** → Find "Neon"
- **Project Settings** → **Integrations**
- Look for a banner/notice in Environment Variables page about connected stores

### "Integration still connected after disconnecting"

1. Refresh the Vercel dashboard
2. Check if variables are still locked
3. If yes, try disconnecting from Neon dashboard side
4. Wait a few minutes and try again

### "Variables still locked"

1. Make sure you disconnected from both sides (Vercel and Neon)
2. Wait a few minutes for sync
3. Try deleting variables again
4. If still locked, contact Vercel support

---

## Next Steps

After cleanup:
1. ✅ All unused variables deleted
2. ✅ Clean slate achieved
3. ✅ Ready for fresh setup
4. → Follow [QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)

