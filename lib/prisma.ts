import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Support des variables d'environnement avec ou sans préfixe lana_
// Le schema.prisma utilise POSTGRES_URL, donc on doit définir cette variable
// si elle n'existe pas mais que lana_POSTGRES_URL existe
if (!process.env.POSTGRES_URL) {
  // Essayer les variantes avec préfixe lana_ ou autres formats
  const dbUrl = (process.env as any).lana_POSTGRES_URL || 
                process.env.PRISMA_DATABASE_URL ||
                (process.env as any).lana_PRISMA_DATABASE_URL ||
                process.env.DATABASE_URL ||
                (process.env as any).lana_DATABASE_URL;
  
  if (dbUrl) {
    // Définir POSTGRES_URL pour que Prisma puisse l'utiliser
    process.env.POSTGRES_URL = dbUrl;
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

