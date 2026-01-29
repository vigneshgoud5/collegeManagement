# Vercel Deployment Guide

This guide explains how to deploy the College Portal application to Vercel with proper structure and dependencies.

## Project Structure

```
gnit/
├── api/                    # Vercel serverless functions
│   └── index.ts           # Express app wrapper for Vercel
├── client/                 # React frontend
│   ├── src/               # Source code
│   ├── dist/              # Build output (generated)
│   ├── package.json       # Client dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                 # Express backend
│   ├── src/               # Source code
│   ├── dist/              # Build output (generated)
│   └── package.json       # Server dependencies (for local dev)
├── package.json           # Root dependencies (includes server deps for Vercel)
├── vercel.json            # Vercel configuration
└── .vercelignore          # Files to exclude from deployment
```

## Key Configuration Files

### `vercel.json`
- **buildCommand**: `npm run build:vercel` - Builds both server and client
- **outputDirectory**: `client/dist` - Frontend build output
- **installCommand**: Installs dependencies in root, server, and client
- **rewrites**: Routes `/api/*` to serverless function, everything else to `index.html`

### `package.json` (root)
- Contains all server dependencies (needed for Vercel serverless functions)
- Contains build tools and dev dependencies
- **build:vercel** script: Builds server with `npx tsc`, then client with `npx vite build`

## Deployment Steps

### 1. Prerequisites
- Vercel account
- MongoDB Atlas account (or your MongoDB instance)
- Git repository

### 2. Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

**Server Environment Variables:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_ORIGIN=https://your-project.vercel.app
NODE_ENV=production
PORT=3000
```

**Client Environment Variables:**
```
VITE_API_BASE_URL=https://your-project.vercel.app/api
```

### 3. Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option B: Via GitHub Integration
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install && cd server && npm install && cd ../client && npm install && cd ..`
6. Add environment variables
7. Deploy

### 4. Post-Deployment

1. **Update CLIENT_ORIGIN**: After first deployment, update `CLIENT_ORIGIN` in Vercel to match your actual domain
2. **Update VITE_API_BASE_URL**: Update client env var to `https://your-project.vercel.app/api`
3. **Redeploy**: Trigger a new deployment after updating environment variables

## Build Process

The `build:vercel` script:
1. Compiles TypeScript server code (`server/src` → `server/dist`)
2. Builds React client (`client/src` → `client/dist`)
3. Vercel uses `client/dist` as the static frontend
4. Vercel uses `api/index.ts` as the serverless function entry point

## Directory Structure Notes

- **Root `src/` and `dist/`**: Removed (duplicates, not needed)
- **Root `index.html`, `vite.config.ts`, `tsconfig.json`**: Removed (use client versions)
- **`client/vercel.json`**: Removed (use root `vercel.json`)
- **`.vercelignore`**: Excludes unnecessary files from deployment

## Troubleshooting

### Build Fails: "Cannot find module"
- Ensure all dependencies are in root `package.json` (for serverless functions)
- Run `npm install` in root, server, and client directories

### Build Fails: "tsc: command not found"
- The build script uses `npx tsc` to use local TypeScript
- Ensure `typescript` is in root `devDependencies`

### Build Fails: "vite: command not found"
- The build script uses `npx vite build` to use local Vite
- Ensure `vite` is in root `devDependencies`

### CORS Errors
- Verify `CLIENT_ORIGIN` matches your Vercel domain
- Check that CORS middleware is configured in `server/src/app.ts`

### Database Connection Fails
- Verify `MONGO_URI` is correct in Vercel environment variables
- Check MongoDB Atlas IP whitelist (allow all IPs: `0.0.0.0/0` for testing)

## Local Development

For local development:
```bash
# Install all dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Run development servers
npm run dev
```

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] `CLIENT_ORIGIN` matches Vercel domain
- [ ] `VITE_API_BASE_URL` matches Vercel domain + `/api`
- [ ] MongoDB connection string is correct
- [ ] JWT secrets are strong and secure
- [ ] Build completes successfully
- [ ] API endpoints are accessible
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] CORS is configured correctly
