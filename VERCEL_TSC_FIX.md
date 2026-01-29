# Vercel Build Fix - TypeScript Compiler and Serverless Handler

## Issues Fixed

1. **`tsc: command not found`** - TypeScript compiler wasn't found during build
2. **Serverless Function crashed** - Express app wasn't properly adapted for Vercel serverless

## Solutions Applied

### 1. Fixed TypeScript Compiler


**Problem**: The server build script used `tsc` directly, which wasn't in PATH.

**Solution**: Changed server build script to use `npx tsc`:
- Updated `server/package.json`: `"build": "npx tsc"`
- This ensures it uses the local TypeScript from `node_modules/.bin`

### 2. Fixed Serverless Function Handler

**Problem**: Express app wasn't properly adapted for Vercel serverless functions. Directly passing VercelRequest/VercelResponse to Express doesn't work correctly.

**Solution**: Used `serverless-http` package to properly wrap the Express app:
- Added `serverless-http` to root `package.json` dependencies
- Updated `api/index.ts` to use `serverless-http` to wrap the Express app
- This properly converts Vercel's request/response format to Express format

## Files Changed

1. **`server/package.json`**
   - Changed build script: `"build": "npx tsc"`

2. **`package.json`**
   - Added dependency: `"serverless-http": "^3.2.0"`

3. **`api/index.ts`**
   - Imported `serverless-http`
   - Wrapped Express app with `serverless(app)`
   - Properly handles Vercel serverless function format

## How It Works Now

1. **Build Process**:
   - Install all dependencies (root, server, client)
   - Build server: `cd server && npx tsc` (compiles TypeScript)
   - Build client: `cd client && npx vite build` (builds React app)

2. **Runtime**:
   - First request initializes MongoDB connection
   - Creates serverless handler wrapping Express app
   - Subsequent requests use cached handler
   - `serverless-http` converts Vercel format to Express format

## Next Steps

1. Commit and push:
   ```bash
   git add .
   git commit -m "Fix Vercel: use npx tsc and serverless-http adapter"
   git push
   ```

2. Vercel will automatically redeploy

3. Verify:
   - Build should complete successfully
   - `/api/health` endpoint should work
   - Serverless function should no longer crash

## Testing

After deployment, test:
- `GET /api/health` - Should return `{"status":"ok","timestamp":"..."}`
- `POST /api/auth/register` - Should work without crashing
- Other API endpoints should function correctly
