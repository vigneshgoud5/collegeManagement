#!/bin/bash

# Environment setup script
set -e

echo "🔧 Setting up environment files..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate random secret
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    elif command -v node &> /dev/null; then
        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    else
        echo "Warning: Could not generate random secret. Please install openssl or node."
        echo "change_me_$(date +%s | sha256sum | base64 | head -c 32)"
    fi
}

# Setup root .env for Docker Compose
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating root .env file...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
    elif [ -f env.template ]; then
        cp env.template .env
    else
        echo -e "${YELLOW}⚠️  No .env.example or env.template found. Creating basic .env...${NC}"
        cat > .env << EOF
NODE_ENV=production
SERVER_PORT=3000
MONGO_URI=mongodb://mongo:27017/college_portal
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=change_me_strong_password_here
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_ORIGIN=http://localhost
VITE_API_BASE_URL=http://localhost:3000/api
CLIENT_PORT=80
EOF
    fi
    
    # Generate JWT secrets
    echo -e "${YELLOW}Generating JWT secrets...${NC}"
    ACCESS_SECRET=$(generate_secret)
    REFRESH_SECRET=$(generate_secret)
    
    # Update .env file with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$ACCESS_SECRET/" .env
        sed -i '' "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$REFRESH_SECRET/" .env
    else
        # Linux
        sed -i "s/JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$ACCESS_SECRET/" .env
        sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$REFRESH_SECRET/" .env
    fi
    
    echo -e "${GREEN}✅ Root .env file created with generated JWT secrets${NC}"
    echo -e "${YELLOW}⚠️  Please review and update the following in .env:${NC}"
    echo "   - MONGO_ROOT_PASSWORD (set a strong password)"
    echo "   - CLIENT_ORIGIN (your frontend URL)"
    echo "   - VITE_API_BASE_URL (your backend API URL)"
else
    echo -e "${YELLOW}⚠️  Root .env file already exists, skipping...${NC}"
fi

# Setup server .env
if [ ! -f server/.env ]; then
    echo -e "${GREEN}Creating server/.env file...${NC}"
    cp server/.env.example server/.env
    echo -e "${GREEN}✅ Server .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please review and update server/.env with your configuration${NC}"
else
    echo -e "${YELLOW}⚠️  Server .env file already exists, skipping...${NC}"
fi

# Frontend .env is now in root directory (VITE_API_BASE_URL is in root .env)
# No separate client/.env file needed

echo ""
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Review and update .env files with your configuration"
echo "   2. For production, update:"
echo "      - CLIENT_ORIGIN (your domain)"
echo "      - VITE_API_BASE_URL (your backend URL)"
echo "      - MONGO_ROOT_PASSWORD (strong password)"
echo "   3. Run: ./deploy.sh (for Docker Compose deployment)"

