# Vercel Registration 500 Error Fix

**Date**: 2025-11-22  
**Issue**: Registration endpoint returning 500 Internal Server Error with empty response body on Vercel deployment

## 🔍 Root Cause Analysis

The error occurred due to several issues:

1. **Express API not configured for Vercel serverless functions**
   - Vercel requires a specific handler format for Express apps
   - The API was using a traditional Express server setup (`server.ts`) which doesn't work in serverless environments

2. **Error handler not always sending responses**
   - In serverless environments, if an error occurs and no response is sent, Vercel returns an empty 500 error
   - The error handler needed better error catching and response guarantees

3. **Insufficient error logging**
   - Prisma errors weren't being properly logged with all details
   - Database connection errors weren't being caught and handled properly

## ✅ Fixes Applied

### 1. Created Vercel Serverless Function Handler

**File**: `apps/api/api/index.ts`
- Created a serverless function entry point that exports the Express app
- Vercel's `@vercel/node` builder automatically handles Express apps

### 2. Added Vercel Configuration

**File**: `apps/api/vercel.json`
- Configured Vercel to use `@vercel/node` builder
- Set function timeout to 30 seconds (default is 10s)
- Configured routing to handle all requests through the Express app

### 3. Improved Error Handler

**File**: `apps/api/src/middleware/errorHandler.ts`
- Added check to prevent double response sending
- Enhanced error logging with full error details
- Added better Prisma error code detection
- Ensured error handler always sends a response, even if it fails
- Added fallback error response if handler itself fails

### 4. Enhanced Controller Error Logging

**File**: `apps/api/src/controllers/auth.controller.ts`
- Added detailed error logging including Prisma error codes
- Log error cause and metadata for better debugging

### 5. Improved Service Error Handling

**File**: `apps/api/src/services/auth.service.ts`
- Added specific handling for Prisma error codes (P2002, P1001, etc.)
- Better error messages for common database errors
- Enhanced logging for database operations

### 6. Updated Database Configuration

**File**: `apps/api/src/config/database.ts`
- Added comments about serverless connection handling
- Ensured singleton pattern works correctly in serverless environments

## 🚀 Deployment Steps

### Prerequisites

1. **Neon Database**: Ensure you have a Neon PostgreSQL database with connection string
2. **Vercel Account**: Set up Vercel project for the API

### Step 1: Configure Environment Variables in Vercel

Go to your Vercel project settings and add:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=<generate-with-openssl-rand-base64-32>
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
PORT=5001
```

**Important**: 
- Use the Neon connection string with `?sslmode=require`
- Generate a secure JWT_SECRET (minimum 32 characters)
- Set CORS_ORIGIN to your frontend URL

### Step 2: Deploy API to Vercel

1. **Set Root Directory**: In Vercel project settings, set root directory to `apps/api`

2. **Build Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave empty - not used for serverless)
   - **Install Command**: `npm install` (automatically runs `prisma generate` via postinstall)

3. **Deploy**: Push to your Git repository or deploy via Vercel CLI:
   ```bash
   cd apps/api
   vercel --prod
   ```

### Step 3: Run Database Migrations

After deployment, run migrations:

```bash
# Pull environment variables
vercel env pull

# Run migrations
cd apps/api
npx prisma migrate deploy
```

Or add to build command (not recommended for production):
```json
{
  "build": "prisma generate && prisma migrate deploy && tsc"
}
```

### Step 4: Update Frontend API URL

In your frontend Vercel project, set:
```
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
API_BASE_URL=https://your-api.vercel.app
```

## 🧪 Testing

### Test Registration Endpoint

```bash
curl -X POST https://your-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User",
    "role": "CUSTOMER"
  }'
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "Registratie succesvol",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "role": "CUSTOMER",
      ...
    }
  }
}
```

### Expected Response (Error)

```json
{
  "success": false,
  "error": {
    "message": "Email is al in gebruik"
  }
}
```

## 🔍 Debugging

### Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on the function that failed
3. Check "Logs" tab for detailed error messages

### Common Issues

1. **Empty 500 Response**
   - Check if DATABASE_URL is set correctly
   - Verify Neon database is accessible
   - Check Vercel function logs for Prisma errors

2. **Database Connection Errors**
   - Ensure DATABASE_URL includes `?sslmode=require`
   - Verify database credentials are correct
   - Check if database is paused (Neon free tier pauses after inactivity)

3. **Prisma Client Not Generated**
   - Ensure `postinstall` script runs: `prisma generate`
   - Check build logs for Prisma generation errors

4. **CORS Errors**
   - Verify CORS_ORIGIN matches your frontend URL exactly
   - Check if frontend is making requests to correct API URL

## 📝 Files Changed

- ✅ `apps/api/api/index.ts` (new) - Vercel serverless function handler
- ✅ `apps/api/vercel.json` (new) - Vercel configuration
- ✅ `apps/api/src/middleware/errorHandler.ts` - Enhanced error handling
- ✅ `apps/api/src/controllers/auth.controller.ts` - Better error logging
- ✅ `apps/api/src/services/auth.service.ts` - Improved Prisma error handling
- ✅ `apps/api/src/config/database.ts` - Serverless-friendly configuration

## ✅ Verification Checklist

- [ ] API deployed to Vercel successfully
- [ ] Environment variables set correctly
- [ ] Database migrations run successfully
- [ ] Registration endpoint returns proper JSON responses (not empty)
- [ ] Error responses include error messages
- [ ] Vercel function logs show detailed error information
- [ ] Frontend can successfully register users

## 🎯 Next Steps

1. Monitor Vercel function logs for any remaining issues
2. Set up error tracking (e.g., Sentry) for production
3. Add rate limiting to prevent abuse
4. Consider adding request/response logging middleware for debugging

---

**Status**: ✅ Fixed - Ready for deployment

