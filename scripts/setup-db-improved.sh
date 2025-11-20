
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

