#!/bin/bash

# ============================================================================
# Database Migration Script
# ============================================================================
# This script runs Prisma migrations against the database specified in
# DATABASE_URL environment variable.
#
# Usage:
#   ./scripts/db-migrate.sh
#
# Requirements:
#   - DATABASE_URL must be set (or in .env.local)
#   - Prisma must be installed (npm install in apps/api)
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================================================"
echo "Database Migration Script"
echo "============================================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "apps/api/prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: schema.prisma not found${NC}"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Navigate to API directory
cd apps/api

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    # Try to load from .env.local
    if [ -f ".env.local" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not set, trying to load from .env.local${NC}"
        export $(grep -v '^#' .env.local | xargs)
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ Error: DATABASE_URL is not set${NC}"
        echo ""
        echo "Please set DATABASE_URL:"
        echo "  export DATABASE_URL='postgres://user:pass@host.neon.tech/db?sslmode=require'"
        echo ""
        echo "Or create apps/api/.env.local with:"
        echo "  DATABASE_URL=postgres://user:pass@host.neon.tech/db?sslmode=require"
        exit 1
    fi
fi

# Validate DATABASE_URL format
if [[ ! "$DATABASE_URL" =~ ^postgres:// ]] && [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo -e "${YELLOW}⚠️  Warning: DATABASE_URL does not start with postgres:// or postgresql://${NC}"
    echo "   This may cause connection issues"
fi

echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
echo ""

# Check if Prisma is installed
if [ ! -d "node_modules/@prisma/client" ]; then
    echo -e "${YELLOW}⚠️  Prisma not found, installing dependencies...${NC}"
    npm install
fi

echo "Running Prisma migrations..."
echo ""

# Run migrations
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify database connection: npx prisma db pull"
    echo "  2. View database: npx prisma studio"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Migration failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check DATABASE_URL is correct"
    echo "  2. Verify database is accessible (not paused)"
    echo "  3. Check Neon dashboard for connection issues"
    echo ""
    exit 1
fi

