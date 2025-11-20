import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';

export interface RegisterDto {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
  kvkNumber?: string;
  phone?: string;
  address?: Record<string, any>;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    companyName?: string | null;
    phone?: string | null;
  };
  token: string;
}

/**
 * Registreer een nieuwe gebruiker
 */
export async function register(data: RegisterDto): Promise<AuthResponse> {
  console.log('───────────────────────────────────────────────────────────');
  console.log('🔍 AUTH SERVICE - REGISTER - Start');
  console.log('───────────────────────────────────────────────────────────');
  console.log('📥 Ontvangen data:', {
    email: data.email,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
    hasPassword: !!data.password,
    passwordLength: data.password?.length || 0,
    phone: data.phone || '(niet opgegeven)',
    companyName: data.companyName || '(niet opgegeven)',
    kvkNumber: data.kvkNumber || '(niet opgegeven)',
  });
  
  // Valideer dat aannemers bedrijfsnaam hebben
  console.log('🔍 Validatie: Controleren aannemer vereisten...');
  if (data.role === UserRole.CONTRACTOR && !data.companyName) {
    console.log('❌ Validatie fout: Bedrijfsnaam ontbreekt voor aannemer');
    throw new ValidationError('Bedrijfsnaam is verplicht voor aannemers');
  }
  console.log('✅ Validatie: Aannemer vereisten OK');

  // Check of email al bestaat
  console.log('🔍 Database: Controleren of email al bestaat...');
  console.log('   Email:', data.email);
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log('❌ Database: Email is al in gebruik');
      console.log('   Bestaande gebruiker ID:', existingUser.id);
      throw new ConflictError('Email is al in gebruik');
    }
    console.log('✅ Database: Email is beschikbaar');
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    console.error('❌ Database: Fout bij controleren email:', error);
    throw error;
  }

  // Hash wachtwoord
  console.log('🔐 Wachtwoord: Hashen gestart...');
  let passwordHash: string;
  try {
    passwordHash = await hashPassword(data.password);
    console.log('✅ Wachtwoord: Hash succesvol (lengte:', passwordHash.length, 'karakters)');
  } catch (error) {
    console.error('❌ Wachtwoord: Hash mislukt:', error);
    throw new Error('Wachtwoord hashen mislukt');
  }

  // Maak gebruiker aan
  console.log('💾 Database: Gebruiker aanmaken...');
  console.log('   Data die wordt opgeslagen:', {
    email: data.email,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
    hasPasswordHash: !!passwordHash,
    phone: data.phone || null,
    companyName: data.companyName || null,
    kvkNumber: data.kvkNumber || null,
  });
  
  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        kvkNumber: data.kvkNumber,
        phone: data.phone,
        address: data.address,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        companyName: true,
        phone: true,
        createdAt: true,
      },
    });
    console.log('✅ Database: Gebruiker succesvol aangemaakt!');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Rol:', user.role);
    console.log('   Aangemaakt op:', user.createdAt);
  } catch (error: any) {
    console.error('❌ Database: Fout bij aanmaken gebruiker!');
    console.error('   Error code:', error?.code);
    console.error('   Error message:', error?.message);
    console.error('   Error meta:', error?.meta);
    console.error('   Full error:', error);
    throw error;
  }

  // Genereer JWT token
  console.log('🎫 JWT: Token genereren...');
  let token: string;
  try {
    token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    console.log('✅ JWT: Token succesvol gegenereerd (lengte:', token.length, 'karakters)');
  } catch (error) {
    console.error('❌ JWT: Token genereren mislukt:', error);
    throw new Error('Token genereren mislukt');
  }

  console.log('───────────────────────────────────────────────────────────');
  console.log('✅ AUTH SERVICE - REGISTER - Succesvol voltooid');
  console.log('───────────────────────────────────────────────────────────');

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      phone: user.phone,
    },
    token,
  };
}

/**
 * Login gebruiker
 */
export async function login(data: LoginDto): Promise<AuthResponse> {
  console.log('🔍 Zoeken naar gebruiker met email:', data.email);
  
  // Zoek gebruiker
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    console.log('❌ Gebruiker niet gevonden:', data.email);
    throw new UnauthorizedError('Gebruiker niet gevonden. Controleer uw email adres.');
  }

  console.log('✅ Gebruiker gevonden:', { userId: user.id, email: user.email });

  // Verifieer wachtwoord
  console.log('🔐 Wachtwoord verifiëren...');
  const isValidPassword = await comparePassword(data.password, user.passwordHash);

  if (!isValidPassword) {
    console.log('❌ Wachtwoord onjuist voor gebruiker:', data.email);
    throw new UnauthorizedError('Wachtwoord onjuist. Probeer het opnieuw.');
  }

  console.log('✅ Wachtwoord correct, token genereren...');

  // Genereer JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      phone: user.phone,
    },
    token,
  };
}

/**
 * Haal gebruiker op via ID
 */
export async function getUserById(userId: string) {
  try {
    console.log('🔍 getUserById: Zoeken naar gebruiker met ID:', userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        companyName: true,
        kvkNumber: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log('❌ getUserById: Gebruiker niet gevonden met ID:', userId);
      throw new NotFoundError('Gebruiker niet gevonden');
    }

    console.log('✅ getUserById: Gebruiker gevonden:', { id: user.id, email: user.email });
    return user;
  } catch (error) {
    console.error('❌ getUserById: Database fout');
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    // Check for database connection errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConnectionError = 
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes('P1001') || // Prisma connection error code
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('Connection refused') ||
      errorMessage.includes('connect ECONNREFUSED') ||
      errorMessage.includes('does not exist') ||
      errorMessage.includes('authentication failed');
    
    if (isConnectionError) {
      console.error('❌ Database verbindingsfout gedetecteerd');
      throw new Error('Kan niet verbinden met de database. Controleer of PostgreSQL draait en of DATABASE_URL correct is ingesteld.');
    }
    
    // Wrap other errors
    throw new Error(`Database fout bij ophalen gebruiker: ${errorMessage}`);
  }
}

