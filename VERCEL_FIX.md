# Vercel Deployment Fix

## Issue Fixed

The error `Cannot find package 'express'` occurred because server dependencies were in `server/package.json` but not accessible to Vercel serverless functions.

## Solution Applied

1. **Moved server dependencies to root `package.json`**
   - All server dependencies (express, mongoose, etc.) are now in the root `package.json`
   - This ensures Vercel can access them when running serverless functions

2. **Updated build process**
   - Added `build:vercel` script that:
     - Builds the server TypeScript code
     - Builds the client React app
   - Updated `vercel.json` to use this build command

3. **Updated API handler**
   - Changed import to use built server code: `../server/dist/app.js`
   - Added comment explaining the build requirement

## Files Changed

- `package.json` - Added server dependencies
- `vercel.json` - Updated build and install commands
- `api/index.ts` - Updated import path to use built code

## Next Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment: move server deps to root"
   git push
   ```

2. **Redeploy on Vercel:**
   - The deployment should automatically trigger
   - Or manually redeploy from Vercel dashboard

3. **Verify:**
   - Check `/api/health` endpoint
   - Test registration/login

## Important Notes

- Server dependencies are now duplicated (in root and server/package.json)
- This is intentional for Vercel compatibility
- Local development still uses server/package.json
- Vercel uses root package.json for serverless functions
