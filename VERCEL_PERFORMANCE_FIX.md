# Fixing Slow Loading and Timeout Issues on Vercel

## Common Causes of Slow Loading and Timeouts

### 1. **MongoDB Atlas Connection Issues**
- **Problem**: Slow connection to MongoDB Atlas
- **Symptoms**: 10+ second load times, timeout errors
- **Solutions**:
  - Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
  - Check connection string is correct
  - Ensure MongoDB Atlas cluster is in a region close to Vercel's servers
  - Use connection string with `retryWrites=true&w=majority`

### 2. **Serverless Function Cold Starts**
- **Problem**: First request after inactivity takes 5-10 seconds
- **Symptoms**: First load is slow, subsequent loads are faster
- **Solutions**:
  - Connection caching is already implemented
  - Consider Vercel Pro plan (faster cold starts)
  - Use Vercel's Edge Functions for static routes

### 3. **Vercel Function Timeout Limits**
- **Free Tier**: 10 seconds maximum execution time
- **Pro Tier**: 60 seconds maximum execution time
- **Problem**: Database connection + request processing exceeds timeout
- **Solutions**:
  - Optimize database connection (already done)
  - Reduce connection timeout to 8s (leaves 2s buffer)
  - Use connection pooling efficiently

### 4. **Network Latency**
- **Problem**: Slow network between Vercel and MongoDB Atlas
- **Solutions**:
  - Choose MongoDB Atlas region close to Vercel (US East for Vercel)
  - Use MongoDB Atlas connection string with optimal settings
  - Enable MongoDB Atlas connection pooling

## Optimizations Applied

### Database Connection Settings
```typescript
{
  serverSelectionTimeoutMS: 10000, // 10s max (Vercel free tier limit)
  connectTimeoutMS: 10000,         // 10s connection timeout
  maxPoolSize: 1,                  // Single connection for serverless
  minPoolSize: 0,                  // No minimum (ephemeral connections)
  heartbeatFrequencyMS: 10000,     // Health check every 10s
  retryWrites: true,
  retryReads: true,
}
```

### Serverless Function Improvements
- Connection initialization timeout (8s max)
- Connection reuse across invocations
- Better error handling with retry suggestions
- Graceful degradation on connection failures

## Vercel Configuration

### Update `vercel.json` (if needed)
```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 10
    }
  }
}
```

**Note**: Free tier max is 10s, Pro tier can be up to 60s.

## MongoDB Atlas Optimization

### 1. Choose the Right Region
- **US East (N. Virginia)** - Best for Vercel deployments
- **Europe (Ireland)** - Good for EU users
- **Asia Pacific (Mumbai)** - Good for India/Asia

### 2. Connection String Optimization
```
mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&maxPoolSize=1&serverSelectionTimeoutMS=10000
```

### 3. Network Access
- Allow `0.0.0.0/0` for Vercel serverless functions
- Or use Vercel's specific IP ranges if available

## Monitoring and Debugging

### Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on a function execution
3. Check:
   - Execution time
   - Memory usage
   - Error messages
   - Database connection logs

### Check MongoDB Atlas Logs
1. Go to MongoDB Atlas → Monitoring
2. Check:
   - Connection count
   - Query performance
   - Network latency

### Test Connection Speed
```bash
# Test MongoDB Atlas connection
time curl -X GET "https://your-api.vercel.app/api/health"
```

## Quick Fixes

### 1. Verify Environment Variables
```bash
# In Vercel Dashboard → Settings → Environment Variables
MONGO_URI=mongodb+srv://... (correct connection string)
CLIENT_ORIGIN=https://your-domain.vercel.app
NODE_ENV=production
```

### 2. Test Database Connection
```bash
# Test from Vercel function logs
# Should see: "✅ MongoDB connected successfully"
```

### 3. Reduce Initial Load Time
- Pre-warm the function (make a request every 5 minutes)
- Use Vercel Pro plan for faster cold starts
- Optimize bundle size

## Expected Performance

### After Optimizations:
- **Cold Start**: 2-5 seconds (first request after inactivity)
- **Warm Start**: < 1 second (subsequent requests)
- **Database Query**: < 500ms (after connection established)

### If Still Slow:
1. **Check MongoDB Atlas cluster tier** - Free tier is slower
2. **Upgrade to Vercel Pro** - Faster cold starts
3. **Use MongoDB Atlas M10+** - Better performance
4. **Enable MongoDB Atlas connection pooling** - Reduces latency

## Troubleshooting Steps

### Step 1: Check Vercel Logs
```bash
# In Vercel Dashboard → Functions → View Logs
# Look for:
# - "Connecting to MongoDB at..."
# - "✅ MongoDB connected successfully"
# - Any timeout errors
```

### Step 2: Test API Endpoint
```bash
curl -X GET "https://your-api.vercel.app/api/health"
# Should return: {"status":"ok","timestamp":"..."}
```

### Step 3: Test Database Connection
```bash
# Check MongoDB Atlas → Monitoring → Real-Time Performance
# Verify connections are being established
```

### Step 4: Check Network Access
```bash
# MongoDB Atlas → Network Access
# Should have: 0.0.0.0/0 (Allow Access from Anywhere)
```

## Performance Checklist

- [ ] MongoDB Atlas region is close to Vercel (US East recommended)
- [ ] Network Access allows 0.0.0.0/0
- [ ] Connection string includes `retryWrites=true&w=majority`
- [ ] Environment variables are set correctly in Vercel
- [ ] Vercel function timeout is appropriate (10s free, 60s pro)
- [ ] Database connection is being cached (check logs)
- [ ] No unnecessary middleware slowing down requests
- [ ] API routes are optimized (no heavy computations)

## Additional Optimizations

### 1. Use Edge Functions for Static Routes
```typescript
// For routes that don't need database
export const config = {
  runtime: 'edge',
};
```

### 2. Implement Response Caching
```typescript
// Cache health check endpoint
res.setHeader('Cache-Control', 'public, max-age=60');
```

### 3. Optimize Database Queries
- Use indexes on frequently queried fields
- Limit query results
- Use projection to fetch only needed fields

### 4. Reduce Bundle Size
- Tree-shake unused dependencies
- Use dynamic imports for heavy modules
- Minimize serverless function size
