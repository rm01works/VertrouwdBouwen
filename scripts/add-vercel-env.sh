#!/bin/bash
# ============================================================================
# Add Vercel Environment Variables
# ============================================================================
# Dit script voegt alle environment variables toe aan Vercel
# 
# ⚠️  Je moet eerst inloggen: npx vercel login
# ⚠️  Je moet de waarden invullen wanneer daarom wordt gevraagd
# ============================================================================

# Don't exit on error, we want to handle errors ourselves
set +e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

VERCEL_CMD="npx vercel"

echo "🔧 Vercel Environment Variables Toevoegen"
echo "=========================================="
echo "Project root: $PROJECT_ROOT"
echo ""

# Check login
if ! $VERCEL_CMD whoami &> /dev/null; then
  echo "❌ Je bent niet ingelogd bij Vercel."
  echo "   Voer eerst uit: $VERCEL_CMD login"
  exit 1
fi

echo "✅ Ingelogd bij Vercel"
echo ""

# Check if project is linked by trying to list env vars
check_linked() {
  local dir=$1
  local full_path="$PROJECT_ROOT/$dir"
  if [ ! -d "$full_path" ]; then
    return 1
  fi
  cd "$full_path" 2>/dev/null || return 1
  # Try to list env vars - if project is linked, this won't error
  if $VERCEL_CMD env ls &> /dev/null; then
    cd "$PROJECT_ROOT" > /dev/null
    return 0
  else
    cd "$PROJECT_ROOT" > /dev/null
    return 1
  fi
}

link_project() {
  local dir=$1
  local name=$2
  local full_path="$PROJECT_ROOT/$dir"
  
  echo ""
  echo "🔗 Project linken voor $name..."
  echo "   Het project moet eerst gelinkt zijn aan een Vercel project."
  echo ""
  echo "   We proberen nu automatisch te linken..."
  echo ""
  
  if [ ! -d "$full_path" ]; then
    echo "   ❌ Directory niet gevonden: $full_path"
    return 1
  fi
  
  cd "$full_path" || return 1
  
  echo "   Uitvoeren: $VERCEL_CMD link"
  echo "   (Volg de prompts om een project te kiezen of aan te maken)"
  echo ""
  
  # Try to link automatically
  if $VERCEL_CMD link; then
    echo ""
    # Check if linked now
    cd "$PROJECT_ROOT" > /dev/null
    if check_linked "$dir"; then
      echo "   ✅ Project gelinkt!"
      return 0
    else
      echo "   ⚠️  Link commando uitgevoerd, maar project lijkt nog niet gelinkt."
      echo "   Controleer handmatig: cd $dir && $VERCEL_CMD env ls"
      return 1
    fi
  else
    echo ""
    echo "   ⚠️  Link commando gefaald of geannuleerd."
    echo "   Probeer handmatig: cd $dir && $VERCEL_CMD link"
    cd "$PROJECT_ROOT" > /dev/null
    return 1
  fi
}

# API Backend
echo "═══════════════════════════════════════════════════════"
echo "📦 API Backend Environment Variables"
echo "═══════════════════════════════════════════════════════"
echo ""

API_DIR="$PROJECT_ROOT/apps/api"
cd "$API_DIR" || exit 1

# Check if linked, if not, try to link
if ! check_linked "apps/api"; then
  echo "⚠️  API project is niet gelinkt aan Vercel."
  if ! link_project "apps/api" "API Backend"; then
    echo "❌ Kan niet doorgaan zonder gelinkt project."
    echo "   Link eerst het project: cd apps/api && $VERCEL_CMD link"
    cd "$PROJECT_ROOT"
    exit 1
  fi
fi

echo "1️⃣  DATABASE_URL toevoegen..."
echo "   (Neon PostgreSQL connection string)"
echo "   Format: postgres://USER:PASSWORD@HOST/DB?sslmode=require"
echo ""
$VERCEL_CMD env add DATABASE_URL production
$VERCEL_CMD env add DATABASE_URL preview
$VERCEL_CMD env add DATABASE_URL development

echo ""
echo "2️⃣  JWT_SECRET toevoegen..."
echo "   (Genereer met: openssl rand -base64 32)"
echo ""
$VERCEL_CMD env add JWT_SECRET production
$VERCEL_CMD env add JWT_SECRET preview
$VERCEL_CMD env add JWT_SECRET development

echo ""
echo "3️⃣  NODE_ENV toevoegen (optioneel)..."
read -p "   NODE_ENV toevoegen voor production? (j/n): " ADD_NODE_ENV
if [ "$ADD_NODE_ENV" = "j" ]; then
  $VERCEL_CMD env add NODE_ENV production
fi

echo ""
echo "4️⃣  CORS_ORIGIN toevoegen (optioneel)..."
read -p "   CORS_ORIGIN toevoegen? (j/n): " ADD_CORS
if [ "$ADD_CORS" = "j" ]; then
  read -p "   Frontend URL: " CORS_URL
  if [ -n "$CORS_URL" ]; then
    $VERCEL_CMD env add CORS_ORIGIN production <<< "$CORS_URL"
  fi
fi

cd ../..

# Web Frontend
echo ""
echo "═══════════════════════════════════════════════════════"
echo "🌐 Web Frontend Environment Variables"
echo "═══════════════════════════════════════════════════════"
echo ""

WEB_DIR="$PROJECT_ROOT/apps/web"
cd "$WEB_DIR" || exit 1

# Check if linked, if not, try to link
if ! check_linked "apps/web"; then
  echo "⚠️  Web project is niet gelinkt aan Vercel."
  if ! link_project "apps/web" "Web Frontend"; then
    echo "⚠️  Web project niet gelinkt, overslaan..."
    cd "$PROJECT_ROOT"
    echo ""
    echo "⚠️  Web environment variables niet toegevoegd."
    echo "   Link eerst het project: cd apps/web && $VERCEL_CMD link"
    exit 0
  fi
fi

echo "1️⃣  NEXT_PUBLIC_API_URL toevoegen..."
echo "   (URL naar Express API backend)"
echo "   Format: https://your-api.vercel.app (zonder trailing slash)"
echo ""
$VERCEL_CMD env add NEXT_PUBLIC_API_URL production
$VERCEL_CMD env add NEXT_PUBLIC_API_URL preview
$VERCEL_CMD env add NEXT_PUBLIC_API_URL development

cd "$PROJECT_ROOT"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Klaar!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Volgende stappen:"
echo "   1. Controleer environment variables in Vercel Dashboard"
echo "   2. Redeploy: cd apps/api && $VERCEL_CMD --prod"
echo "   3. Test endpoints: curl https://your-api.vercel.app/api/health/db"
echo ""

