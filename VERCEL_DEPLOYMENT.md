# Vercel Deployment Guide

## Quick Fix for NOT_FOUND Error

If you're seeing `NOT_FOUND` errors on Vercel, this guide explains the issue and how to fix it.

## The Problem

When deploying a React Single Page Application (SPA) to Vercel, you may encounter `NOT_FOUND` errors when:
- Navigating directly to routes like `/student/settings`
- Refreshing the page on any route other than `/`
- Sharing deep links with others

## The Solution

A `vercel.json` file has been created in the `client/` directory to handle SPA routing.

### Vercel Project Settings

**IMPORTANT:** You have two options for deployment:

#### Option A: Root Directory Method (Recommended)

1. In Vercel Dashboard → Project Settings → General:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (or leave empty to use package.json)
   - **Output Directory**: `dist`
   - **Framework Preset**: `Vite` (or `Other` if Vite isn't available)

2. The `client/vercel.json` file will be used automatically.

#### Option B: Root-Level Configuration (Current Setup)

If deploying from the repository root (not setting root directory):

1. The root-level `vercel.json` file handles everything:
   - Builds from `client/` directory
   - Outputs to `client/dist`
   - Includes SPA routing configuration

2. In Vercel Dashboard → Project Settings:
   - **Root Directory**: Leave empty (or set to `/`)
   - Vercel will use the root `vercel.json` configuration

### Environment Variables

In your Vercel project settings, add:

```
VITE_API_BASE_URL=https://your-backend-api.com/api
```

Replace `https://your-backend-api.com/api` with your actual backend API URL.

## How It Works

The `vercel.json` file tells Vercel:
- **Rewrites**: All requests that don't match static files should be served `index.html`
- This allows React Router to handle routing on the client side
- **Headers**: Cache static assets (JS, CSS, images) for better performance

## Testing Locally

Before deploying, test your production build locally:

```bash
cd client
npm run build
npm run preview
```

Visit `http://localhost:4173` (or the port shown) and test:
- Direct navigation to routes
- Page refreshes
- Deep links

## Deployment Checklist

**Choose one approach:**

### If using Root Directory Method:
- [ ] `vercel.json` exists in `client/` directory
- [ ] Vercel project root is set to `client` in dashboard
- [ ] Build command is `npm run build` (or auto-detected)
- [ ] Output directory is `dist` (or auto-detected)
- [ ] `VITE_API_BASE_URL` environment variable is set
- [ ] Backend API is accessible from Vercel's servers
- [ ] CORS is configured on backend to allow Vercel domain

### If using Root-Level Configuration:
- [ ] `vercel.json` exists at repository root
- [ ] Root directory is empty or set to `/` in dashboard
- [ ] `VITE_API_BASE_URL` environment variable is set
- [ ] Backend API is accessible from Vercel's servers
- [ ] CORS is configured on backend to allow Vercel domain

## Troubleshooting

### Still seeing NOT_FOUND?

1. **Check file location**: `vercel.json` must be in the `client/` directory (or root if deploying from root)
2. **Verify build output**: Run `npm run build` and ensure `dist/` contains `index.html`
3. **Check Vercel logs**: Look at build logs in Vercel dashboard for errors
4. **Test build locally**: Use `npm run preview` to catch issues before deploying

### API calls failing?

1. **Check environment variable**: Ensure `VITE_API_BASE_URL` is set in Vercel
2. **Verify CORS**: Backend must allow requests from your Vercel domain
3. **Check network tab**: Browser DevTools will show the actual API URL being used

## Architecture Notes

This project uses a **separated frontend/backend architecture**:
- **Frontend (Vercel)**: React SPA, static files served via CDN
- **Backend (Separate)**: Express.js API, deployed elsewhere (Railway, Render, Heroku, etc.)

The frontend makes API calls to the backend using the `VITE_API_BASE_URL` environment variable.
