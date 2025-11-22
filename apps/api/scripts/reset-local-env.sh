#!/bin/bash
# ============================================================================
# Reset Local Environment Variables Script
# ============================================================================
# Dit script maakt een backup van bestaande .env.local en genereert een nieuwe
# op basis van .env.example
# ============================================================================

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$API_DIR/.env.local"
ENV_EXAMPLE="$API_DIR/.env.example"

echo "🔧 Reset Local Environment Variables"
echo "======================================"
echo ""

# Check if .env.example exists
if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "❌ Error: .env.example not found at $ENV_EXAMPLE"
  echo "   Please create .env.example first"
  exit 1
fi

# Backup existing .env.local if it exists
if [ -f "$ENV_FILE" ]; then
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="${ENV_FILE}.bak-${TIMESTAMP}"
  echo "📦 Creating backup of existing .env.local..."
  cp "$ENV_FILE" "$BACKUP_FILE"
  echo "   ✅ Backup created: $BACKUP_FILE"
  echo ""
fi

# Copy .env.example to .env.local
echo "📝 Generating new .env.local from .env.example..."
cp "$ENV_EXAMPLE" "$ENV_FILE"
echo "   ✅ Created: $ENV_FILE"
echo ""

echo "⚠️  IMPORTANT: Edit .env.local and fill in the actual values!"
echo "   Required variables:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
echo ""

