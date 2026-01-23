# Environment Configuration Guide

This document explains the environment variable setup for the College Portal application.

## Quick Setup

Run the automated setup script:
```bash
./setup-env.sh
```

This will create all necessary `.env` files with secure defaults.

## Environment Files Structure

### Root `.env` (Docker Compose)
Location: `/home/common/Documents/gnit/.env`

Used for Docker Compose deployment. Contains:
- Server configuration (PORT, NODE_ENV)
- MongoDB connection (MONGO_URI, credentials)
- JWT secrets (ACCESS_SECRET, REFRESH_SECRET)
- Client configuration (CLIENT_ORIGIN, VITE_API_BASE_URL)
- Port mappings

**Template:** `env.template`

### Server `.env`
Location: `/home/common/Documents/gnit/server/.env`

Used for local server development. Contains:
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `CLIENT_ORIGIN` - Frontend URL for CORS

**Template:** `server/.env.example`

### Frontend `.env` (Root)
Location: `/home/common/Documents/gnit/.env`

Used for local frontend development. Contains:
- `VITE_API_BASE_URL` - Backend API URL (must end with `/api`)

**Template:** `.env.example` (in root directory)

## Required Environment Variables

### For Docker Compose (Root `.env`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `SERVER_PORT` | Server port | No | `3000` |
| `MONGO_URI` | MongoDB connection | Yes | `mongodb://mongo:27017/college_portal` |
| `MONGO_ROOT_USERNAME` | MongoDB root user | Yes | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | Yes | `strong_password_here` |
| `JWT_ACCESS_SECRET` | JWT access secret | Yes | (32+ char random string) |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Yes | (32+ char random string) |
| `CLIENT_ORIGIN` | Frontend URL | Yes | `http://localhost` or `https://yourdomain.com` |
| `VITE_API_BASE_URL` | API URL for client | Yes | `http://localhost:3000/api` |
| `CLIENT_PORT` | Client port | No | `80` |

### For Server Development (`server/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `3000` |
| `MONGO_URI` | MongoDB connection | Yes | - |
| `JWT_ACCESS_SECRET` | JWT access secret | Yes | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Yes | - |
| `CLIENT_ORIGIN` | Frontend URL for CORS | Yes | `http://localhost:5173` |

### For Frontend Development (Root `.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Yes | `http://localhost:3000/api` |

## Generating Secure Secrets

### JWT Secrets
Generate secure random secrets using one of these methods:

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using Python:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## MongoDB Connection Strings

### Local MongoDB (Docker Compose)
```
MONGO_URI=mongodb://mongo:27017/college_portal
```

### Local MongoDB with Authentication
```
MONGO_URI=mongodb://username:password@localhost:27017/college_portal?authSource=admin
```

### MongoDB Atlas (Cloud)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college_portal?retryWrites=true&w=majority
```

## Production Configuration

### For Production Deployment:

1. **Update CLIENT_ORIGIN**
   ```env
   CLIENT_ORIGIN=https://yourdomain.com
   ```

2. **Update VITE_API_BASE_URL**
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   # OR if same domain:
   VITE_API_BASE_URL=https://yourdomain.com/api
   ```

3. **Set Strong MongoDB Password**
   ```env
   MONGO_ROOT_PASSWORD=your_very_strong_password_here
   ```

4. **Generate and Set JWT Secrets**
   ```bash
   # Generate secrets
   JWT_ACCESS_SECRET=$(openssl rand -base64 32)
   JWT_REFRESH_SECRET=$(openssl rand -base64 32)
   
   # Add to .env file
   ```

5. **Use HTTPS in Production**
   - All URLs should use `https://`
   - Set up SSL certificates (Let's Encrypt recommended)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, random secrets** (32+ characters)
3. **Use different secrets** for development and production
4. **Rotate secrets** periodically in production
5. **Use environment-specific values** (dev/staging/prod)
6. **Restrict file permissions** on `.env` files:
   ```bash
   chmod 600 .env
   ```

## Troubleshooting

### "MONGO_URI is required" Error
- Ensure `MONGO_URI` is set in your `.env` file
- Check that the connection string is correct
- Verify MongoDB is running and accessible

### "JWT_ACCESS_SECRET is required" Error
- Ensure JWT secrets are set in your `.env` file
- Generate new secrets if missing
- Check for typos in variable names

### CORS Errors
- Verify `CLIENT_ORIGIN` matches your frontend URL exactly
- Include protocol (`http://` or `https://`)
- No trailing slash
- For Docker Compose, use the external URL, not `localhost`

### Client Can't Connect to API
- Verify `VITE_API_BASE_URL` is correct
- Ensure it ends with `/api`
- Check that the backend is running
- Verify network connectivity

## Verification

After setting up environment variables, verify the configuration:

```bash
# Check if .env files exist
ls -la .env server/.env client/.env

# Verify Docker Compose can read variables
docker-compose -f docker-compose.prod.yml config

# Test server startup (will show errors if env vars are missing)
cd server && npm run dev
```

## Additional Resources

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [README.md](./README.md) - Project overview
- [SECURITY.md](./SECURITY.md) - Security documentation

