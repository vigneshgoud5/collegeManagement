# Deployment Guide

This guide covers deploying the College Student Management Portal to production.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional, for production)
- SSL certificate (optional, for HTTPS)

## Quick Start with Docker Compose

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd gnit
```

### 2. Configure Environment Variables

**Option 1: Automated Setup (Recommended)**
```bash
./setup-env.sh
```
This script will:
- Create all necessary .env files
- Generate secure JWT secrets automatically
- Set up default configurations

**Option 2: Manual Setup**

Copy the template environment file and update it:

```bash
cp env.template .env
# OR if .env.example exists:
# cp .env.example .env
```

Edit `.env` and set the following required variables:

```env
# MongoDB
MONGO_ROOT_PASSWORD=your_strong_password_here
MONGO_URI=mongodb://mongo:27017/college_portal

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Client Origin (your domain or IP)
CLIENT_ORIGIN=http://your-domain.com
VITE_API_BASE_URL=http://your-domain.com:3000/api

# Ports
SERVER_PORT=3000
CLIENT_PORT=80
```

### 3. Generate JWT Secrets

```bash
# Generate secure random secrets
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)"
```

### 4. Build and Start Services

**Note:** Docker Compose v2 uses `docker compose` (with space), v1 uses `docker-compose` (with hyphen). The deployment scripts auto-detect the correct command.

```bash
# Option 1: Use the deployment script (recommended - auto-detects Docker Compose version)
./deploy.sh

# Option 2: Manual deployment
# For Docker Compose v2 (modern):
docker compose -f docker-compose.prod.yml up -d --build

# For Docker Compose v1 (legacy):
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f
# OR
docker-compose -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.prod.yml ps
# OR
docker-compose -f docker-compose.prod.yml ps
```

### 5. Verify Deployment

- Frontend: http://your-domain.com (or http://localhost)
- Backend API: http://your-domain.com:3000/api/health
- MongoDB: localhost:27017

## Production Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

Best for: VPS, dedicated servers, or cloud VMs

**Steps:**
1. Set up a VPS (Ubuntu 20.04+ recommended)
2. Install Docker and Docker Compose
3. Clone repository
4. Configure `.env` file
5. Run `docker-compose -f docker-compose.prod.yml up -d`

**Nginx Reverse Proxy Setup:**

Create `/etc/nginx/sites-available/college-portal`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/college-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Separate Deployments

#### Frontend: Vercel/Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-api-domain.com/api`

#### Backend: Railway/Render/Heroku

1. Connect your GitHub repository
2. Set root directory: `server`
3. Add environment variables:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_ORIGIN` (your frontend URL)
   - `PORT` (usually auto-set by platform)

#### Database: MongoDB Atlas

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Whitelist your server IP
5. Get connection string and use as `MONGO_URI`

### Option 3: Kubernetes

See `k8s/` directory for Kubernetes manifests (if needed).

## Environment Variables Reference

### Server (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | No | `3000` |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_ACCESS_SECRET` | JWT access token secret | Yes | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes | - |
| `CLIENT_ORIGIN` | Frontend URL for CORS | Yes | - |

### Client (Build-time)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Yes | - |

## Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (32+ characters)
- [ ] Use HTTPS in production
- [ ] Set secure MongoDB credentials
- [ ] Configure firewall rules
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting appropriately
- [ ] Review and update CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure automated backups

## Maintenance

### Update Application

```bash
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database

```bash
docker-compose -f docker-compose.prod.yml exec mongo mongodump --out /data/backup
docker-compose -f docker-compose.prod.yml cp mongo:/data/backup ./backup
```

### Restore Database

```bash
docker-compose -f docker-compose.prod.yml cp ./backup mongo:/data/backup
docker-compose -f docker-compose.prod.yml exec mongo mongorestore /data/backup
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f server
docker-compose -f docker-compose.prod.yml logs -f client
docker-compose -f docker-compose.prod.yml logs -f mongo
```

### Stop Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### Stop and Remove Volumes

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

### Services won't start

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables are set correctly
3. Check port availability: `netstat -tulpn | grep :3000`
4. Ensure MongoDB is healthy: `docker-compose -f docker-compose.prod.yml ps`

### Database connection issues

1. Verify `MONGO_URI` is correct
2. Check MongoDB container is running: `docker-compose -f docker-compose.prod.yml ps mongo`
3. Check MongoDB logs: `docker-compose -f docker-compose.prod.yml logs mongo`

### CORS errors

1. Verify `CLIENT_ORIGIN` matches your frontend URL exactly
2. Check browser console for specific CORS error
3. Ensure backend is accessible from frontend domain

## Production Best Practices

1. **Use Environment Variables**: Never commit `.env` files
2. **Enable HTTPS**: Use Let's Encrypt or similar for SSL certificates
3. **Set Up Monitoring**: Use tools like PM2, New Relic, or Datadog
4. **Regular Backups**: Automate MongoDB backups
5. **Update Dependencies**: Regularly update npm packages
6. **Security Headers**: Already configured via Helmet middleware
7. **Rate Limiting**: Already configured, adjust limits as needed
8. **Logging**: Set up centralized logging (e.g., ELK stack)

## Support

For issues or questions, please refer to the main README.md or open an issue in the repository.

