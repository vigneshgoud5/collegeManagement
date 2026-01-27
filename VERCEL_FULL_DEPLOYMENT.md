# Complete Vercel Deployment Guide

This guide will help you deploy both the **frontend** and **backend** of the College Portal to Vercel.

## 🎯 Overview

Vercel will host:
- **Frontend**: React SPA (static files from `client/dist`)
- **Backend**: Express API (serverless functions in `api/`)

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **GitHub Repository**: Your code must be in a GitHub repository

## 🚀 Step-by-Step Deployment

### Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier (M0 cluster)

2. **Create a Cluster**
   - Choose a cloud provider and region
   - Name your cluster (e.g., "CollegePortal")
   - Click "Create Cluster"

3. **Create Database User**
   - Go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Username: `collegeportal` (or your choice)
   - Password: Generate a strong password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click **Add User**

4. **Configure Network Access**
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (or add Vercel's IP ranges)
   - Click **Confirm**

5. **Get Connection String**
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `college_portal` (or your database name)

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Select the repository: `vigneshgoud5/collegeManagrment`

2. **Configure Project Settings**
   - **Framework Preset**: `Vite` (or `Other`)
   - **Root Directory**: Leave empty (or set to `/`)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   
   Click **Environment Variables** and add:

   ```env
   # MongoDB Connection
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college_portal?retryWrites=true&w=majority
   
   # JWT Secrets (generate strong random strings)
   JWT_ACCESS_SECRET=your_super_secret_access_token_key_32_chars_min
   JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_32_chars_min
   
   # CORS - Your Vercel domain (will be provided after first deploy)
   CLIENT_ORIGIN=https://your-project.vercel.app
   
   # API Base URL for client (same as CLIENT_ORIGIN)
   VITE_API_BASE_URL=https://your-project.vercel.app/api
   
   # Node Environment
   NODE_ENV=production
   ```

   **Generate JWT Secrets:**
   ```bash
   # Using OpenSSL
   openssl rand -base64 32
   
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete (2-5 minutes)

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: `college-portal` (or your choice)
   - Directory: `.` (current directory)
   - Override settings? **No**

4. **Add Environment Variables**
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_ACCESS_SECRET
   vercel env add JWT_REFRESH_SECRET
   vercel env add CLIENT_ORIGIN
   vercel env add VITE_API_BASE_URL
   vercel env add NODE_ENV
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

### Step 3: Update Environment Variables After First Deploy

After the first deployment, Vercel will provide your domain (e.g., `https://college-portal.vercel.app`):

1. Go to **Project Settings** → **Environment Variables**
2. Update `CLIENT_ORIGIN` to your Vercel domain:
   ```
   CLIENT_ORIGIN=https://your-project.vercel.app
   ```
3. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://your-project.vercel.app/api
   ```
4. **Redeploy** to apply changes:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment

### Step 4: Verify Deployment

1. **Check Frontend**
   - Visit your Vercel domain: `https://your-project.vercel.app`
   - You should see the login page

2. **Check Backend API**
   - Visit: `https://your-project.vercel.app/api/health`
   - You should see: `{"status":"ok","timestamp":"..."}`

3. **Test Registration**
   - Try registering a new academic user
   - Check MongoDB Atlas to verify data is being saved

## 🔧 Project Structure for Vercel

```
gnit/
├── api/
│   └── index.ts          # Serverless function wrapper
├── client/
│   ├── src/              # React app source
│   ├── dist/             # Build output (generated)
│   └── package.json
├── server/
│   └── src/              # Express app source
└── vercel.json           # Vercel configuration
```

## 📝 Important Configuration Files

### `vercel.json`
- Routes `/api/*` to serverless function
- Routes all other paths to frontend
- Handles SPA routing with rewrites

### `api/index.ts`
- Wraps Express app for Vercel serverless
- Handles MongoDB connection caching
- Processes all API requests

## 🔐 Security Checklist

- [ ] MongoDB Atlas network access configured
- [ ] Strong JWT secrets (32+ characters)
- [ ] Database user with appropriate permissions
- [ ] CORS configured correctly (`CLIENT_ORIGIN`)
- [ ] Environment variables set in Vercel (not in code)
- [ ] HTTPS enabled (automatic on Vercel)

## 🐛 Troubleshooting

### Issue: "Database connection failed"

**Solutions:**
1. Verify `MONGO_URI` is correct in Vercel environment variables
2. Check MongoDB Atlas network access allows all IPs (or Vercel IPs)
3. Ensure database user password is correct
4. Check MongoDB Atlas cluster is running

### Issue: "CORS error" in browser

**Solutions:**
1. Verify `CLIENT_ORIGIN` matches your Vercel domain exactly
2. Include protocol: `https://your-project.vercel.app` (not just domain)
3. Redeploy after updating environment variables

### Issue: "404 Not Found" on routes

**Solutions:**
1. Verify `vercel.json` has the rewrite rule for SPA routing
2. Check build output includes `index.html` in `client/dist/`
3. Ensure `outputDirectory` in Vercel settings is `client/dist`

### Issue: API routes return 500 errors

**Solutions:**
1. Check Vercel function logs: **Deployments** → **Functions** → **View Function Logs**
2. Verify all environment variables are set
3. Check MongoDB connection string format
4. Ensure `@vercel/node` is installed

### Issue: Build fails

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify `buildCommand` is correct: `cd client && npm install && npm run build`
3. Ensure all dependencies are in `client/package.json`
4. Check Node.js version (Vercel uses 20.x by default)

## 🔄 Updating Your Deployment

Every time you push to your main branch:
1. Vercel automatically detects the push
2. Builds the project
3. Deploys to production
4. Updates your live site

You can also manually trigger deployments from the Vercel dashboard.

## 📊 Monitoring

- **Function Logs**: View in Vercel dashboard under **Deployments** → **Functions**
- **Analytics**: Available in Vercel dashboard (may require upgrade)
- **MongoDB Atlas**: Monitor database usage in Atlas dashboard

## 🎉 Next Steps

1. **Custom Domain** (Optional)
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Update `CLIENT_ORIGIN` and `VITE_API_BASE_URL` to use custom domain

2. **Environment Variables for Different Environments**
   - Use **Preview** environment for pull requests
   - Use **Production** environment for main branch
   - Use **Development** environment for local testing

3. **Database Backups**
   - Configure automatic backups in MongoDB Atlas
   - Set up regular exports if needed

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access configured (allow all IPs or Vercel IPs)
- [ ] Connection string obtained and tested
- [ ] Vercel project created
- [ ] All environment variables set
- [ ] Build command configured: `cd client && npm install && npm run build`
- [ ] Output directory set: `client/dist`
- [ ] First deployment successful
- [ ] `CLIENT_ORIGIN` updated to Vercel domain
- [ ] `VITE_API_BASE_URL` updated to Vercel domain
- [ ] Redeployed with updated environment variables
- [ ] Health endpoint working: `/api/health`
- [ ] Frontend loads correctly
- [ ] Registration/login working
- [ ] Data saving to MongoDB Atlas

---

**Need Help?** Check the troubleshooting section or review Vercel function logs for detailed error messages.
