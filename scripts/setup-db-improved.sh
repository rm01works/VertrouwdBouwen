#!/bin/bash

# VertrouwdBouwen Database Setup Script (Verbeterd)
# Dit script helpt bij het opzetten van de database voor de eerste keer

set -e  # Stop bij errors

echo "🚀 VertrouwdBouwen Database Setup"
echo "============================"
echo ""

# Check of we in de juiste directory zijn
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml niet gevonden. Draai dit script vanuit de root directory."
    exit 1
fi

# Check of Docker beschikbaar is
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is niet geïnstalleerd of niet in PATH"
    echo ""
    echo "📦 Opties om verder te gaan:"
    echo "   1. Installeer Docker Desktop: https://www.docker.com/products/docker-desktop/"
    echo "   2. Of gebruik lokale PostgreSQL (zie DATABASE_SETUP.md)"
    echo ""
    echo "🔄 Probeer je Docker te installeren? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "📥 Open https://www.docker.com/products/docker-desktop/ in je browser"
        echo "⏳ Wacht tot Docker Desktop geïnstalleerd en gestart is, en draai dit script opnieuw."
        exit 0
    else
        echo "📖 Zie DATABASE_SETUP.md voor instructies met lokale PostgreSQL"
        exit 1
    fi
fi

# Check of Docker daemon draait
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon draait niet"
    echo "🔄 Start Docker Desktop en probeer opnieuw"
    exit 1
fi

echo "✅ Docker is beschikbaar"
echo ""

# Stap 1: Start PostgreSQL
echo "📦 Stap 1: PostgreSQL database starten..."
docker-compose up -d postgres

# Wacht tot database klaar is
echo "⏳ Wachten tot database klaar is..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec vertrouwdbouwen-postgres pg_isready -U vertrouwdbouwen &> /dev/null; then
        echo "✅ PostgreSQL is klaar"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Poging $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Error: PostgreSQL is niet klaar na $max_attempts pogingen"
    echo "📋 Check logs: docker-compose logs postgres"
    exit 1
fi

# Check of database draait
if ! docker ps | grep -q vertrouwdbouwen-postgres; then
    echo "❌ Error: PostgreSQL container draait niet"
    exit 1
fi

echo ""

# Stap 2: Check .env bestand
echo "📝 Stap 2: Environment variables controleren..."
cd apps/api

if [ ! -f ".env" ]; then
    echo "⚠️  .env bestand niet gevonden. Maak .env aan..."
    
    # Genereer JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen?schema=public

# JWT Secret (veilige random string)
JWT_SECRET=$JWT_SECRET

# JWT Expiration
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origin (frontend URL)
CORS_ORIGIN=http://localhost:3000
EOF
    echo "✅ .env aangemaakt met gegenereerde JWT_SECRET"
else
    echo "✅ .env bestand bestaat al"
    
    # Check of DATABASE_URL correct is
    if ! grep -q "DATABASE_URL=postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen" .env; then
        echo "⚠️  DATABASE_URL lijkt niet correct. Check .env bestand"
    fi
    
    # Check of JWT_SECRET bestaat
    if ! grep -q "JWT_SECRET=" .env || grep -q "JWT_SECRET=$" .env; then
        echo "⚠️  JWT_SECRET ontbreekt of is leeg. Voeg toe aan .env"
    fi
fi

echo ""

# Stap 3: Dependencies installeren
echo "📦 Stap 3: Dependencies installeren..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies geïnstalleerd"
else
    echo "✅ Dependencies zijn al geïnstalleerd"
fi

echo ""

# Stap 4: Prisma Client genereren
echo "🔧 Stap 4: Prisma Client genereren..."
npx prisma generate
echo "✅ Prisma Client gegenereerd"
echo ""

# Stap 5: Eerste migratie
echo "🗄️  Stap 5: Database migratie uitvoeren..."
echo "Dit kan even duren bij de eerste keer..."
npx prisma migrate dev --name init

echo ""
echo "✅ Database setup compleet!"
echo ""
echo "📊 Volgende stappen:"
echo "   1. Open Prisma Studio: cd apps/api && npx prisma studio"
echo "   2. Seed database (optioneel): cd apps/api && npm run create-test-users"
echo "   3. Start development server: cd apps/api && npm run dev"
echo ""
echo "🎉 Je kunt nu login/registratie testen!"

