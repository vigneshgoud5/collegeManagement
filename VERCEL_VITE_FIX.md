# Vercel Build Fix - Vite Command Not Found

## Issue

Error during Vercel build:
```
sh: line 1: vite: command not found
Error: Command "cd client && npm install && npm run build" exited with 127
```

## Root Cause

The `vite` command wasn't found because:
1. Client dependencies weren't being installed in the install step
2. The build command was trying to install and build in one step, but vite wasn't available

## Solution Applied

1. **Updated `vercel.json` install command**
   - Now installs root, server, AND client dependencies
   - Command: `npm install && cd server && npm install && cd ../client && npm install && cd ..`

2. **Updated `build:vercel` script**
   - Removed redundant `npm install` calls (dependencies are installed in install step)
   - Now just builds: `cd server && npm run build && cd ../client && npm run build`

3. **Updated client build script**
   - Changed from `vite build` to `npx vite build`
   - Ensures it uses the local vite from `node_modules/.bin`

## Files Changed

- `vercel.json` - Updated `installCommand` to include client dependencies
- `package.json` - Simplified `build:vercel` script
- `client/package.json` - Changed build script to use `npx vite build`

## Build Process Flow

1. **Install** (runs first):
   - Install root dependencies
   - Install server dependencies
   - Install client dependencies

2. **Build** (runs second):
   - Build server TypeScript code
   - Build client React app with Vite

## Next Steps

1. Commit and push:
   ```bash
   git add .
   git commit -m "Fix Vercel build: install client deps and use npx vite"
   git push
   ```

2. Vercel will automatically redeploy

3. Build should now succeed with vite available
