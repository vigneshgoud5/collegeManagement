#!/bin/bash

# MongoDB Atlas Connection Setup Script
# This script helps you set up MongoDB Atlas connection for local development

echo "=========================================="
echo "MongoDB Atlas Connection Setup"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "✅ .env file created"
    echo ""
fi

echo "Please provide your MongoDB Atlas connection details:"
echo ""

# Get MongoDB Atlas connection string
read -p "Enter your MongoDB Atlas connection string: " MONGO_URI
echo ""

# Validate connection string format
if [[ ! $MONGO_URI =~ ^mongodb\+srv:// ]]; then
    echo "⚠️  Warning: Connection string should start with 'mongodb+srv://'"
    read -p "Continue anyway? (y/n): " continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy] ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Get other required values
read -p "Enter JWT Access Secret (or press Enter to generate): " JWT_ACCESS_SECRET
if [ -z "$JWT_ACCESS_SECRET" ]; then
    JWT_ACCESS_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" 2>/dev/null || echo "change_me_$(date +%s)")
    echo "Generated JWT_ACCESS_SECRET: $JWT_ACCESS_SECRET"
fi

read -p "Enter JWT Refresh Secret (or press Enter to generate): " JWT_REFRESH_SECRET
if [ -z "$JWT_REFRESH_SECRET" ]; then
    JWT_REFRESH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" 2>/dev/null || echo "change_me_$(date +%s)")
    echo "Generated JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET"
fi

read -p "Enter PORT (default: 3000): " PORT
PORT=${PORT:-3000}

read -p "Enter CLIENT_ORIGIN (default: http://localhost:5173): " CLIENT_ORIGIN
CLIENT_ORIGIN=${CLIENT_ORIGIN:-http://localhost:5173}

read -p "Enter NODE_ENV (default: development): " NODE_ENV
NODE_ENV=${NODE_ENV:-development}

echo ""
echo "=========================================="
echo "Updating .env file..."
echo "=========================================="

# Update .env file
cat > .env << EOF
# MongoDB Atlas Connection
MONGO_URI=$MONGO_URI

# Server Configuration
PORT=$PORT
NODE_ENV=$NODE_ENV

# JWT Secrets
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Client Configuration
CLIENT_ORIGIN=$CLIENT_ORIGIN
VITE_API_BASE_URL=http://localhost:$PORT/api
EOF

echo "✅ .env file updated successfully!"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Verify your MongoDB Atlas Network Access allows your IP"
echo "2. Test the connection by running: cd server && npm run dev"
echo "3. For Vercel deployment, add these environment variables in Vercel dashboard"
echo ""
echo "📖 See MONGODB_ATLAS_SETUP.md for detailed instructions"
echo ""
