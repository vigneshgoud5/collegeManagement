# College Student Management Portal

A full-stack web application for managing college students and academic staff, built with React, Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with HttpOnly cookies
  - Role-based access control (Student, Faculty, Administrator)
  - Secure password hashing with bcrypt

- **Student Management**
  - Student self-service portal
  - Profile management
  - Contact information updates

- **Academic Staff Management**
  - Faculty and Administrator roles
  - Student management (view, create, update, delete)
  - Faculty management (view, create, update, delete, activate/deactivate)
  - Search and filter capabilities

- **Security Features**
  - Input validation and sanitization
  - Rate limiting
  - Security headers (Helmet)
  - CORS configuration
  - Request size limits

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router, React Query, Zustand
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Security**: JWT, bcrypt, Helmet, express-rate-limit, express-validator
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- MongoDB (or use Docker)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gnit
   ```

2. **Set up environment variables**
   ```bash
   # Automated setup (recommended)
   ./setup-env.sh
   
   # OR manual setup:
   # Server
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   
   # Client
   cd ../client
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB** (if not using Docker)
   ```bash
   # Using Docker
   docker-compose up -d mongo
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm install
   npm run dev
   
   # Terminal 2 - Frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy with Docker Compose:**
```bash
# Configure environment (automated)
./setup-env.sh
# Review and update .env with production values

# Deploy
./deploy.sh
# OR
docker-compose -f docker-compose.prod.yml up -d --build
```

## Project Structure

```
gnit/
├── src/                    # React frontend source
│   ├── api/               # API client functions
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── store/             # Zustand state management
│   └── styles/            # CSS styles
├── public/                # Static assets
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   └── Dockerfile
├── docker-compose.yml      # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
└── deploy.sh              # Deployment script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/password` - Change password
- `PUT /api/auth/profile` - Update profile (academic)

### Student Self-Service
- `GET /api/students/me` - Get own profile
- `PUT /api/students/me` - Update own contact info
- `PUT /api/students/me/password` - Change password

### Academic - Students Management
- `GET /api/students` - List students (with filters)
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student (admin only)
- `PUT /api/students/:id` - Update student (admin only)
- `PATCH /api/students/:id/status` - Toggle student status
- `DELETE /api/students/:id` - Delete student (admin only)

### Academic - Faculty Management
- `GET /api/faculty` - List faculty (with filters)
- `GET /api/faculty/:id` - Get faculty details
- `POST /api/faculty` - Create faculty (admin only)
- `PUT /api/faculty/:id` - Update faculty (admin only)
- `PATCH /api/faculty/:id/status` - Toggle faculty status (admin only)
- `DELETE /api/faculty/:id` - Delete faculty (admin only)

## Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## Environment Variables

See `.env.example` for required environment variables.

## Security

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## License

ISC

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).
