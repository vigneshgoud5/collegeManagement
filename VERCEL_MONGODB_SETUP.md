# Connecting MongoDB Atlas to Vercel Deployment

This guide shows you how to connect your deployed website on Vercel to MongoDB Atlas.

## Prerequisites

- MongoDB Atlas cluster created and configured
- MongoDB Atlas connection string ready
- Vercel project deployed

## Step 1: Prepare Your Connection String

1. Get your MongoDB Atlas connection string (from MongoDB Atlas dashboard)
2. Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority`
3. **Important**: URL-encode special characters in your password:
   - Use an online URL encoder: https://www.urlencoder.org/
   - Or use this Node.js command:
     ```bash
     node -e "console.log(encodeURIComponent('your-password-here'))"
     ```

## Step 2: Configure Network Access in MongoDB Atlas

1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This allows Vercel's serverless functions to connect
   - Click **Confirm**
4. **Note**: For production, you can restrict to specific IPs if Vercel provides them

## Step 3: Add Environment Variables in Vercel

### Via Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### For Production Environment:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MONGO_URI` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority` | Production |
| `JWT_ACCESS_SECRET` | Your access secret (32+ characters) | Production |
| `JWT_REFRESH_SECRET` | Your refresh secret (32+ characters) | Production |
| `CLIENT_ORIGIN` | `https://your-project.vercel.app` | Production |
| `NODE_ENV` | `production` | Production |
| `PORT` | `3000` | Production |

#### For Preview Environment:

Add the same variables but set:
- `CLIENT_ORIGIN` to your preview URL (or use `*` for all previews)

5. Click **Save** after adding each variable

### Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Add environment variables
vercel env add MONGO_URI production
# Paste your connection string when prompted

vercel env add JWT_ACCESS_SECRET production
# Enter your JWT access secret

vercel env add JWT_REFRESH_SECRET production
# Enter your JWT refresh secret

vercel env add CLIENT_ORIGIN production
# Enter: https://your-project.vercel.app

vercel env add NODE_ENV production
# Enter: production

vercel env add PORT production
# Enter: 3000
```

## Step 4: Redeploy Your Application

After adding environment variables:

1. **Automatic**: If you have GitHub integration, push a new commit
2. **Manual**: Go to **Deployments** → Click **Redeploy** on the latest deployment
3. **CLI**: Run `vercel --prod`

## Step 5: Verify Connection

1. Check deployment logs in Vercel dashboard
2. Look for: `✅ MongoDB connected successfully`
3. Test your API endpoints:
   ```bash
   curl https://your-project.vercel.app/api/health
   ```
4. Should return: `{"status":"ok","timestamp":"..."}`

## Step 6: Test Database Operations

1. Try registering a user or logging in
2. Check MongoDB Atlas → **Collections** to see if data is being created
3. Verify your database operations are working

## Troubleshooting

### Connection Timeout Errors

**Problem**: `MongoServerError: connection timed out`

**Solutions**:
- Verify Network Access in MongoDB Atlas allows 0.0.0.0/0
- Check that your connection string is correct
- Ensure the database user has proper permissions

### Authentication Failed

**Problem**: `MongoServerError: Authentication failed`

**Solutions**:
- Verify username and password in connection string
- Check for URL-encoded special characters in password
- Ensure database user exists and has correct permissions

### Environment Variables Not Found

**Problem**: `MONGO_URI is required`

**Solutions**:
- Verify environment variables are set in Vercel
- Check that variables are set for the correct environment (Production/Preview)
- Redeploy after adding environment variables

### Database Not Found

**Problem**: Database doesn't exist

**Solutions**:
- MongoDB Atlas creates databases automatically on first write
- Verify the database name in your connection string
- Check MongoDB Atlas → **Collections** to see if database was created

## Security Checklist

- [ ] Strong database user password (16+ characters, mixed case, numbers, symbols)
- [ ] JWT secrets are strong random strings (32+ characters)
- [ ] Environment variables are set in Vercel (not in code)
- [ ] Network Access is configured (0.0.0.0/0 for Vercel, or specific IPs)
- [ ] Database user has minimal required permissions
- [ ] Connection string uses SSL/TLS (mongodb+srv://)
- [ ] No credentials committed to Git

## Quick Commands

```bash
# Test connection string locally
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_CONNECTION_STRING')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err.message));
"

# Generate JWT secrets
openssl rand -base64 32

# URL encode password
node -e "console.log(encodeURIComponent('your-password'))"
```

## Example Environment Variables

```env
MONGO_URI=mongodb+srv://admin:MyP%40ssw0rd%21@cluster0.abc123.mongodb.net/college_portal?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_secret_access_token_key_32_chars_min
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_32_chars_min
CLIENT_ORIGIN=https://your-project.vercel.app
NODE_ENV=production
PORT=3000
```

## Support

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Mongoose Connection**: https://mongoosejs.com/docs/connections.html
