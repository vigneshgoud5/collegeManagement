# Vercel Deployment Quick Start 🚀

## Prerequisites Checklist

- [ ] GitHub repository with your code
- [ ] Vercel account (sign up at vercel.com)
- [ ] MongoDB Atlas account (free tier available)

## Step 1: Set Up MongoDB Atlas (5 minutes)

1. **Create Account**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Sign up
2. **Create Cluster**: Choose free tier (M0) → Create
3. **Create Database User**:
   - Database Access → Add New User
   - Username: `collegeportal`
   - Password: Generate and **SAVE IT**
   - Privileges: Read and write to any database
4. **Network Access**: Add IP Address → **Allow Access from Anywhere**
5. **Get Connection String**:
   - Database → Connect → Connect your application
   - Copy the string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `college_portal`

**Example connection string:**
```
mongodb+srv://collegeportal:YourPassword123@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority
```

## Step 2: Deploy to Vercel (10 minutes)

### Via Dashboard (Easiest)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**
   - Import: `vigneshgoud5/collegeManagrment`

2. **Configure Build**
   - Framework: `Vite` (or `Other`)
   - Root Directory: Leave empty
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   
   Click **Environment Variables** and add these (one by one):

   | Name | Value | Notes |
   |------|-------|-------|
   | `MONGO_URI` | `mongodb+srv://...` | Your Atlas connection string |
   | `JWT_ACCESS_SECRET` | `[generate 32+ char string]` | See below |
   | `JWT_REFRESH_SECRET` | `[generate 32+ char string]` | See below |
   | `CLIENT_ORIGIN` | `https://your-project.vercel.app` | **Update after first deploy** |
   | `VITE_API_BASE_URL` | `https://your-project.vercel.app/api` | **Update after first deploy** |
   | `NODE_ENV` | `production` | |

   **Generate JWT Secrets:**
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click **Deploy**
   - Wait 2-5 minutes

5. **Update Environment Variables**
   - After deploy, copy your Vercel domain (e.g., `https://college-portal-abc123.vercel.app`)
   - Go to **Settings** → **Environment Variables**
   - Update `CLIENT_ORIGIN` to your domain
   - Update `VITE_API_BASE_URL` to `{your-domain}/api`
   - **Redeploy** (Deployments → Latest → Redeploy)

### Via CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add MONGO_URI
vercel env add JWT_ACCESS_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add CLIENT_ORIGIN
vercel env add VITE_API_BASE_URL
vercel env add NODE_ENV

# Deploy to production
vercel --prod
```

## Step 3: Verify Deployment ✅

1. **Frontend**: Visit `https://your-project.vercel.app`
   - Should show login page

2. **Backend API**: Visit `https://your-project.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Test Registration**:
   - Register a new academic user
   - Check MongoDB Atlas → Collections → `users` to verify data saved

## 🎯 Your Site URLs

- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api`
- **Health Check**: `https://your-project.vercel.app/api/health`

## 🔧 Troubleshooting

### "Database connection failed"
- ✅ Check `MONGO_URI` is correct in Vercel
- ✅ Verify MongoDB Atlas network access allows all IPs
- ✅ Ensure database user password is correct

### "CORS error"
- ✅ Update `CLIENT_ORIGIN` to match your Vercel domain exactly
- ✅ Include `https://` protocol
- ✅ Redeploy after updating

### "404 Not Found" on routes
- ✅ Verify `vercel.json` exists in root
- ✅ Check build output includes `index.html`

### API returns 500 errors
- ✅ Check Vercel function logs (Deployments → Functions → Logs)
- ✅ Verify all environment variables are set
- ✅ Check MongoDB connection string format

## 📚 Full Documentation

See `VERCEL_FULL_DEPLOYMENT.md` for detailed instructions.

## ✅ Quick Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] `CLIENT_ORIGIN` updated to Vercel domain
- [ ] `VITE_API_BASE_URL` updated
- [ ] Redeployed with updated variables
- [ ] Health endpoint working
- [ ] Registration/login working

---

**That's it!** Your app should now be live on Vercel. 🎉
