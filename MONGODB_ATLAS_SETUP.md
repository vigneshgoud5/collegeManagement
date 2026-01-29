# MongoDB Atlas Setup Guide

This guide will help you connect to MongoDB Atlas both locally and for your deployed website on Vercel.

## Step 1: Create MongoDB Atlas Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (M0 Free Tier)
3. Create a new cluster (choose a cloud provider and region close to you)
4. Wait for the cluster to be created (takes 3-5 minutes)

## Step 2: Create Database User

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Enter a username (e.g., `college-portal-admin`)
5. Generate a secure password (click **Autogenerate Secure Password** or create your own)
6. **IMPORTANT**: Save the username and password - you'll need them for the connection string
7. Set user privileges to **Atlas admin** (or **Read and write to any database**)
8. Click **Add User**

## Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. For local development:
   - Click **Add Current IP Address** (to allow your local machine)
   - Or click **Allow Access from Anywhere** (0.0.0.0/0) for testing (less secure)
4. For Vercel deployment:
   - You'll need to add Vercel's IP ranges OR use **Allow Access from Anywhere** (0.0.0.0/0)
   - Note: For production, it's better to use specific IP ranges
5. Click **Confirm**

## Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials
7. Add your database name at the end (before the `?`):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority
   ```

## Step 5: Configure Local Environment

### Option A: Update Root .env File

1. Open your `.env` file in the root directory
2. Update the `MONGO_URI` with your Atlas connection string:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority
   ```
3. Make sure to URL-encode special characters in your password:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `$` becomes `%24`
   - `%` becomes `%25`
   - `&` becomes `%26`
   - `+` becomes `%2B`
   - `=` becomes `%3D`
   - `?` becomes `%3F`

### Option B: Update Server .env File

If you have a `.env` file in the `server/` directory, update it there instead.

## Step 6: Test Local Connection

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. You should see:
   ```
   ✅ MongoDB connected successfully
      Database: college_portal
   ```

3. If you see connection errors:
   - Check your username and password are correct
   - Verify your IP address is whitelisted in Network Access
   - Check the connection string format
   - Ensure the database name is correct

## Step 7: Configure Vercel Deployment

### Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   **For Production:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   CLIENT_ORIGIN=https://your-project.vercel.app
   NODE_ENV=production
   PORT=3000
   ```

   **For Preview/Development:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   CLIENT_ORIGIN=https://your-preview-url.vercel.app
   NODE_ENV=production
   PORT=3000
   ```

4. **Important**: Make sure to URL-encode special characters in the password
5. Select the appropriate environments (Production, Preview, Development)
6. Click **Save**

### Network Access for Vercel

1. In MongoDB Atlas, go to **Network Access**
2. Add **Allow Access from Anywhere** (0.0.0.0/0) if you haven't already
   - This allows Vercel's serverless functions to connect
   - For production, consider using Vercel's specific IP ranges if available

## Step 8: Deploy and Verify

1. Push your changes to GitHub (if using GitHub integration)
2. Vercel will automatically redeploy
3. Check the deployment logs for connection status
4. Test your API endpoints to verify database connectivity

## Troubleshooting

### Connection Timeout
- Check Network Access in MongoDB Atlas
- Verify your IP is whitelisted
- Check firewall settings

### Authentication Failed
- Verify username and password are correct
- Check for special characters that need URL encoding
- Ensure the database user has proper permissions

### Database Not Found
- The database will be created automatically on first connection
- Verify the database name in the connection string

### Vercel Connection Issues
- Ensure `MONGO_URI` is set in Vercel environment variables
- Check that Network Access allows 0.0.0.0/0 or Vercel IPs
- Review Vercel function logs for detailed error messages

## Security Best Practices

1. **Use Strong Passwords**: Generate secure passwords for database users
2. **Limit Network Access**: Use specific IP ranges when possible
3. **Separate Users**: Create different users for development and production
4. **Rotate Credentials**: Regularly update passwords
5. **Monitor Access**: Review MongoDB Atlas logs for suspicious activity
6. **Use Environment Variables**: Never commit credentials to Git

## Example Connection String Format

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_portal?retryWrites=true&w=majority
```

Where:
- `username`: Your database user username
- `password`: Your database user password (URL-encoded if needed)
- `cluster0.xxxxx.mongodb.net`: Your cluster address
- `college_portal`: Your database name
- `?retryWrites=true&w=majority`: Connection options

## Quick Reference

- **MongoDB Atlas Dashboard**: https://cloud.mongodb.com/
- **Connection String Format**: `mongodb+srv://username:password@cluster/database?options`
- **URL Encoding Tool**: https://www.urlencoder.org/
