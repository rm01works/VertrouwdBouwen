/**
 * Script om testgebruikers aan te maken
 * Gebruik: npm run create-test-users
 * of: tsx scripts/create-test-users.ts
 * 
 * Zorg ervoor dat:
 * 1. De database draait (docker-compose up of lokale PostgreSQL)
 * 2. DATABASE_URL is ingesteld in .env file of als environment variable
 *    Voorbeeld: postgresql://vertrouwdbouwen:password@localhost:5432/vertrouwdbouwen
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { UserRole } from '@prisma/client';
import { prisma } from '../src/config/database';
import { hashPassword } from '../src/utils/bcrypt';

// Laad environment variables - probeer verschillende locaties
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config(); // Fallback naar standaard locatie

async function createTestUsers() {
  try {
    console.log('🚀 Testgebruikers aanmaken...\n');

    // Testgebruiker 1: Consument (CUSTOMER)
    const customerEmail = 'klant@test.nl';
    const customerPassword = 'Test1234'; // Voldoet aan requirements: min 8 tekens, hoofdletter, cijfer

    // Check of gebruiker al bestaat
    const existingCustomer = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (existingCustomer) {
      console.log(`⚠️  Consument met email ${customerEmail} bestaat al. Overslaan...`);
    } else {
      const customerPasswordHash = await hashPassword(customerPassword);
      
      const customer = await prisma.user.create({
        data: {
          email: customerEmail,
          passwordHash: customerPasswordHash,
          role: UserRole.CUSTOMER,
          firstName: 'Jan',
          lastName: 'Jansen',
          phone: '+31612345678',
        },
      });

      console.log('✅ Consument aangemaakt:');
      console.log(`   Email: ${customer.email}`);
      console.log(`   Wachtwoord: ${customerPassword}`);
      console.log(`   Naam: ${customer.firstName} ${customer.lastName}`);
      console.log(`   Rol: ${customer.role}\n`);
    }

    // Testgebruiker 2: Aannemer (CONTRACTOR)
    const contractorEmail = 'aannemer@test.nl';
    const contractorPassword = 'Test1234'; // Voldoet aan requirements: min 8 tekens, hoofdletter, cijfer

    // Check of gebruiker al bestaat
    const existingContractor = await prisma.user.findUnique({
      where: { email: contractorEmail },
    });

    if (existingContractor) {
      console.log(`⚠️  Aannemer met email ${contractorEmail} bestaat al. Overslaan...`);
    } else {
      const contractorPasswordHash = await hashPassword(contractorPassword);
      
      const contractor = await prisma.user.create({
        data: {
          email: contractorEmail,
          passwordHash: contractorPasswordHash,
          role: UserRole.CONTRACTOR,
          firstName: 'Piet',
          lastName: 'Bouwman',
          phone: '+31687654321',
          companyName: 'Bouwman & Zonen BV',
          kvkNumber: '12345678',
        },
      });

      console.log('✅ Aannemer aangemaakt:');
      console.log(`   Email: ${contractor.email}`);
      console.log(`   Wachtwoord: ${contractorPassword}`);
      console.log(`   Naam: ${contractor.firstName} ${contractor.lastName}`);
      console.log(`   Bedrijf: ${contractor.companyName}`);
      console.log(`   KVK: ${contractor.kvkNumber}`);
      console.log(`   Rol: ${contractor.role}\n`);
    }

    // Admin gebruiker
    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin';

    // Check of admin al bestaat
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin met email ${adminEmail} bestaat al. Overslaan...`);
    } else {
      const adminPasswordHash = await hashPassword(adminPassword);
      
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: adminPasswordHash,
          role: UserRole.ADMIN,
          firstName: 'Admin',
          lastName: 'User',
        },
      });

      console.log('✅ Admin aangemaakt:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Wachtwoord: ${adminPassword}`);
      console.log(`   Naam: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Rol: ${admin.role}\n`);
    }

    console.log('✨ Klaar! Je kunt nu inloggen met:');
    console.log('\n📧 Consument:');
    console.log(`   Email: ${customerEmail}`);
    console.log(`   Wachtwoord: ${customerPassword}`);
    console.log('\n📧 Aannemer:');
    console.log(`   Email: ${contractorEmail}`);
    console.log(`   Wachtwoord: ${contractorPassword}`);
    console.log('\n👑 Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Wachtwoord: ${adminPassword}\n`);

  } catch (error: any) {
    console.error('❌ Fout bij aanmaken testgebruikers:', error.message);
    
    if (error.message?.includes("Can't reach database server")) {
      console.error('\n💡 Oplossing:');
      console.error('   1. Start de database met: docker-compose up -d');
      console.error('   2. Wacht tot de database klaar is');
      console.error('   3. Voer dit script opnieuw uit\n');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run het script
createTestUsers()
  .then(() => {
    console.log('✅ Script succesvol afgerond');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script gefaald:', error);
    process.exit(1);
  });
