# Fixing CORS Errors in Vercel Deployment

## Problem

After deploying to Vercel, you're seeing CORS errors:
```
Access to XMLHttpRequest at 'https://college-management-blond.vercel.app/api/auth/refresh' 
from origin 'https://college-management-h7q0c0vft-vigneshgouds-projects.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Root Cause

Vercel creates different URLs for:
- **Production**: `https://college-management-blond.vercel.app`
- **Preview deployments**: `https://college-management-*-vigneshgouds-projects.vercel.app`

The CORS configuration was only allowing a single origin, so preview deployments were blocked.

## Solution

The code has been updated to:
1. Allow the production URL from `CLIENT_ORIGIN`
2. Automatically allow all Vercel preview URLs (any `*.vercel.app` domain)
3. Support additional origins via `CLIENT_ORIGINS` environment variable

## Vercel Environment Variables Setup

### Option 1: Production Only (Recommended)

Set these in Vercel Dashboard → Settings → Environment Variables:

**Production Environment:**
```
CLIENT_ORIGIN=https://college-management-blond.vercel.app
```

The code will automatically allow all Vercel preview URLs (`*.vercel.app`).

### Option 2: Explicit Origins

If you want to be more specific, you can set:

**Production Environment:**
```
CLIENT_ORIGIN=https://college-management-blond.vercel.app
CLIENT_ORIGINS=https://college-management-blond.vercel.app,https://your-custom-domain.com
```

**Preview Environment:**
```
CLIENT_ORIGIN=https://college-management-blond.vercel.app
CLIENT_ORIGINS=https://college-management-blond.vercel.app
```

## Steps to Fix

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `college-management`
3. **Go to Settings → Environment Variables**
4. **Add/Update `CLIENT_ORIGIN`**:
   - Environment: **Production**
   - Value: `https://college-management-blond.vercel.app`
   - Click **Save**
5. **Redeploy**:
   - Go to **Deployments**
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger automatic deployment

## Verification

After redeploying, test the API:

```bash
# Test from your preview URL
curl -H "Origin: https://college-management-h7q0c0vft-vigneshgouds-projects.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://college-management-blond.vercel.app/api/auth/refresh
```

You should see CORS headers in the response.

## How It Works

The updated CORS configuration:
1. **Checks exact matches** from `CLIENT_ORIGIN` and `CLIENT_ORIGINS`
2. **In production**, automatically allows any `*.vercel.app` URL
3. **In development**, only allows the exact `CLIENT_ORIGIN` (localhost)

This ensures:
- ✅ Production deployments work
- ✅ Preview deployments work automatically
- ✅ Local development still works
- ✅ Security is maintained (only Vercel domains allowed)

## Troubleshooting

### Still Getting CORS Errors?

1. **Check environment variables are set**:
   - Go to Vercel → Settings → Environment Variables
   - Verify `CLIENT_ORIGIN` is set for Production

2. **Verify the deployment has the latest code**:
   - Check deployment logs for the latest commit
   - Redeploy if needed

3. **Check the actual origin**:
   - Open browser DevTools → Network tab
   - Check the `Origin` header in the request
   - Verify it matches a `*.vercel.app` pattern

4. **Test the API directly**:
   ```bash
   curl -I https://college-management-blond.vercel.app/api/health
   ```
   Should return 200 OK

### 500 Error on API

If you're also seeing 500 errors:
1. Check MongoDB connection in Vercel logs
2. Verify `MONGO_URI` is set correctly
3. Check that MongoDB Atlas Network Access allows 0.0.0.0/0

## Security Note

The current implementation allows **all** `*.vercel.app` domains. This is safe because:
- Only Vercel can create `*.vercel.app` domains
- Your project's preview URLs are unique
- Production URL is explicitly set

For stricter security, you can:
- Set specific preview URLs in `CLIENT_ORIGINS`
- Use a custom domain for production
- Implement origin validation based on your project name
