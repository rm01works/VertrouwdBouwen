/**
 * Script om te controleren of er al gebruikers in de database staan
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { prisma } from '../src/config/database';

// Laad environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen';
}

// Gebruik de singleton prisma instance uit config/database.ts

async function checkUsers() {
  try {
    console.log('🔍 Controleren of er gebruikers in de database staan...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        companyName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('❌ Geen gebruikers gevonden in de database.\n');
      console.log('💡 Voer het volgende commando uit om testgebruikers aan te maken:');
      console.log('   npm run create-test-users\n');
    } else {
      console.log(`✅ ${users.length} gebruiker(s) gevonden:\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        if (user.companyName) {
          console.log(`   Bedrijf: ${user.companyName}`);
        }
        console.log(`   Aangemaakt: ${user.createdAt.toLocaleString('nl-NL')}`);
        console.log('');
      });

      // Check specifiek op testgebruikers
      const testCustomer = users.find(u => u.email === 'klant@test.nl');
      const testContractor = users.find(u => u.email === 'aannemer@test.nl');

      console.log('📋 Testgebruikers status:');
      if (testCustomer) {
        console.log('   ✅ Consument (klant@test.nl) - AANWEZIG');
      } else {
        console.log('   ❌ Consument (klant@test.nl) - NIET AANWEZIG');
      }
      
      if (testContractor) {
        console.log('   ✅ Aannemer (aannemer@test.nl) - AANWEZIG');
      } else {
        console.log('   ❌ Aannemer (aannemer@test.nl) - NIET AANWEZIG');
      }
      console.log('');
    }

  } catch (error: any) {
    if (error.message?.includes("Can't reach database server")) {
      console.error('❌ Kan database niet bereiken!\n');
      console.error('💡 Oplossing:');
      console.error('   1. Start de database met: docker compose up -d');
      console.error('   2. Wacht tot de database klaar is');
      console.error('   3. Voer dit script opnieuw uit\n');
    } else {
      console.error('❌ Fout:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script gefaald:', error);
    process.exit(1);
  });

