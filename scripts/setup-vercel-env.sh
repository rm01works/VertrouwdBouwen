#!/bin/bash
# ============================================================================
# Vercel Environment Variables Setup Script
# ============================================================================
# Dit script helpt je bij het toevoegen van environment variables aan Vercel
# 
# ⚠️ BELANGRIJK: Je moet de waarden zelf invullen wanneer daarom wordt gevraagd
# ============================================================================

set -e

echo "🔧 Vercel Environment Variables Setup"
echo "======================================"
echo ""
echo "⚠️  Dit script voegt environment variables toe aan je Vercel project."
echo "    Je moet de waarden zelf invullen wanneer daarom wordt gevraagd."
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
  echo "❌ Error: Vercel CLI niet gevonden. Installeer met: npm i -g vercel"
  exit 1
fi

# Use npx vercel if vercel is not installed globally
VERCEL_CMD="vercel"
if ! command -v vercel &> /dev/null; then
  VERCEL_CMD="npx vercel"
fi

# Check if logged in
echo "🔐 Controleren of je bent ingelogd bij Vercel..."
if ! $VERCEL_CMD whoami &> /dev/null; then
  echo "❌ Je bent niet ingelogd bij Vercel."
  echo "   Log eerst in met: $VERCEL_CMD login"
  exit 1
fi

echo "✅ Ingelogd bij Vercel"
echo ""

# Ask which project to configure
echo "📋 Welk project wil je configureren?"
echo "   1. API Backend (apps/api)"
echo "   2. Web Frontend (apps/web)"
echo "   3. Beide"
read -p "   Kies (1/2/3): " PROJECT_CHOICE

case $PROJECT_CHOICE in
  1)
    PROJECT_DIR="apps/api"
    setup_api=true
    setup_web=false
    ;;
  2)
    PROJECT_DIR="apps/web"
    setup_api=false
    setup_web=true
    ;;
  3)
    setup_api=true
    setup_web=true
    ;;
  *)
    echo "❌ Ongeldige keuze"
    exit 1
    ;;
esac

# Function to add env var
add_env_var() {
  local var_name=$1
  local environments=$2
  local description=$3
  
  echo ""
  echo "📝 Toevoegen: $var_name"
  echo "   $description"
  echo ""
  
  for env in $environments; do
    echo "   → $env environment:"
    $VERCEL_CMD env add "$var_name" "$env" --yes 2>&1 || {
      echo "   ⚠️  Kon niet toevoegen voor $env (mogelijk al ingesteld of interactieve input nodig)"
    }
  done
}

# Setup API Backend
if [ "$setup_api" = true ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "🔧 API Backend Environment Variables"
  echo "═══════════════════════════════════════════════════════"
  
  cd apps/api || exit 1
  
  # DATABASE_URL
  echo ""
  echo "1️⃣  DATABASE_URL (Neon PostgreSQL connection string)"
  echo "    Format: postgres://USER:PASSWORD@HOST/DB?sslmode=require"
  echo "    ⚠️  Verwijder 'channel_binding=require' als die aanwezig is"
  read -p "    Druk Enter om door te gaan..." 
  add_env_var "DATABASE_URL" "production preview development" "Neon PostgreSQL connection string"
  
  # JWT_SECRET
  echo ""
  echo "2️⃣  JWT_SECRET (Secret voor JWT token signing)"
  echo "    Genereer met: openssl rand -base64 32"
  read -p "    Druk Enter om door te gaan..."
  add_env_var "JWT_SECRET" "production preview development" "JWT secret key"
  
  # NODE_ENV (optional)
  echo ""
  echo "3️⃣  NODE_ENV (optioneel, default: development)"
  read -p "    Toevoegen? (j/n): " ADD_NODE_ENV
  if [ "$ADD_NODE_ENV" = "j" ]; then
    add_env_var "NODE_ENV" "production" "Environment mode (production)"
  fi
  
  # CORS_ORIGIN (optional)
  echo ""
  echo "4️⃣  CORS_ORIGIN (optioneel, frontend URL)"
  read -p "    Toevoegen? (j/n): " ADD_CORS
  if [ "$ADD_CORS" = "j" ]; then
    read -p "    Frontend URL (bijv. https://your-app.vercel.app): " CORS_URL
    if [ -n "$CORS_URL" ]; then
      echo "    Toevoegen CORS_ORIGIN=$CORS_URL..."
      $VERCEL_CMD env add "CORS_ORIGIN" "production" --yes 2>&1 || echo "    ⚠️  Kon niet toevoegen"
    fi
  fi
  
  cd ../..
fi

# Setup Web Frontend
if [ "$setup_web" = true ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "🔧 Web Frontend Environment Variables"
  echo "═══════════════════════════════════════════════════════"
  
  cd apps/web || exit 1
  
  # NEXT_PUBLIC_API_URL
  echo ""
  echo "1️⃣  NEXT_PUBLIC_API_URL (URL naar Express API backend)"
  echo "    Format: https://your-api.vercel.app (zonder trailing slash)"
  read -p "    Druk Enter om door te gaan..."
  add_env_var "NEXT_PUBLIC_API_URL" "production preview development" "API backend URL"
  
  cd ../..
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Environment Variables Setup Voltooid!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Volgende stappen:"
echo "   1. Controleer de environment variables in Vercel Dashboard"
echo "   2. Redeploy de applicatie: vercel --prod"
echo "   3. Test de endpoints:"
echo "      - curl https://your-api.vercel.app/api/health"
echo "      - curl https://your-api.vercel.app/api/health/db"
echo ""

