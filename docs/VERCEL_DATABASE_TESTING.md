# Testing Database Connection from Vercel

This guide shows you how to test if your Neon database is properly connected and working from your Vercel deployment.

## 📋 Prerequisites

Before testing, make sure you have:

1. ✅ Neon database created and connection string ready
2. ✅ Backend API deployed (on Vercel or separate service)
3. ✅ Frontend deployed on Vercel
4. ✅ Environment variables configured

## 🔧 Step 1: Configure Environment Variables in Vercel

### For Frontend (Next.js on Vercel)

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api-url.com` | URL of your backend API (without trailing slash) |
| `API_BASE_URL` | `https://your-backend-api-url.com` | Server-side API URL (optional, same as above) |

**Example:**
```
NEXT_PUBLIC_API_URL=https://vertrouwdbouwen-api.vercel.app
```

### For Backend API (if deployed separately)

If your backend is deployed on a separate service (Render, Railway, etc.), add these environment variables there:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require` | Your Neon connection string |
| `JWT_SECRET` | `your-secure-random-string` | Secret for JWT tokens (generate with `openssl rand -base64 32`) |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration time |
| `CORS_ORIGIN` | `https://your-vercel-app.vercel.app` | Your Vercel frontend URL |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5001` or auto | Server port (if needed) |

**Important Notes:**
- Remove `channel_binding=require` from the connection string (Prisma doesn't need it)
- Use `sslmode=require` for secure connections
- Make sure `CORS_ORIGIN` matches your Vercel frontend URL exactly

## 🧪 Step 2: Test Database Connection

### Option A: Test via Health Check Endpoint

The easiest way to test if the database is connected is via the health check endpoint.

**From Browser:**
```
https://your-backend-api-url.com/api/health
```

**Expected Response (Success):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

**Expected Response (Failure):**
```json
{
  "status": "error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "disconnected",
  "error": "Error message here"
}
```

**From Terminal (curl):**
```bash
curl https://your-backend-api-url.com/api/health
```

**From Browser Console (on your Vercel site):**
```javascript
fetch('https://your-backend-api-url.com/api/health')
  .then(res => res.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Error:', err));
```

### Option B: Test via Frontend Proxy

If your frontend is on Vercel and proxies to the backend:

**From Browser:**
```
https://your-vercel-app.vercel.app/api/health
```

This will proxy through Next.js to your backend API.

## 🧪 Step 3: Test User Registration

### Option A: Test via Frontend UI

1. Go to your Vercel deployment: `https://your-vercel-app.vercel.app`
2. Navigate to the registration page (usually `/register`)
3. Fill in the registration form:
   - **Email**: `test@example.com`
   - **Password**: `TestPass123` (must have uppercase, lowercase, and number)
   - **Role**: `CUSTOMER` or `CONTRACTOR`
   - **First Name**: `Test`
   - **Last Name**: `User`
   - **Phone**: (optional)
   - **Company Name**: (required if role is `CONTRACTOR`)
4. Submit the form
5. Check browser console (F12) for any errors
6. If successful, you should be redirected or see a success message

### Option B: Test via API Directly (curl)

**Register a Customer:**
```bash
curl -X POST https://your-backend-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "CUSTOMER",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+31612345678"
  }'
```

**Register a Contractor:**
```bash
curl -X POST https://your-backend-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor@example.com",
    "password": "TestPass123",
    "role": "CONTRACTOR",
    "firstName": "John",
    "lastName": "Contractor",
    "companyName": "Test Construction BV",
    "kvkNumber": "12345678",
    "phone": "+31612345678"
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Registratie succesvol",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "role": "CUSTOMER",
      "firstName": "Test",
      "lastName": "User",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Option C: Test via Browser Console

Open browser console on your Vercel site and run:

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPass123',
    role: 'CUSTOMER',
    firstName: 'Test',
    lastName: 'User'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Registration result:', data);
    if (data.success) {
      console.log('✅ Registration successful!');
      console.log('User ID:', data.data.user.id);
    } else {
      console.error('❌ Registration failed:', data.error);
    }
  })
  .catch(err => console.error('Error:', err));
```

## 🔍 Step 4: Verify User Was Created

### Option A: Check via Login

Try to login with the credentials you just registered:

```bash
curl -X POST https://your-backend-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Option B: Check Database Directly

If you have access to Prisma Studio or database tools:

```bash
# Locally, if you have DATABASE_URL set
cd apps/api
npx prisma studio
```

Or use Neon's SQL editor in their dashboard.

### Option C: Check via API

```bash
# First login to get token
TOKEN=$(curl -X POST https://your-backend-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}' \
  -c cookies.txt | jq -r '.data.token')

# Then check your profile
curl https://your-backend-api-url.com/api/auth/me \
  -H "Cookie: token=$TOKEN"
```

## 🐛 Troubleshooting

### ❌ Health Check Returns "disconnected"

**Possible Causes:**
1. `DATABASE_URL` not set in backend environment variables
2. Connection string is incorrect
3. Database is not accessible from backend server
4. SSL/TLS issues

**Solutions:**
1. Check Vercel/backend environment variables
2. Verify connection string format (should start with `postgresql://`)
3. Check Neon dashboard to ensure database is active
4. Try removing `channel_binding=require` from connection string
5. Check backend logs for detailed error messages

### ❌ Registration Returns 500 Error

**Possible Causes:**
1. Database connection issue
2. Missing required fields
3. Validation errors
4. JWT_SECRET not set

**Solutions:**
1. Check backend logs (Vercel → Functions → Logs)
2. Verify all required fields are sent
3. Check password meets requirements (min 8 chars, uppercase, lowercase, number)
4. Ensure `JWT_SECRET` is set in backend environment variables

### ❌ CORS Errors

**Possible Causes:**
1. `CORS_ORIGIN` not set correctly in backend
2. Frontend URL doesn't match `CORS_ORIGIN`
3. Missing trailing slash or protocol mismatch

**Solutions:**
1. Set `CORS_ORIGIN` to your exact Vercel URL: `https://your-app.vercel.app`
2. No trailing slash in `CORS_ORIGIN`
3. For multiple environments: `https://prod.vercel.app,https://staging.vercel.app` (comma-separated)

### ❌ "Backend API server is niet bereikbaar"

**Possible Causes:**
1. `NEXT_PUBLIC_API_URL` not set in Vercel
2. Backend API is not deployed
3. Backend URL is incorrect

**Solutions:**
1. Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Verify backend is deployed and running
3. Test backend URL directly: `curl https://your-backend-url.com/api/health`

## ✅ Success Checklist

- [ ] Health check endpoint returns `"database": "connected"`
- [ ] Can register a new user via frontend
- [ ] Can register a new user via API (curl)
- [ ] Can login with registered credentials
- [ ] User appears in database (via Prisma Studio or Neon dashboard)
- [ ] No CORS errors in browser console
- [ ] No 500 errors in backend logs

## 📝 Quick Test Commands

**Test Health:**
```bash
curl https://your-backend-api-url.com/api/health
```

**Test Registration:**
```bash
curl -X POST https://your-backend-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","role":"CUSTOMER","firstName":"Test","lastName":"User"}'
```

**Test Login:**
```bash
curl -X POST https://your-backend-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

## 🔗 Useful Links

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Dashboard](https://console.neon.tech)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Last Updated**: 2024-01-15

