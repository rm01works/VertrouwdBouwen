#!/bin/bash

# Reset en Test Script voor VertrouwdBouwen
# Dit script reset de Next.js build cache en test de connectiviteit

echo "🔄 VertrouwdBouwen - Reset en Test Script"
echo "=========================================="
echo ""

# Stap 1: Stop eventuele draaiende processen
echo "📋 Stap 1: Controleren draaiende processen..."
NEXT_PID=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')
if [ ! -z "$NEXT_PID" ]; then
    echo "   ⚠️  Next.js dev server draait (PID: $NEXT_PID)"
    echo "   💡 Stop deze handmatig met: kill $NEXT_PID"
else
    echo "   ✅ Geen Next.js dev server gevonden"
fi

# Stap 2: Verwijder build cache
echo ""
echo "📋 Stap 2: Verwijderen build cache..."
cd "$(dirname "$0")/../apps/web"
if [ -d ".next" ]; then
    rm -rf .next
    echo "   ✅ .next map verwijderd"
else
    echo "   ℹ️  .next map bestaat niet"
fi

# Stap 3: Test API server
echo ""
echo "📋 Stap 3: Testen API server connectiviteit..."
API_RESPONSE=$(curl -s http://localhost:5002/api/health 2>/dev/null)
if [ ! -z "$API_RESPONSE" ]; then
    echo "   ✅ API server reageert: $API_RESPONSE"
else
    echo "   ⚠️  API server niet bereikbaar op poort 5002"
    echo "   💡 Start de API server met: cd apps/api && npm run dev"
fi

# Stap 4: Verifieer bestanden
echo ""
echo "📋 Stap 4: Verifiëren App Router bestanden..."
REQUIRED_FILES=(
    "app/layout.tsx"
    "app/page.tsx"
    "app/error.tsx"
    "app/loading.tsx"
    "app/(auth)/login/page.tsx"
    "app/(auth)/register/page.tsx"
)

ALL_OK=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - ONTBREEKT!"
        ALL_OK=false
    fi
done

if [ "$ALL_OK" = true ]; then
    echo ""
    echo "✅ Alle vereiste bestanden zijn aanwezig!"
else
    echo ""
    echo "❌ Sommige bestanden ontbreken!"
fi

# Stap 5: Instructies
echo ""
echo "📋 Stap 5: Volgende stappen"
echo "   ========================================="
echo "   1. Start de dev server:"
echo "      cd apps/web && npm run dev"
echo ""
echo "   2. Open in browser:"
echo "      http://localhost:3000"
echo ""
echo "   3. Test registratie:"
echo "      - Ga naar /register"
echo "      - Vul formulier in"
echo "      - Controleer console voor errors"
echo ""
echo "   4. Test login:"
echo "      - Ga naar /login"
echo "      - Log in met test account"
echo "      - Controleer redirect naar /dashboard"
echo ""
echo "✨ Klaar!"

