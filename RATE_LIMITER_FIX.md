# Rate Limiter Fix for Vercel Serverless

## Problem
The serverless function was throwing rate limiting errors:
1. `ERR_ERL_UNDEFINED_IP_ADDRESS` - `request.ip` was undefined
2. `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` - `X-Forwarded-For` header set but `trust proxy` was false
3. `ERR_ERL_FORWARDED_HEADER` - `Forwarded` header was being ignored

These errors occurred because:
- Vercel serverless functions use proxy headers (`X-Forwarded-For`)
- Express needs `trust proxy` enabled to properly handle these headers
- Rate limiter needs a custom `keyGenerator` to extract IP from proxy headers

## Solution Applied

### 1. **Enable Trust Proxy** (`server/src/app.ts`)
```typescript
// Trust proxy for Vercel serverless (required for rate limiting to work correctly)
app.set('trust proxy', true);
```

This tells Express to trust the `X-Forwarded-For` header from Vercel's proxy.

### 2. **Custom Key Generator** (`server/src/middleware/security.ts`)
```typescript
const getKeyGenerator = () => {
  return (req: Request): string => {
    // Try to get IP from various sources (works with trust proxy enabled)
    const ip = req.ip || 
               req.socket.remoteAddress || 
               (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
               (req.headers['x-real-ip'] as string) ||
               'unknown';
    return ip;
  };
};
```

This custom generator:
- First tries `req.ip` (works after `trust proxy` is enabled)
- Falls back to `req.socket.remoteAddress`
- Falls back to `X-Forwarded-For` header (first IP in chain)
- Falls back to `X-Real-IP` header
- Defaults to `'unknown'` if all fail

### 3. **Disable Validation** (`server/src/middleware/security.ts`)
```typescript
validate: {
  ip: false, // Disable IP validation (we handle it in keyGenerator)
  xForwardedForHeader: false, // Disable X-Forwarded-For validation (we handle it)
  forwardedHeader: false, // Disable Forwarded header validation
}
```

This disables the built-in validations that were causing errors, since we're handling IP extraction manually.

### 4. **Applied to All Rate Limiters**
- `authRateLimiter` - Authentication endpoints
- `apiRateLimiter` - General API endpoints
- `registerRateLimiter` - Registration endpoint

## Changes Made

### `server/src/app.ts`
- Added `app.set('trust proxy', true)` before middleware setup

### `server/src/middleware/security.ts`
- Added `getKeyGenerator()` function
- Updated all rate limiters with:
  - `keyGenerator: getKeyGenerator()`
  - `validate: { ip: false, xForwardedForHeader: false, forwardedHeader: false }`

## Expected Behavior

### Before Fix
- Rate limiting errors in logs
- Requests might fail or be incorrectly rate limited
- IP addresses not properly identified

### After Fix
- No rate limiting errors
- IP addresses correctly extracted from proxy headers
- Rate limiting works correctly in serverless environment

## Testing

### Test Rate Limiting
```bash
# Make multiple requests quickly
for i in {1..10}; do
  curl -X POST "https://college-management-blond.vercel.app/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test","role":"student"}'
done

# Should eventually get rate limited (after 5 attempts in production)
```

### Check Logs
```bash
# In Vercel Dashboard → Functions → View Logs
# Should see:
# - No rate limiting errors
# - IP addresses correctly identified
# - Rate limiting working as expected
```

## Troubleshooting

### If Rate Limiting Still Errors
1. **Verify `trust proxy` is set**: Check `server/src/app.ts` has `app.set('trust proxy', true)`
2. **Check keyGenerator**: Verify it's applied to all rate limiters
3. **Review Vercel logs**: Look for any remaining rate limiting errors

### If Rate Limiting Too Strict
- Adjust `max` values in rate limiter configs
- Increase `windowMs` for longer time windows
- Check `skipSuccessfulRequests` setting

### If Rate Limiting Not Working
- Verify `keyGenerator` is returning valid IPs
- Check that `validate` options are disabled
- Ensure `trust proxy` is enabled

## Additional Notes

### Serverless Considerations
- Rate limiting in serverless is per-instance (not shared across instances)
- Each serverless function instance has its own rate limit counter
- This is acceptable for most use cases, but for strict global limits, consider using Redis

### IP Address Extraction
The custom key generator handles:
- Direct connections: `req.ip` or `req.socket.remoteAddress`
- Proxy connections: `X-Forwarded-For` (first IP in chain)
- Load balancer: `X-Real-IP`
- Fallback: `'unknown'` (all requests from same IP)

### Performance
- Custom key generator adds minimal overhead
- Disabled validations reduce error checking overhead
- Rate limiting still works efficiently

## Summary

The rate limiting errors were caused by:
- Missing `trust proxy` configuration
- No custom IP extraction for serverless environments
- Built-in validations incompatible with proxy headers

The fix:
- ✅ Enabled `trust proxy` in Express
- ✅ Added custom `keyGenerator` for IP extraction
- ✅ Disabled incompatible validations
- ✅ Applied to all rate limiters

After redeploying, rate limiting should work correctly without errors.
