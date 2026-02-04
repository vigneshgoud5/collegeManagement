# Login Testing and Troubleshooting Guide

## Issue Found

The preview deployment URL (`college-management-uz389v4sy-vigneshgouds-projects.vercel.app`) has **Vercel Authentication Protection** enabled. This requires authentication to access the deployment.

## Solutions

### Option 1: Use Production Deployment (Recommended)

Use the main production URL instead of the preview URL:
- **Production URL**: `https://college-management-blond.vercel.app`
- Preview URLs are protected by default in Vercel

### Option 2: Disable Preview Protection

1. Go to **Vercel Dashboard** → Your Project
2. Navigate to **Settings** → **Deployment Protection**
3. Disable protection for preview deployments (or add bypass token)

### Option 3: Use Bypass Token

If you need to test the preview deployment:
1. Get bypass token from Vercel dashboard
2. Add `?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN` to URL

## Testing Login Functionality

### Test Credentials
- **Email**: `pradeep71@gmail.com`
- **Password**: `23831a0571`
- **Role**: `student`

### Step 1: Check Environment Variables

Ensure these are set in Vercel:

1. **VITE_API_BASE_URL** (Critical!)
   ```
   VITE_API_BASE_URL=https://college-management-blond.vercel.app/api
   ```
   - This tells the frontend where to send API requests
   - If missing, it defaults to `http://localhost:3000/api` (won't work!)

2. **CLIENT_ORIGIN**
   ```
   CLIENT_ORIGIN=https://college-management-blond.vercel.app
   ```
   - Required for CORS to work

3. **MONGO_URI**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college_portal?retryWrites=true&w=majority
   ```

4. **JWT Secrets**
   ```
   JWT_ACCESS_SECRET=your_secret_here
   JWT_REFRESH_SECRET=your_secret_here
   ```

### Step 2: Verify API Endpoint

Test the login endpoint directly:

```bash
# Test production URL
curl -X POST "https://college-management-blond.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"pradeep71@gmail.com","password":"23831a0571","role":"student"}' \
  -v
```

**Expected Response (Success):**
```json
{
  "user": {
    "id": "...",
    "email": "pradeep71@gmail.com",
    "role": "student",
    ...
  }
}
```

**Expected Response (Error):**
```json
{
  "message": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to login
4. Look for errors:
   - CORS errors
   - Network errors
   - API errors

### Step 4: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Check the login request:
   - **URL**: Should be `https://college-management-blond.vercel.app/api/auth/login`
   - **Status**: Should be 200 (success) or 401/403 (error)
   - **Request Payload**: Should include email, password, role
   - **Response**: Check the response body

## Common Login Errors

### Error 1: "Network Error" or CORS Error

**Cause**: `VITE_API_BASE_URL` not set or incorrect

**Fix**:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add/Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://college-management-blond.vercel.app/api
   ```
3. **Redeploy** the project

### Error 2: "Invalid credentials"

**Possible Causes**:
1. User doesn't exist in database
2. Password is incorrect
3. User account is inactive
4. Role mismatch (user is 'academic' but trying to login as 'student')

**Fix**:
1. Check if user exists in MongoDB:
   ```javascript
   // In MongoDB shell or Compass
   db.users.findOne({ email: "pradeep71@gmail.com" })
   ```
2. Verify password hash matches
3. Check user status: `status: 'active'`
4. Verify role matches: `role: 'student'`

### Error 3: "Login failed" (Generic)

**Cause**: Server error or timeout

**Fix**:
1. Check Vercel function logs
2. Check MongoDB connection
3. Verify all environment variables are set
4. Check serverless function timeout (should be 10s max)

### Error 4: Cookies Not Set

**Cause**: CORS or cookie settings

**Fix**:
1. Verify `CLIENT_ORIGIN` matches your domain exactly
2. Check `withCredentials: true` in API client
3. Ensure cookies are being sent in response headers

## Debugging Steps

### 1. Check API Client Configuration

File: `client/src/api/client.ts`
```typescript
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // Important for cookies!
});
```

**Verify**:
- `VITE_API_BASE_URL` is set in Vercel
- `withCredentials: true` is present

### 2. Check Login Service

File: `server/src/services/authService.ts`

The login service:
1. Finds user by email
2. Checks if user is active
3. Verifies role matches
4. Compares password hash
5. Returns tokens if valid

### 3. Check Login Controller

File: `server/src/controllers/authController.ts`

The controller:
1. Validates request body
2. Calls login service
3. Sets auth cookies
4. Returns user data

### 4. Check CORS Configuration

File: `server/src/app.ts`

CORS should allow:
- Your Vercel domain
- Credentials: true
- Proper headers

## Testing Checklist

- [ ] Environment variables set in Vercel
- [ ] `VITE_API_BASE_URL` points to correct API URL
- [ ] `CLIENT_ORIGIN` matches your domain
- [ ] MongoDB connection working
- [ ] User exists in database
- [ ] User password is correct
- [ ] User role matches login role
- [ ] User status is 'active'
- [ ] No CORS errors in browser console
- [ ] API endpoint responds correctly
- [ ] Cookies are being set
- [ ] Redirect works after login

## Quick Test Script

```bash
#!/bin/bash
# Test login endpoint

API_URL="https://college-management-blond.vercel.app/api/auth/login"

echo "Testing login endpoint..."
echo "URL: $API_URL"
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pradeep71@gmail.com",
    "password": "23831a0571",
    "role": "student"
  }' \
  -v \
  -c cookies.txt

echo ""
echo "Response saved to cookies.txt"
```

## Next Steps

1. **Use Production URL**: `https://college-management-blond.vercel.app/login`
2. **Verify Environment Variables**: Check Vercel dashboard
3. **Test API Endpoint**: Use curl or Postman
4. **Check Browser Console**: Look for errors
5. **Verify User in Database**: Check MongoDB
6. **Redeploy if Needed**: After changing environment variables

## Summary

The main issues are likely:
1. ✅ **Preview URL Protection**: Use production URL instead
2. ✅ **Missing VITE_API_BASE_URL**: Set in Vercel environment variables
3. ✅ **User Not in Database**: Verify user exists
4. ✅ **CORS Issues**: Check CLIENT_ORIGIN setting

After fixing these, login should work correctly!
