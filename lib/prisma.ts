import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Support des variables d'environnement avec ou sans préfixe lana_
// Note: Le schema.prisma utilise POSTGRES_URL, mais on peut override ici
const getDatabaseUrl = () => {
  // Essayer POSTGRES_URL d'abord (standard), puis les variantes avec préfixe lana_
  return process.env.POSTGRES_URL || 
         (process.env as any).lana_POSTGRES_URL || 
         process.env.PRISMA_DATABASE_URL ||
         (process.env as any).lana_PRISMA_DATABASE_URL ||
         process.env.DATABASE_URL ||
         (process.env as any).lana_DATABASE_URL ||
         '';
};

// Si POSTGRES_URL n'est pas défini mais lana_POSTGRES_URL l'est, l'utiliser
if (!process.env.POSTGRES_URL && (process.env as any).lana_POSTGRES_URL) {
  process.env.POSTGRES_URL = (process.env as any).lana_POSTGRES_URL;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

